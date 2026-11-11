import { createServer } from 'node:http'
import { request as registryRequest } from 'node:https'
import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'

// npm's external registry boundary serves original packed candidates. Every
// other package is fetched from the public registry through its normal TLS API.
export async function releaseFixture(archives) {
  const candidates = new Map(await Promise.all(archives.map(async archive => {
    const bytes = await readFile(archive)
    const manifest = JSON.parse(execFileSync('tar', ['-xOf', archive, 'package/package.json'], { encoding: 'utf8' }))
    return [manifest.name, { manifest, bytes }]
  })))
  const requests = []
  let passthroughRequests = 0
  const server = createServer((request, response) => {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    const candidate = candidates.get(path.slice(1))
    const tarball = [...candidates.values()].find(({ manifest }) =>
      path === `/${manifest.name}/-/${manifest.name.split('/')[1]}-${manifest.version}.tgz`)
    if (request.method === 'GET' && (candidate || tarball)) {
      const { manifest, bytes } = candidate || tarball
      requests.push({ kind: candidate ? 'packument' : 'tarball', name: manifest.name,
        version: manifest.version, sha256: createHash('sha256').update(bytes).digest('hex') })
      const body = candidate ? Buffer.from(JSON.stringify({ name: manifest.name,
        'dist-tags': { latest: manifest.version }, versions: { [manifest.version]: { ...manifest,
          dist: { tarball: `${registry}/${manifest.name}/-/${manifest.name.split('/')[1]}-${manifest.version}.tgz`,
            integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}` },
        } },
      })) : bytes
      response.writeHead(200, { 'content-type': candidate ? 'application/json' : 'application/octet-stream', 'content-length': body.length })
      response.end(body)
      return
    }
    if (request.method !== 'GET') { response.writeHead(405).end(); return }
    passthroughRequests++
    const upstream = registryRequest(new URL(request.url, 'https://registry.npmjs.org'), {
      headers: { accept: request.headers.accept || 'application/json' },
    }, incoming => {
      response.writeHead(incoming.statusCode, incoming.headers)
      incoming.pipe(response)
    })
    upstream.on('error', error => { response.writeHead(502).end(error.message) })
    upstream.end()
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const registry = `http://127.0.0.1:${server.address().port}`
  return {
    requests,
    get passthroughRequests() { return passthroughRequests },
    environment: { npm_config_registry: registry },
    close: async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)) },
  }
}
