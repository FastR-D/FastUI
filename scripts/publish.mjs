import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { performance } from 'node:perf_hooks'
import './check-registry.mjs'

const registry = 'https://registry.npmjs.org'
const repository = 'FastR-D/FastUI'
const hash = (algorithm, bytes, encoding = 'hex') => createHash(algorithm).update(bytes).digest(encoding)
const json = async path => JSON.parse(await readFile(path, 'utf8'))
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
const manifests = await Promise.all(['foundation', 'vue', 'react'].map(async name => {
  const manifest = await json(`packages/${name}/package.json`)
  if (manifest.name !== `@fastrd/ui-${name}` || manifest.repository?.url !== `git+https://github.com/${repository}.git`
      || manifest.repository?.directory !== `packages/${name}`) throw new Error(`Unexpected source package identity: ${name}`)
  return manifest
}))
const version = manifests[0].version
if (manifests.some(manifest => manifest.version !== version || (manifest !== manifests[0] && manifest.dependencies?.['@fastrd/ui-foundation'] !== version))) {
  throw new Error('All three source versions and exact internal dependencies must match')
}
const tag = `refs/tags/v${version}`
const tagPush = process.env.GITHUB_EVENT_NAME === 'push' && process.env.GITHUB_REF === tag
const retry = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch' && process.env.GITHUB_REF === 'refs/heads/main'
  && process.env.FASTUI_RELEASE_TAG === `v${version}`
if (process.env.GITHUB_REPOSITORY !== repository || (!tagPush && !retry)) {
  throw new Error(`Publication requires ${repository} tag-push context at ${tag} or an explicit main-branch retry of that tag`)
}
const tagCommit = git('rev-parse', `${tag}^{commit}`)
const commit = git('rev-parse', 'HEAD')
if (tagPush && (commit !== tagCommit || process.env.GITHUB_SHA !== commit)) throw new Error('Tag commit must equal HEAD and GITHUB_SHA')
if (retry) {
  if (commit !== process.env.GITHUB_SHA) throw new Error('Dispatch HEAD must equal GITHUB_SHA')
  if (spawnSync('git', ['merge-base', '--is-ancestor', tagCommit, commit]).status !== 0) throw new Error('Tag commit must be an ancestor of retry HEAD')
  // Recover release infrastructure without moving an immutable tag or changing
  // any package/build input. All other changes require a new package version.
  const recoveryFiles = new Set(['.github/workflows/publish.yml', 'scripts/publish.mjs', 'scripts/publish.test.mjs', 'README.md', 'RELEASING.md'])
  const changed = git('diff', '--name-only', tagCommit, commit).split('\n').filter(Boolean)
  if (changed.some(path => !recoveryFiles.has(path))) throw new Error('Retry changed release payload or build inputs; use a new version')
}
if (git('status', '--porcelain', '--untracked-files=all')) throw new Error('Refusing publication from dirty source')
if (spawnSync('git', ['merge-base', '--is-ancestor', commit, 'refs/remotes/origin/main']).status !== 0) throw new Error('Publication commit must belong to origin/main history')
console.log(`Release source verified: ${repository} ${tag} commit=${commit} tagCommit=${tagCommit}; clean; ancestor of origin/main; ${retry ? 'unchanged-payload retry' : 'tag push'}`)

if (process.argv[2] !== '--check-source') {
  const directory = `artifacts/${version}`
  const packageBytes = await readFile(`${directory}/packages.json`)
  const packages = JSON.parse(packageBytes)
  if (!Array.isArray(packages) || packages.length !== manifests.length || new Set(packages.map(pkg => pkg.name)).size !== manifests.length) {
    throw new Error('Verification must list exactly the three expected packages without duplicates')
  }
  const results = await json(`${directory}/results.json`)
  if (results.status !== 'passed' || results.scenarios?.length !== 65 || results.packagesSha256 !== hash('sha256', packageBytes)) {
    throw new Error('Passing 65-scenario verification must bind the exact packages.json digest')
  }
  // Validate the whole fixed package set before the first registry write.
  const candidates = await Promise.all(manifests.map(async source => {
    const pkg = packages.find(pkg => pkg.name === source.name)
    const file = `${source.name.slice(1).replace('/', '-')}-${version}.tgz`
    if (!pkg || pkg.version !== version || pkg.file !== file) throw new Error(`Unexpected verified package: ${source.name}`)
    const archive = `${directory}/${file}`
    const bytes = await readFile(archive)
    if (hash('sha256', bytes) !== pkg.sha256) throw new Error(`Verified SHA-256 differs: ${archive}`)
    const manifest = JSON.parse(execFileSync('tar', ['-xOf', archive, 'package/package.json'], { encoding: 'utf8' }))
    if (manifest.name !== source.name || manifest.version !== version || manifest.repository?.url !== source.repository.url
        || manifest.repository?.directory !== source.repository.directory
        || (source !== manifests[0] && manifest.dependencies?.['@fastrd/ui-foundation'] !== version)) {
      throw new Error(`Packed manifest differs from source contract: ${source.name}`)
    }
    return { name: source.name, archive, integrity: `sha512-${hash('sha512', bytes, 'base64')}` }
  }))
  const metadata = async (candidate, timeoutMs = 15000) => {
    const response = await fetch(`${registry}/${encodeURIComponent(candidate.name)}/${version}`, { signal: AbortSignal.timeout(timeoutMs), redirect: 'error' })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Registry lookup failed for ${candidate.name}: HTTP ${response.status}`)
    const published = await response.json()
    if (published.name !== candidate.name || published.version !== version || published.dist?.integrity !== candidate.integrity) {
      throw new Error(`Published version/integrity differs: ${candidate.name}@${version}`)
    }
    return published
  }
  for (const candidate of candidates) {
    const existing = await metadata(candidate)
    if (!existing) {
      const result = spawnSync('npm', ['publish', candidate.archive, '--access=public', '--provenance', '--registry=' + registry,
        '--tag=' + (version.includes('-') ? 'next' : 'latest')], { stdio: 'inherit' })
      if (result.status !== 0) throw new Error(`Publication failed: ${candidate.name}`)
    } else console.log(`Already published with identical integrity: ${candidate.name}@${version}`)
    // Registry processing can take minutes after npm reports success. Bound the
    // whole confirmation (including download) by elapsed time, retrying only 404.
    const deadline = performance.now() + 10 * 60 * 1000
    const deadlineError = new Error(`Public registry confirmation did not complete within 10 minutes: ${candidate.name}@${version}; rerun after propagation`)
    let published
    while (performance.now() < deadline) {
      const remaining = Math.floor(deadline - performance.now())
      if (remaining <= 0) break
      published = await metadata(candidate, Math.min(15000, remaining))
      if (published) break
      const wait = Math.min(15000, Math.max(0, deadline - performance.now()))
      if (wait <= 0) break
      console.log(`Public registry still processing ${candidate.name}@${version}; retry in ${wait}ms`)
      await delay(wait)
    }
    const remaining = Math.floor(deadline - performance.now())
    if (!published || remaining <= 0) throw deadlineError
    const tarball = new URL(published.dist.tarball)
    if (tarball.origin !== registry) throw new Error(`Tarball must use official npm: ${tarball}`)
    const download = await fetch(tarball, { signal: AbortSignal.timeout(Math.min(15000, remaining)), redirect: 'error' })
    if (!download.ok) throw new Error(`Public tarball download failed for ${candidate.name}: HTTP ${download.status}`)
    if (`sha512-${hash('sha512', Buffer.from(await download.arrayBuffer()), 'base64')}` !== candidate.integrity) throw new Error(`Public tarball integrity differs: ${candidate.name}`)
    if (performance.now() >= deadline) throw deadlineError
    console.log(`Public resolver confirmed ${candidate.name}@${version} ${candidate.integrity} commit=${commit}`)
  }
}
