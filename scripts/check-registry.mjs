import { readFile } from 'node:fs/promises'

const lock = JSON.parse(await readFile('package-lock.json', 'utf8'))
let remote = 0
for (const [path, pkg] of Object.entries(lock.packages)) {
  if (!path.includes('node_modules/') || pkg.link) continue
  if (!pkg.resolved || new URL(pkg.resolved).origin !== 'https://registry.npmjs.org') {
    throw new Error(`Lock dependency must resolve from official npm: ${path}`)
  }
  remote++
}
console.log(`Official npm lock sources verified: ${remote}`)
