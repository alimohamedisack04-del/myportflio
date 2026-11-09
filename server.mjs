import { createServer } from "node:http"
import { createReadStream, existsSync, statSync } from "node:fs"
import { extname, join, normalize } from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL(".", import.meta.url))
const port = Number(process.env.PORT || 3000)
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
}

createServer((request, response) => {
  const requestPath = decodeURIComponent((request.url || "/").split("?")[0])
  const relativePath = requestPath === "/" ? "index.html" : requestPath.slice(1)
  const filePath = join(root, normalize(relativePath))
  const safePath = filePath.startsWith(root) ? filePath : join(root, "index.html")
  const resolvedPath = existsSync(safePath) && statSync(safePath).isFile() ? safePath : join(root, "index.html")

  response.setHeader("Content-Type", contentTypes[extname(resolvedPath)] || "application/octet-stream")
  response.setHeader("Cache-Control", "no-cache")
  createReadStream(resolvedPath).on("error", () => {
    response.writeHead(500)
    response.end("Internal Server Error")
  }).pipe(response)
}).listen(port, "0.0.0.0", () => {
  console.log(`Portfolio preview listening on ${port}`)
})
