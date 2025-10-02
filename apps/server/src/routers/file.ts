import { env } from 'cloudflare:workers'
import { Hono } from 'hono'

const app = new Hono().basePath('/file')

// 工具函数：压缩字符串为 gzip 的 Uint8Array
async function gzipString(text: string): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text))
      controller.close()
    },
  })

  const compressedStream = stream.pipeThrough(new CompressionStream('gzip'))
  const reader = compressedStream.getReader()
  const chunks: Uint8Array[] = []

  let totalLength = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    chunks.push(value)
    totalLength += value.length
  }

  // 合并 chunks
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return result
}

// 上传压缩后的字符串到 R2
app.post('/', async (c) => {
  const bucket = env.R2

  const { key, content } = await c.req.json<{ key: string; content: string }>()
  if (!key || typeof content !== 'string') {
    return c.json({ error: 'key and content (string) are required' }, 400)
  }

  try {
    const compressedData = await gzipString(content)

    await bucket.put(key, compressedData, {
      httpMetadata: {
        contentEncoding: 'gzip', // ⚠️ 关键：告诉浏览器/客户端这是 gzip 内容
        contentType: 'text/plain', // 或 application/json 等
      },
    })

    return c.json({ key, size: compressedData.length, success: true })
  } catch (e) {
    console.error('Compression or upload failed:', e)
    return c.json({ error: 'Failed to compress and save' }, 500)
  }
})

// 可选：读取并自动解压（R2 会自动处理 contentEncoding）
app.get('/get/:key', async (c) => {
  const bucket = env.R2
  const key = c.req.param('key')

  const object = await bucket.get(key)
  if (!object) {
    return c.notFound()
  }

  // Cloudflare 会自动根据 contentEncoding 解压并返回原始内容（如果 Accept-Encoding 支持）
  return new Response(object.body, {
    headers: {
      'Content-Encoding': object.httpMetadata?.contentEncoding || 'identity',
      'Content-Type': object.httpMetadata?.contentType || 'text/plain',
    },
  })
})

export default app
