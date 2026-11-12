import { cp, mkdir, readFile, readdir, writeFile, rm } from 'node:fs/promises'
import { spawn, spawnSync, execFileSync } from 'node:child_process'
import { resolve, join } from 'node:path'
import { createHash } from 'node:crypto'
import { createServer, preview } from 'vite'
import { chromium } from '@playwright/test'
import { runWorkbenchScenarios } from '../tests/workbench.mjs'
import { runScenarios } from '../tests/browser.mjs'
import { runDialogRegressions } from '../tests/dialog-regressions.mjs'
import { releaseFixture } from '../tests/release-fixture.mjs'
import './check-registry.mjs'

const root = process.cwd()
const pnpm = process.env.npm_execpath
if (!pnpm?.includes('pnpm')) throw new Error('Run through pnpm verify.')
const foundationManifest = JSON.parse(await readFile(resolve('packages/foundation/package.json'), 'utf8'))
const version = foundationManifest.version
const artifacts = resolve('artifacts', version)
const work = resolve('.verification')
await mkdir(artifacts, { recursive: true })
await rm(work, { recursive: true, force: true })
await mkdir(work, { recursive: true })
const packedDirectory = join(work, 'packed')
await mkdir(packedDirectory)
const run = (args, cwd) => {
  const result = args[0] === 'pack' ? spawnSync('npm', args, { cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }) : spawnSync(process.execPath, [pnpm, ...(cwd === root ? [] : ['--ignore-workspace']), ...args], { cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  if (args[0] !== 'pack') process.stdout.write(result.stdout ?? '')
  process.stderr.write(result.stderr ?? '')
  if (result.status !== 0) throw new Error(`package command ${args.join(' ')} failed in ${cwd}`)
  return result.stdout
}
run(['run', 'build'], root)
const publicPackages = []
for (const name of ['foundation', 'vue', 'react']) {
  const directory = resolve('packages', name)
  const packed = JSON.parse(run(['pack', '--json', '--pack-destination', packedDirectory], directory))[0]
  console.log(`Packed ${packed.filename}: ${packed.entryCount} entries, ${packed.size} bytes`)
  const archive = join(artifacts, packed.filename)
  const stagedArchive = join(packedDirectory, packed.filename)
  const bytes = await readFile(stagedArchive)
  const existing = await readFile(archive).catch(error => { if (error.code !== 'ENOENT') throw error; return null })
  if (existing && !existing.equals(bytes)) throw new Error(`Refusing to replace existing candidate bytes: ${archive}`)
  const shippedManifest = JSON.parse(execFileSync('tar', ['-xOf', stagedArchive, 'package/package.json'], { encoding: 'utf8' }))
  if (shippedManifest.name !== `@fastrd/ui-${name}` || shippedManifest.version !== version) throw new Error('Public package identity differs')
  if (name !== 'foundation' && shippedManifest.dependencies['@fastrd/ui-foundation'] !== version) throw new Error('Public tarball foundation dependency is not the exact registry version')
  if (!existing) await cp(stagedArchive, archive, { errorOnExist: true, force: false })
  publicPackages.push({ name: packed.name, version: packed.version, file: packed.filename,
    sha256: createHash('sha256').update(bytes).digest('hex'), files: packed.files.map(file => file.path).sort() })
}
await writeFile(join(artifacts, 'packages.json'), JSON.stringify(publicPackages, null, 2) + '\n')
const packagesSha256 = createHash('sha256').update(await readFile(join(artifacts, 'packages.json'))).digest('hex')
const staticName = `static-${version}`
const staticArchive = `fastui-static-${version}.tar.gz`
const staticDirectory = join(artifacts, staticName)
await rm(staticDirectory, { recursive: true, force: true })
await cp(resolve('packages/foundation/dist'), staticDirectory, { recursive: true })
for (const file of ['README.md', 'LICENSE', 'NOTICE.md']) await cp(resolve('packages/foundation', file), join(staticDirectory, file))
const staticFiles = (await readdir(staticDirectory)).sort()
const staticManifest = { version, scope: 'all archive payload files except manifest.json itself', files: [] }
for (const file of staticFiles) staticManifest.files.push({ file, sha256: createHash('sha256').update(await readFile(join(staticDirectory, file))).digest('hex') })
await writeFile(join(staticDirectory, 'manifest.json'), JSON.stringify(staticManifest, null, 2) + '\n')
execFileSync('tar', ['-czf', join(artifacts, staticArchive), '-C', artifacts, staticName])
const releaseFiles = [...publicPackages.map(pkg => pkg.file), staticArchive]
await writeFile(join(artifacts, 'SHA256SUMS'), (await Promise.all(releaseFiles.map(async file =>
  `${createHash('sha256').update(await readFile(join(artifacts, file))).digest('hex')}  ${file}`))).join('\n') + '\n')
const servers = []
const devServers = []
let browser
const fixture = await releaseFixture(publicPackages.map(pkg => join(artifacts, pkg.file)))
const install = directory => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [pnpm, 'install', '--ignore-workspace', '--no-frozen-lockfile', '--store-dir', join(directory, '.pnpm-store')], {
    cwd: directory, env: { ...process.env, ...fixture.environment, npm_config_manage_package_manager_versions: 'false', npm_config_verify_deps_before_run: 'false' }, stdio: ['ignore', 'pipe', 'pipe'],
  })
  let output = ''
  child.stdout.on('data', data => { output += data; process.stdout.write(data) })
  child.stderr.on('data', data => process.stderr.write(data))
  child.on('error', reject)
  child.on('exit', code => code === 0 ? resolve(output) : reject(new Error(`Clean install failed in ${directory}: ${code}`)))
})
try {
  const urls = {}
  for (const name of ['vue', 'react', 'html', 'react18']) {
    const directory = join(work, name)
    await cp(resolve('examples', name === 'react18' ? 'react' : name), directory, { recursive: true })
    if (name === 'react18') {
      const path = join(directory, 'package.json')
      const manifest = JSON.parse(await readFile(path, 'utf8'))
      Object.assign(manifest.dependencies, { react: '18.3.1', 'react-dom': '18.3.1' })
      Object.assign(manifest.devDependencies, { '@types/react': '~18.3.0', '@types/react-dom': '~18.3.0' })
      await writeFile(path, JSON.stringify(manifest, null, 2) + '\n')
    }
    // An isolated pnpm store forces registry resolution and original candidate downloads.
    const installLog = await install(directory)
    const installed = JSON.parse(await readFile(join(directory, 'node_modules/@fastrd/ui-foundation/package.json'), 'utf8'))
    if (installed.version !== foundationManifest.version) throw new Error('Installed foundation version differs')
    for (const dependency of ['vite', ...(name === 'html' ? [] : ['typescript'])]) {
      await readFile(join(directory, 'node_modules', dependency, 'package.json'))
    }
    const tree = run(['list', '@fastrd/ui-foundation', '--json'], directory)
    if (JSON.parse(tree)[0]?.dependencies?.['@fastrd/ui-foundation']?.version !== version) throw new Error('Isolated pnpm dependency tree differs')
    const build = run(['run', 'build'], directory)
    execFileSync(process.execPath, ['--input-type=module', '-e', `import('@fastrd/ui-foundation').then(module => { if (typeof module.initColorMode !== 'function') throw new Error('Missing SSR-safe export') })`], { cwd: directory, stdio: 'inherit' })
    await writeFile(join(artifacts, `${name}-build.log`), installLog + build + tree)
    // Vite serves the built files only. It cannot resolve a source-code alias.
    const server = await preview({ configFile: false, root: directory, preview: { host: '127.0.0.1', port: 4173 + servers.length } })
    servers.push(server)
    urls[name] = `http://127.0.0.1:${server.httpServer.address().port}`
  }
  const bootstrap = join(work, 'bootstrap')
  await mkdir(bootstrap)
  await writeFile(join(bootstrap, 'package.json'), JSON.stringify({ name: 'fastui-framework-only-bootstrap', private: true,
    dependencies: Object.fromEntries(publicPackages.filter(pkg => pkg.name !== foundationManifest.name).map(pkg =>
      [pkg.name, pkg.version])),
  }, null, 2) + '\n')
  const bootstrapInstall = await install(bootstrap)
  const bootstrapTree = run(['list', '@fastrd/ui-foundation', '--depth', 'Infinity', '--json'], bootstrap)
  await writeFile(join(artifacts, 'bootstrap-install.log'), bootstrapInstall + bootstrapTree)
  await writeFile(join(artifacts, 'bootstrap-result.json'), JSON.stringify({ status: 'passed',
    authority: 'pnpm install/pnpm list against candidate registry fixture with public npm passthrough; publication pending',
    foundationExplicitlyInstalled: false, packages: publicPackages, tree: JSON.parse(bootstrapTree),
  }, null, 2) + '\n')
  // StrictMode ref/effect replay is a development behavior. These servers still
  // resolve installed tarballs, never package source aliases.
  process.env.NODE_ENV = 'development'
  for (const framework of ['react', 'react18']) {
    const server = await createServer({ configFile: join(work, framework, 'vite.config.ts'), root: join(work, framework), server: { host: '127.0.0.1', port: 4273 + devServers.length } })
    await server.listen()
    devServers.push(server)
    urls[`${framework}-dev`] = `http://127.0.0.1:${server.httpServer.address().port}`
  }
  browser = await chromium.launch({ headless: true })
  const scenarios = [...await runWorkbenchScenarios(browser, urls), ...await runDialogRegressions(browser, urls, artifacts), ...await runScenarios(browser, urls, artifacts)]
  for (const pkg of publicPackages) {
    const downloads = fixture.requests.filter(request => request.kind === 'tarball' && request.name === pkg.name)
    const expected = pkg.name === foundationManifest.name ? 5 : pkg.name === '@fastrd/ui-react' ? 3 : 2
    if (downloads.length !== expected || downloads.some(request => request.sha256 !== pkg.sha256)) throw new Error(`Original candidate download coverage differs for ${pkg.name}`)
  }
  await writeFile(join(artifacts, 'results.json'), JSON.stringify({ status: 'passed', packagesSha256, consumers: ['html', 'react', 'react18', 'vue'], registryDownload: { authority: 'candidate registry fixture with public npm passthrough; publication pending', passthroughRequests: fixture.passthroughRequests, requests: fixture.requests }, scenarios: scenarios.sort() }, null, 2) + '\n')
  console.log(`PASS: ${scenarios.length} published-consumer scenarios; evidence in ${artifacts}`)
} finally {
  await browser?.close()
  await Promise.all(devServers.map(server => server.close()))
  await Promise.all(servers.map(server => new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()))))
  await fixture.close()
}
