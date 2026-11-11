import { parse } from 'yaml'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { SourceTextModule, SyntheticModule, createContext } from 'node:vm'

// Execute the unmodified publication entry. Git, npm process execution and
// registry transport are controlled external boundaries; no real writes/auth.
const version = JSON.parse(await readFile('packages/foundation/package.json', 'utf8')).version
const directory = `artifacts/${version}`
const packageBytes = await readFile(`${directory}/packages.json`)
const packages = JSON.parse(packageBytes)
const archives = new Map(await Promise.all(packages.map(async pkg => [pkg.name, await readFile(`${directory}/${pkg.file}`)])))
const sha = bytes => createHash('sha256').update(bytes).digest('hex')

async function scenario(options = {}) {
  const events = []
  let clock = 0
  const uploaded = new Set(options.existing ? packages.map(pkg => pkg.name) : [])
  const uploadedAt = new Map([...uploaded].map(name => [name, 0]))
  const spend = (ms, signal) => {
    const remaining = Math.max(0, signal.expiresAt - clock)
    if (ms >= remaining && !options.ignoreAbort) {
      clock += remaining
      throw new DOMException('Registry request timed out', 'TimeoutError')
    }
    clock += ms
  }
  const env = { GITHUB_REPOSITORY: 'FastR-D/FastUI', GITHUB_EVENT_NAME: 'push', GITHUB_REF: `refs/tags/v${version}`,
    GITHUB_SHA: 'a'.repeat(40), npm_execpath: 'fixture-npm', ...options.env }
  const records = structuredClone(packages)
  options.packages?.(records)
  const bytes = Buffer.from(JSON.stringify(records))
  const results = { status: 'passed', scenarios: Array.from({ length: 62 }, (_, i) => `scenario-${i}`), packagesSha256: sha(bytes) }
  options.results?.(results)
  const context = createContext({ Buffer, URL, AbortSignal: { timeout: timeoutMs => ({ timeoutMs, expiresAt: clock + timeoutMs }) }, process: { env, argv: ['node', 'scripts/publish.mjs'], execPath: process.execPath },
    console: { log: (...args) => events.push(['log', args.join(' ')]) },
    fetch: async (url, { signal }) => {
      assert.ok(signal.timeoutMs > 0 && signal.timeoutMs <= 15000)
      assert.equal(new URL(url).origin, 'https://registry.npmjs.org')
      const path = decodeURIComponent(new URL(url).pathname)
      const pkg = packages.find(pkg => path.startsWith(`/${pkg.name}/`))
      assert.ok(pkg, `Unexpected registry request: ${path}`)
      events.push(['request', { name: pkg.name, at: clock, budget: signal.timeoutMs, kind: path.endsWith('.tgz') ? 'download' : 'metadata' }])
      if (path.endsWith('.tgz')) {
        events.push(['download', pkg.name])
        if (options.abortDownload) throw new DOMException('Download interrupted', 'AbortError')
        spend(options.downloadDurationMs || 0, signal)
        return new Response(options.corruptDownload ? 'corrupt' : archives.get(pkg.name), { status: options.downloadStatus || 200 })
      }
      events.push(['metadata', pkg.name])
      if (options.lookupError) throw new Error('Registry timeout')
      if (options.lookupStatus) return new Response('', { status: options.lookupStatus })
      if (uploaded.has(pkg.name)) {
        if (options.abortLookup) throw new DOMException('Lookup interrupted', 'AbortError')
        spend(options.metadataDurationMs || 0, signal)
        if (options.postUploadStatus) return new Response('', { status: options.postUploadStatus })
      }
      if (options.alwaysMissing || !uploaded.has(pkg.name) || clock - uploadedAt.get(pkg.name) < (options.visibleAfterMs || 0)) return new Response('', { status: 404 })
      const published = { name: pkg.name, version, dist: {
        integrity: `sha512-${createHash('sha512').update(archives.get(pkg.name)).digest('base64')}`,
        tarball: `https://registry.npmjs.org/${pkg.name}/-/${pkg.file}`,
      } }
      options.metadata?.(published)
      const response = Response.json(published)
      response.json = async () => { spend(options.metadataBodyMs || 0, signal); return published }
      return response
    },
  })
  const externals = {
    'node:fs/promises': { readFile: async (path, encoding) => {
      if (path === `${directory}/packages.json`) return bytes
      if (path === `${directory}/results.json`) return JSON.stringify(results)
      const value = await readFile(path, encoding)
      if (options.mirrorLock && path === 'pnpm-lock.yaml') return value.replaceAll('https://registry.npmjs.org', 'https://mirror.invalid')
      return value
    } },
    'node:crypto': { createHash },
    'yaml': { parse },
    'node:perf_hooks': { performance: { now: () => clock } },
    'node:timers/promises': { setTimeout: async ms => {
      events.push(['delay', ms])
      if (options.abortDelay) throw new DOMException('Propagation wait interrupted', 'AbortError')
      clock += ms + (options.oversleepMs || 0)
    } },
    'node:child_process': {
      execFileSync: (command, args, config) => {
        if (command === 'git') {
          if (args[0] === 'status') return options.dirty || ''
          if (args[0] === 'rev-parse') return args[1] === 'HEAD' && options.wrongHead ? 'b'.repeat(40) : 'a'.repeat(40)
          throw new Error(`Unexpected git command: ${args}`)
        }
        assert.equal(command, 'tar')
        const manifest = JSON.parse(execFileSync(command, args, config))
        options.packed?.(manifest)
        return JSON.stringify(manifest)
      },
      spawnSync: (command, args) => {
        if (command === 'git') return { status: options.offMain ? 1 : 0 }
        assert.equal(command, 'npm')
        assert.equal(args[0], 'publish')
        const pkg = packages.find(pkg => args[1].endsWith(pkg.file))
        events.push(['publish', pkg.name])
        uploaded.add(pkg.name)
        uploadedAt.set(pkg.name, clock)
        return { status: options.publishFailure ? 1 : 0 }
      },
    },
  }
  const modules = new Map()
  const load = async specifier => {
    if (modules.has(specifier)) return modules.get(specifier)
    const module = externals[specifier]
      ? new SyntheticModule(Object.keys(externals[specifier]), function () {
        for (const [key, value] of Object.entries(externals[specifier])) this.setExport(key, value)
      }, { context })
      : new SourceTextModule(await readFile(specifier === './check-registry.mjs' ? 'scripts/check-registry.mjs' : 'scripts/publish.mjs', 'utf8'), { context })
    modules.set(specifier, module)
    return module
  }
  try {
    const entry = await load('entry')
    await entry.link(load)
    await entry.evaluate()
    return { events, clock }
  } catch (error) { return { events, clock, error } }
}

test('foundation public tarball is confirmed before either framework publish', async () => {
  const { events, error } = await scenario()
  assert.ifError(error)
  const actions = events.filter(([kind]) => ['publish', 'download'].includes(kind))
  assert.deepEqual(actions, packages.flatMap(pkg => [['publish', pkg.name], ['download', pkg.name]]))
})

test('identical existing versions are downloaded and checked without writes', async () => {
  const { events, error } = await scenario({ existing: true })
  assert.ifError(error)
  assert.equal(events.filter(([kind]) => kind === 'publish').length, 0)
  assert.equal(events.filter(([kind]) => kind === 'download').length, 3)
})

test('four-minute propagation for each package still confirms tarballs before continuing', async () => {
  const { events, clock, error } = await scenario({ visibleAfterMs: 240000 })
  assert.ifError(error)
  assert.equal(clock, 720000)
  assert.ok(events.filter(([kind]) => kind === 'delay').every(([, ms]) => ms === 15000))
  assert.deepEqual(events.filter(([kind]) => ['publish', 'download'].includes(kind)),
    packages.flatMap(pkg => [['publish', pkg.name], ['download', pkg.name]]))
})

test('observed 4m7s propagation completes without a fixed attempt limit', async () => {
  const { events, clock, error } = await scenario({ visibleAfterMs: 247000 })
  assert.ifError(error)
  assert.equal(clock, 765000)
  assert.equal(events.filter(([kind]) => kind === 'download').length, 3)
})

test('metadata and tarball requests use the remaining window near its deadline', async () => {
  const { events, clock, error } = await scenario({ visibleAfterMs: 590000, metadataDurationMs: 1000, downloadDurationMs: 6000 })
  assert.ifError(error)
  assert.equal(clock, 3 * 599000)
  const downloads = events.filter(([kind, request]) => kind === 'request' && request.kind === 'download')
  assert.deepEqual(downloads.map(([, request]) => request.budget), [7000, 7000, 7000])
})

test('404 waits consume request time and shorten the final sleep to the deadline', async () => {
  const { events, clock, error } = await scenario({ alwaysMissing: true, metadataDurationMs: 1000 })
  assert.match(error.message, /within 10 minutes/)
  assert.equal(clock, 600000)
  assert.equal(events.filter(([kind]) => kind === 'delay').at(-1)[1], 7000)
  assert.equal(events.filter(([kind]) => kind === 'publish').length, 1)
  assert.ok(events.filter(([kind]) => kind === 'request').every(([, request]) => request.at < 600000))
})

test('a slow final metadata request is aborted at the remaining wall-clock budget', async () => {
  const { events, clock, error } = await scenario({ alwaysMissing: true, metadataDurationMs: 8000 })
  assert.equal(error.name, 'TimeoutError')
  assert.equal(clock, 600000)
  assert.equal(events.filter(([kind]) => kind === 'request').at(-1)[1].budget, 2000)
  assert.equal(events.filter(([kind]) => kind === 'publish').length, 1)
})

test('response headers and metadata body share one request timeout without retry', async () => {
  const { events, clock, error } = await scenario({ metadataDurationMs: 10000, metadataBodyMs: 6000 })
  assert.equal(error.name, 'TimeoutError')
  assert.equal(clock, 15000)
  assert.equal(events.filter(([kind]) => kind === 'delay').length, 0)
  assert.equal(events.filter(([kind]) => kind === 'publish').length, 1)
})

test('tarball download is aborted when the remaining confirmation window expires', async () => {
  const { events, clock, error } = await scenario({ visibleAfterMs: 590000, metadataDurationMs: 1000, downloadDurationMs: 8000 })
  assert.equal(error.name, 'TimeoutError')
  assert.equal(clock, 600000)
  assert.equal(events.filter(([kind]) => kind === 'request').at(-1)[1].budget, 7000)
  assert.equal(events.filter(([kind]) => kind === 'publish').length, 1)
})

test('event-loop oversleep never permits a new request after the deadline', async () => {
  const { events, clock, error } = await scenario({ alwaysMissing: true, oversleepMs: 600000 })
  assert.match(error.message, /within 10 minutes/)
  assert.equal(clock, 615000)
  assert.equal(events.filter(([kind]) => kind === 'metadata').length, 2)
  assert.equal(events.filter(([kind]) => kind === 'delay').length, 1)
  assert.equal(events.filter(([kind]) => kind === 'publish').length, 1)
})

for (const [name, options] of [
  ['late metadata body', { metadataBodyMs: 600000 }],
  ['late tarball body', { downloadDurationMs: 600000 }],
]) test(`deadline rejects ${name} even when transport ignores its abort signal`, async () => {
  const { events, error } = await scenario({ ...options, ignoreAbort: true })
  assert.match(error.message, /within 10 minutes/)
  assert.equal(events.filter(([kind]) => kind === 'publish').length, 1)
})

for (const status of [401, 403, 429, 503]) test(`post-upload HTTP ${status} fails without propagation retry`, async () => {
  const { events, error } = await scenario({ postUploadStatus: status })
  assert.match(error.message, new RegExp(`HTTP ${status}`))
  assert.equal(events.filter(([kind]) => kind === 'metadata').length, 2)
  assert.equal(events.filter(([kind]) => kind === 'delay').length, 0)
  assert.equal(events.filter(([kind]) => kind === 'publish').length, 1)
})

for (const [name, options] of [
  ['metadata lookup', { abortLookup: true }],
  ['404 wait', { abortDelay: true, visibleAfterMs: 240000 }],
  ['tarball download', { abortDownload: true }],
]) test(`interrupted ${name} propagates AbortError without retry or framework publication`, async () => {
  const { events, error } = await scenario(options)
  assert.equal(error.name, 'AbortError')
  assert.equal(events.filter(([kind]) => kind === 'metadata').length, 2)
  assert.equal(events.filter(([kind]) => kind === 'publish').length, 1)
  assert.equal(events.filter(([kind]) => kind === 'delay').length, options.abortDelay ? 1 : 0)
})

test('integrity stays strict after four minutes of 404 propagation', async () => {
  const { events, clock, error } = await scenario({ visibleAfterMs: 240000, metadata: manifest => { manifest.dist.integrity = 'sha512-wrong' } })
  assert.match(error.message, /version\/integrity differs/)
  assert.equal(clock, 240000)
  assert.equal(events.filter(([kind]) => kind === 'publish').length, 1)
  assert.equal(events.filter(([kind]) => kind === 'download').length, 0)
})

// Failure classes: source identity/cleanliness, complete verified package set,
// packed identity/digest, and registry visibility/integrity/transport failures.
const rejections = [
  ['wrong repository', { env: { GITHUB_REPOSITORY: 'Other/Repo' } }, /tag-push/, 0],
  ['wrong event', { env: { GITHUB_EVENT_NAME: 'workflow_dispatch' } }, /tag-push/, 0],
  ['wrong tag', { env: { GITHUB_REF: 'refs/tags/v9.9.9' } }, /tag-push/, 0],
  ['wrong GitHub SHA', { env: { GITHUB_SHA: 'b'.repeat(40) } }, /Tag commit/, 0],
  ['wrong HEAD', { wrongHead: true }, /Tag commit/, 0],
  ['dirty tracked source', { dirty: ' M packages/react/package.json' }, /dirty source/, 0],
  ['untracked source', { dirty: '?? source.js' }, /dirty source/, 0],
  ['tag outside main', { offMain: true }, /origin\/main/, 0],
  ['mirror lock URL', { mirrorLock: true }, /official npm/, 0],
  ['empty verification list', { packages: rows => rows.splice(0) }, /exactly the three/, 0],
  ['duplicate package', { packages: rows => { rows[2] = rows[1] } }, /exactly the three/, 0],
  ['unknown package', { packages: rows => { rows[2].name = '@other/unknown' } }, /Unexpected verified/, 0],
  ['wrong package filename', { packages: rows => { rows[0].file = '../other.tgz' } }, /Unexpected verified/, 0],
  ['wrong verified digest', { packages: rows => { rows[0].sha256 = '0'.repeat(64) } }, /SHA-256 differs/, 0],
  ['unbound results', { results: result => { result.packagesSha256 = '0'.repeat(64) } }, /62-scenario verification/, 0],
  ['failed verification', { results: result => { result.status = 'failed' } }, /62-scenario verification/, 0],
  ['wrong packed name', { packed: manifest => { manifest.name = '@other/pkg' } }, /Packed manifest/, 0],
  ['wrong packed version', { packed: manifest => { manifest.version = '9.9.9' } }, /Packed manifest/, 0],
  ['wrong packed repository', { packed: manifest => { manifest.repository.url = 'git+https://other.invalid/x.git' } }, /Packed manifest/, 0],
  ['wrong packed internal dependency', { packed: manifest => { if (manifest.dependencies) manifest.dependencies['@fastrd/ui-foundation'] = '^' + version } }, /Packed manifest/, 0],
  ['registry non-404', { lookupStatus: 503 }, /HTTP 503/, 0],
  ['registry timeout', { lookupError: true }, /timeout/, 0],
  ['published metadata integrity mismatch', { existing: true, metadata: manifest => { manifest.dist.integrity = 'sha512-wrong' } }, /version\/integrity differs/, 0],
  ['publication failure', { publishFailure: true }, /Publication failed/, 1],
  ['public version remains absent', { alwaysMissing: true }, /within 10 minutes/, 1],
  ['post-upload wrong version', { metadata: manifest => { manifest.version = '9.9.9' } }, /version\/integrity differs/, 1],
  ['public tarball wrong origin', { metadata: manifest => { manifest.dist.tarball = 'https://other.invalid/a.tgz' } }, /official npm/, 1],
  ['public tarball HTTP error', { downloadStatus: 404 }, /download failed/, 1],
  ['public tarball corrupt', { corruptDownload: true }, /tarball integrity differs/, 1],
]
for (const [name, options, message, writes] of rejections) test(`rejects ${name}`, async () => {
  const { events, clock, error } = await scenario(options)
  assert.ok(error)
  assert.match(error.message, message)
  assert.equal(events.filter(([kind]) => kind === 'publish').length, writes)
  if (options.alwaysMissing) {
    assert.equal(clock, 600000)
    assert.equal(events.filter(([kind]) => kind === 'publish').length, 1)
    assert.ok(events.filter(([kind]) => kind === 'request').every(([, request]) => request.at < 600000))
  }
})
