import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { createGenerator } from 'unocss'
import { fastUIContent, presetFastUI } from '../packages/foundation/dist/uno.js'
import { readFile, mkdir, writeFile, mkdtemp, symlink, rm } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { build as viteBuild } from 'vite'
import UnoCSS from 'unocss/vite'
import { gzipSync } from 'node:zlib'

for (const framework of ['react', 'vue']) {
  const manifest = JSON.parse(await readFile(`packages/${framework}/package.json`, 'utf8'))
  assert(!('./styles.css' in manifest.exports))
  await assert.rejects(readFile(`packages/${framework}/dist/styles.css`), { code: 'ENOENT' })
  assert.throws(() => import.meta.resolve(`@fastrd/ui-${framework}/styles.css`), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' })
}
const fullCSS = await readFile('packages/foundation/dist/controls.css', 'utf8')
const tokensCSS = await readFile('packages/foundation/dist/tokens.css', 'utf8')
const generate = async (source, options) => {
  const uno = await createGenerator({ presets: [presetFastUI(options)] })
  return (await uno.generate(source)).css
}
const buttonCSS = await generate(`import { Button as Action } from '@fastrd/ui-react'; <Action variant={variant} />`)
assert(buttonCSS.includes('.fastui-button--primary'))
assert(buttonCSS.includes('.fastui-button:disabled'))
assert(buttonCSS.includes('pointer: coarse'))
assert(!buttonCSS.includes('.fastui-dialog'))
assert(!buttonCSS.includes('.fastui-tabs'))
assert(!buttonCSS.includes('@keyframes fastui-spin'))
assert(buttonCSS.length < (fullCSS.length + tokensCSS.length) * .6)
const vueCSS = await generate(`import * as UI from '@fastrd/ui-vue'; h(UI.Button, {variant}); h(UI.Loading)`)
assert(vueCSS.includes('.fastui-button--danger'))
assert(vueCSS.includes('@keyframes fastui-spin'))
assert(vueCSS.includes('prefers-reduced-motion'))
assert(!vueCSS.includes('.fastui-dialog'))
assert((await generate('<table class="fastui-table"></table>')).includes('.fastui-table :where(th, td)'))
assert(!(await generate('<table class="fastui-table"></table>')).includes('.fastui-tab-item'))
assert((await generate('', { components: ['Modal'] })).includes('.fastui-dialog'))
assert(!(await generate(`import type { DialogProps } from '@fastrd/ui-react'`)).includes('.fastui-dialog'))
assert(!(await generate('<p>no components</p>')).includes('.fastui-button'))
for (const framework of ['react', 'vue']) {
  for (const [component, selector] of [['CardBody', '.fastui-card-body'], ['Avatar', '.fastui-avatar'], ['Switch', '.fastui-switch'], ['Progress', '.fastui-progress'], ['Skeleton', '.fastui-skeleton'], ['Kbd', '.fastui-kbd']]) {
    const css = await generate(`import { ${component} } from '@fastrd/ui-${framework}'`)
    assert(css.includes(selector), `${framework}/${component} missing styles`)
    assert(!css.includes('.fastui-dialog'))
    assert(!css.includes('@keyframes fastui-spin'))
    assert(css.includes('@keyframes fastui-skeleton') === (component === 'Skeleton'))
    assert(css.includes('@keyframes fastui-progress') === (component === 'Progress'))
  }
}
assert((await generate('<div class="fastui-card-body"></div>')).includes('.fastui-card-footer'))
// A fresh generation must not retain components used in an earlier route/build.
const uno = await createGenerator({ presets: [presetFastUI()] })
await uno.generate(`import { Dialog } from '@fastrd/ui-react'`)
assert(!(await uno.generate(`import { Button } from '@fastrd/ui-react'`)).css.includes('.fastui-dialog'))
const metrics = { css: { full: fullCSS.length + tokensCSS.length, buttonOnly: buttonCSS.length, buttonOnlyGzip: gzipSync(buttonCSS).length }, js: {} }
for (const framework of ['react', 'vue']) {
  const bundle = async contents => (await build({
    stdin: { contents, resolveDir: process.cwd() }, bundle: true, write: false,
    format: 'esm', minify: true, external: ['react', 'vue', 'react-dom', 'react/jsx-runtime'],
  })).outputFiles[0].text
  const minimal = await bundle(`export { Button } from './packages/${framework}/dist/index.js'`)
  const full = await bundle(`export * from './packages/${framework}/dist/index.js'`)
  assert(minimal.includes('fastui-button'))
  for (const unused of ['fastui-dialog', 'fastui-tabs', 'fastui-asset', 'syncDialog', 'tabNavigationIndex']) assert(!minimal.includes(unused), `${framework}: retained ${unused}`)
  assert(minimal.length < full.length * .25)
  metrics.js[framework] = { full: full.length, buttonOnly: minimal.length, buttonOnlyGzip: gzipSync(minimal).length }
}
// Exercise the real Vite integration and published export paths, not just core.generate().
await mkdir('.verification', { recursive: true })
const fixture = await mkdtemp(resolve('.verification/uno-consumer-'))
try {
  await symlink(resolve('node_modules'), join(fixture, 'node_modules'), 'dir')
  await writeFile(join(fixture, 'index.html'), '<script type="module" src="/main.js"></script>')
  for (const framework of ['react', 'vue']) {
    await writeFile(join(fixture, 'main.js'), `import { Button as Action } from '@fastrd/ui-${framework}'; import 'virtual:uno.css'; window.FastUIButton = Action`)
    const output = await viteBuild({
      configFile: false, root: fixture, logLevel: 'silent',
      plugins: [UnoCSS({ configFile: false, content: fastUIContent, presets: [presetFastUI()] })],
      build: { write: false },
    })
    const chunks = (Array.isArray(output) ? output : [output]).flatMap(result => result.output)
    const css = chunks.filter(chunk => chunk.type === 'asset' && chunk.fileName.endsWith('.css')).map(chunk => chunk.source).join('')
    const js = chunks.filter(chunk => chunk.type === 'chunk').map(chunk => chunk.code).join('')
    assert(css.includes('.fastui-button--primary'))
    for (const unused of ['.fastui-dialog', '.fastui-tabs', '.fastui-asset-card']) assert(!css.includes(unused), `${framework} Vite CSS retained ${unused}`)
    for (const unused of ['fastui-dialog', 'fastui-tabs', 'fastui-asset-card']) assert(!js.includes(unused), `${framework} Vite JS retained ${unused}`)
  }
} finally { await rm(fixture, { recursive: true, force: true }) }
await mkdir('artifacts/tree-shaking', { recursive: true })
await writeFile('artifacts/tree-shaking/results.json', JSON.stringify({ status: 'passed', ...metrics }, null, 2) + '\n')
console.log('PASS: UnoCSS extraction, aliases, namespace imports, dynamic variants, media states and JS/CSS pruning')
console.log(JSON.stringify(metrics))
