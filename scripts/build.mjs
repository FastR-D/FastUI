import { build } from 'esbuild'
import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

const tokens = JSON.parse(await readFile('packages/foundation/tokens.json', 'utf8'))
const declarations = values => Object.entries(values).map(([key, value]) => `  --fastui-${key}: ${value};` + (/^#[0-9a-f]{6}$/i.test(value) ? `\n  --fastui-${key}-rgb: ${rgb(value)};` : '')).join('\n')
const rgb = hex => hex.slice(1).match(/../g).map(v => parseInt(v, 16)).join(', ')
for (const name of ['foundation', 'vue', 'react']) {
  const root = `packages/${name}`
  await rm(`${root}/dist`, { recursive: true, force: true })
  await mkdir(`${root}/dist`, { recursive: true })
  await build({
    entryPoints: [`${root}/src/index.${name === 'react' ? 'tsx' : 'ts'}`],
    outfile: `${root}/dist/index.js`, bundle: true, format: 'esm', target: 'es2022',
    jsx: 'automatic', external: ['vue', 'react', 'react-dom', 'react/jsx-runtime', '@fastrd/ui-foundation'],
  })
  execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '--project', `${root}/tsconfig.json`], { stdio: 'inherit' })
  for (const file of ['LICENSE', 'NOTICE.md']) await cp(file, `${root}/${file}`)
}
await writeFile('packages/foundation/dist/tokens.css', `/* Generated from tokens.json. */\n:root {\n${declarations(tokens.shared)}\n}\n` + ['light', 'dark'].map(mode => `${mode === 'light' ? ':root, ' : ''}[data-fastui-theme="${mode}"] {\n${declarations(tokens[mode])}\n  --fastui-color-scheme: ${mode};\n}`).join('\n'))
await cp('packages/foundation/src/controls.css', 'packages/foundation/dist/controls.css')
await writeFile('packages/foundation/dist/mdui.css', '/* Generated, opt-in mappings. */\n.fastui-mdui {\n' + Object.entries(tokens.mdui).map(([key, source]) => `  --mdui-color-${key}: var(--fastui-${source}-rgb);`).join('\n') + '\n}\n')
await writeFile('packages/foundation/dist/vscrui.css', '.fastui-vscrui {\n' + Object.entries(tokens.vscrui).map(([key, source]) => `  --vscode-${key}: var(--fastui-${source});`).join('\n') + '\n}\n')
for (const name of ['vue', 'react']) await writeFile(`packages/${name}/dist/styles.css`, '@import "@fastrd/ui-foundation/tokens.css";\n@import "@fastrd/ui-foundation/controls.css";\n')
await build({ entryPoints: ['packages/foundation/src/bootstrap.ts'], outfile: 'packages/foundation/dist/color-mode.js', bundle: true, format: 'iife', target: 'es2022' })
