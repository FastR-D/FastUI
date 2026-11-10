import { createServer as httpServer } from 'node:http'
import { createServer as httpsServer } from 'node:https'
import { connect } from 'node:net'
import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

// External download boundary only: npm sees the final HTTPS dependency URL and
// the unmodified release tarball. Other hosts keep their normal TLS connection.
export async function releaseFixture(archives, directory) {
  const key = join(directory, 'release-key.pem')
  const cert = join(directory, 'release-cert.pem')
  execFileSync('openssl', ['req', '-config', join(import.meta.dirname, 'openssl.cnf'), '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1',
    '-subj', '/CN=github.com', '-addext', 'subjectAltName=DNS:github.com',
    '-keyout', key, '-out', cert], { stdio: 'pipe' })
  const assets = new Map(await Promise.all(archives.map(async ({ url, archive }) => [new URL(url).pathname, { url, bytes: await readFile(archive) }])))
  const requests = []
  const tls = httpsServer({ key: await readFile(key), cert: await readFile(cert) }, (request, response) => {
    const asset = assets.get(request.url)
    if (request.method !== 'GET' || !asset) {
      response.writeHead(404).end(); return
    }
    const { url, bytes } = asset
    requests.push({ method: request.method, url, bytes: bytes.length })
    response.writeHead(200, { 'content-type': 'application/octet-stream', 'content-length': bytes.length })
    response.end(bytes)
  })
  const sockets = new Set()
  const proxy = httpServer((_, response) => response.writeHead(502).end())
  proxy.on('connection', socket => {
    sockets.add(socket)
    socket.on('error', () => socket.destroy())
    socket.on('close', () => sockets.delete(socket))
  })
  proxy.on('connect', (request, socket, head) => {
    if (request.url === 'github.com:443') {
      socket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
      if (head.length) socket.unshift(head)
      tls.emit('connection', socket)
    } else {
      const [host, port] = request.url.split(':')
      const upstream = connect(Number(port), host, () => {
        socket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
        upstream.write(head); socket.pipe(upstream); upstream.pipe(socket)
      })
      upstream.on('error', () => socket.destroy())
      socket.on('close', () => upstream.destroy())
    }
  })
  await new Promise(resolve => proxy.listen(0, '127.0.0.1', resolve))
  return {
    requests,
    environment: { NODE_EXTRA_CA_CERTS: cert, npm_config_https_proxy: `http://127.0.0.1:${proxy.address().port}`, npm_config_noproxy: '' },
    close: async () => { for (const socket of sockets) socket.destroy(); await new Promise(resolve => proxy.close(resolve)) },
  }
}
