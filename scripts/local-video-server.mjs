import { createServer } from 'http'
import { createReadStream, statSync, existsSync } from 'fs'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = join(__dirname, '..', 'services', 'cloudflare', 'r2')
const PORT = 9000

const MIME_TYPES = {
  '.mp4': 'video/mp4',
  '.jpg': 'image/jpeg',
}

createServer((req, res) => {
  const filePath = join(ROOT_DIR, decodeURIComponent(req.url ?? '/'))

  if (!filePath.startsWith(ROOT_DIR) || !existsSync(filePath)) {
    res.writeHead(404)
    res.end('Not Found')
    return
  }

  const stat = statSync(filePath)
  const mimeType = MIME_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
  const rangeHeader = req.headers['range']

  if (rangeHeader) {
    const match = rangeHeader.match(/bytes=(\d+)-(\d*)/)
    if (!match) {
      res.writeHead(416)
      res.end()
      return
    }
    const start = parseInt(match[1])
    const end = match[2] ? parseInt(match[2]) : stat.size - 1
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': mimeType,
    })
    createReadStream(filePath, { start, end }).pipe(res)
  } else {
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': mimeType,
      'Accept-Ranges': 'bytes',
    })
    createReadStream(filePath).pipe(res)
  }
}).listen(PORT, () => {
  console.log(`[videos] local server: http://localhost:${PORT}`)
})
