import { cp, mkdir, readFile, readdir, writeFile, rm } from 'node:fs/promises'
import { spawn, spawnSync, execFileSync } from 'node:child_process'
import { resolve, join } from 'node:path'
import { createHash } from 'node:crypto'
import { createServer, preview } from 'vite'
import { chromium } from '@playwright/test'
import { runScenarios } from '../tests/browser.mjs'
import { runDialogRegressions } from '../tests/dialog-regressions.mjs'
import { releaseFixture } from '../tests/release-fixture.mjs'

const root = process.cwd()
const npm = process.env.npm_execpath
if (!npm) throw new Error('Run through npm run verify so the current npm CLI can be reused.')
const artifacts = resolve('artifacts')
const work = resolve('.verification')
await mkdir(artifacts, { recursive: true })
await rm(work, { recursive: true, force: true })
await mkdir(work, { recursive: true })
const run = (args, cwd) => {
  const result = spawnSync(process.execPath, [npm, ...args], { cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  if (args[0] !== 'pack') process.stdout.write(result.stdout ?? '')
  process.stderr.write(result.stderr ?? '')
  if (result.status !== 0) throw new Error(`npm ${args.join(' ')} failed in ${cwd}`)
  return result.stdout
}
run(['run', 'build'], root)
const publicPackages = []
const foundationManifest = JSON.parse(await readFile(resolve('packages/foundation/package.json'), 'utf8'))
const foundationURL = `https://github.com/FastR-D/FastUI/releases/download/v${foundationManifest.version}/fastrd-ui-foundation-${foundationManifest.version}.tgz`
for (const name of ['foundation', 'vue', 'react']) {
  const directory = resolve('packages', name)
  const packed = JSON.parse(run(['pack', '--json', '--pack-destination', artifacts], directory))[0]
  console.log(`Packed ${packed.filename}: ${packed.entryCount} entries, ${packed.size} bytes`)
  const archive = join(artifacts, packed.filename)
  const bytes = await readFile(archive)
  const shippedManifest = JSON.parse(execFileSync('tar', ['-xOf', archive, 'package/package.json'], { encoding: 'utf8' }))
  if (name !== 'foundation' && shippedManifest.dependencies['@fastrd/ui-foundation'] !== foundationURL) throw new Error('Public tarball dependency is not the versioned release URL')
  publicPackages.push({ name: packed.name, version: packed.version, file: packed.filename,
    sha256: createHash('sha256').update(bytes).digest('hex'), files: packed.files.map(file => file.path).sort() })
}
await writeFile(join(artifacts, 'packages.json'), JSON.stringify(publicPackages, null, 2) + '\n')
const staticDirectory = join(artifacts, 'static-0.1.0')
await rm(staticDirectory, { recursive: true, force: true })
await cp(resolve('packages/foundation/dist'), staticDirectory, { recursive: true })
for (const file of ['README.md', 'LICENSE', 'NOTICE.md']) await cp(resolve('packages/foundation', file), join(staticDirectory, file))
const staticFiles = (await readdir(staticDirectory)).sort()
const staticManifest = { version: '0.1.0', scope: 'all archive payload files except manifest.json itself', files: [] }
for (const file of staticFiles) staticManifest.files.push({ file, sha256: createHash('sha256').update(await readFile(join(staticDirectory, file))).digest('hex') })
await writeFile(join(staticDirectory, 'manifest.json'), JSON.stringify(staticManifest, null, 2) + '\n')
execFileSync('tar', ['-czf', join(artifacts, 'fastui-static-0.1.0.tar.gz'), '-C', artifacts, 'static-0.1.0'])
const releaseFiles = [...publicPackages.map(pkg => pkg.file), 'fastui-static-0.1.0.tar.gz']
await writeFile(join(artifacts, 'SHA256SUMS'), (await Promise.all(releaseFiles.map(async file =>
  `${createHash('sha256').update(await readFile(join(artifacts, file))).digest('hex')}  ${file}`))).join('\n') + '\n')
const servers = []
const devServers = []
let browser
const fixture = await releaseFixture(publicPackages.map(pkg => ({
  url: `https://github.com/FastR-D/FastUI/releases/download/v${pkg.version}/${pkg.file}`, archive: join(artifacts, pkg.file),
})), work)
const install = directory => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [npm, 'install', '--include=dev', '--no-audit', '--no-fund', '--cache', join(directory, '.npm-cache')], {
    cwd: directory, env: { ...process.env, ...fixture.environment }, stdio: ['ignore', 'pipe', 'pipe'],
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
    // An isolated cache forces an actual HTTPS download through the release fixture.
    const installLog = await install(directory)
    const installed = JSON.parse(await readFile(join(directory, 'node_modules/@fastrd/ui-foundation/package.json'), 'utf8'))
    if (installed.version !== foundationManifest.version) throw new Error('Installed foundation version differs')
    for (const dependency of ['vite', ...(name === 'html' ? [] : ['typescript'])]) {
      await readFile(join(directory, 'node_modules', dependency, 'package.json'))
    }
    const tree = run(['ls', '@fastrd/ui-foundation', '--json'], directory)
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
      [pkg.name, `https://github.com/FastR-D/FastUI/releases/download/v${pkg.version}/${pkg.file}`])),
  }, null, 2) + '\n')
  const bootstrapInstall = await install(bootstrap)
  const bootstrapTree = run(['ls', '@fastrd/ui-foundation', '--json'], bootstrap)
  await writeFile(join(artifacts, 'bootstrap-install.log'), bootstrapInstall + bootstrapTree)
  await writeFile(join(artifacts, 'bootstrap-result.json'), JSON.stringify({ status: 'passed',
    authority: 'npm install/npm ls against local HTTPS release fixture; GitHub upload pending',
    foundationExplicitlyInstalled: false, packages: publicPackages, tree: JSON.parse(bootstrapTree),
  }, null, 2) + '\n')
  // StrictMode ref/effect replay is a development behavior. These servers still
  // resolve installed tarballs, never package source aliases.
  process.env.NODE_ENV = 'development'
  for (const framework of ['react', 'react18']) {
    const server = await createServer({ configFile: false, root: join(work, framework), server: { host: '127.0.0.1', port: 4273 + devServers.length } })
    await server.listen()
    devServers.push(server)
    urls[`${framework}-dev`] = `http://127.0.0.1:${server.httpServer.address().port}`
  }
  browser = await chromium.launch({ headless: true })
  const scenarios = [...await runDialogRegressions(browser, urls, artifacts), ...await runScenarios(browser, urls, artifacts)]
  if (fixture.requests.filter(request => request.url === foundationURL).length < 3) throw new Error('Not every clean consumer downloaded the release dependency')
  await writeFile(join(artifacts, 'results.json'), JSON.stringify({ status: 'passed', consumers: ['html', 'react', 'react18', 'vue'], releaseDownload: { authority: 'local HTTPS fixture; GitHub upload pending', requests: fixture.requests }, scenarios: scenarios.sort() }, null, 2) + '\n')
  console.log(`PASS: ${scenarios.length} published-consumer scenarios; evidence in ${artifacts}`)
} finally {
  await browser?.close()
  await Promise.all(devServers.map(server => server.close()))
  await Promise.all(servers.map(server => new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()))))
  await fixture.close()
}
