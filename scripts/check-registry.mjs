import { readFile } from 'node:fs/promises'
import { parse } from 'yaml'

const lock = parse(await readFile('pnpm-lock.yaml', 'utf8'))
let remote = 0
for (const [name, pkg] of Object.entries(lock.packages ?? {})) {
  const resolution = pkg.resolution
  if (!resolution?.integrity || !resolution?.tarball || new URL(resolution.tarball).origin !== 'https://registry.npmjs.org') {
    throw new Error(`Lock dependency must resolve from official npm with integrity: ${name}`)
  }
  remote++
}
if (!remote) throw new Error('pnpm lock must contain registry packages')
console.log(`Official npm pnpm lock sources verified: ${remote}`)
