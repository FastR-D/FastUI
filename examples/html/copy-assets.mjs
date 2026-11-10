import { cp, mkdir } from 'node:fs/promises'
await mkdir('public/assets', { recursive: true })
for (const file of ['color-mode.js', 'index.js', 'tokens.css', 'controls.css']) {
  await cp(`node_modules/@fastrd/ui-foundation/dist/${file}`, `public/assets/${file}`)
}
