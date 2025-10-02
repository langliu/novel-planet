import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import { createGunzip, gunzip, gunzipSync } from 'node:zlib'

const pipe = promisify(pipeline)

/**
 * 解压 Cloudflare 读取的 gzip Buffer 数据
 * @param gzBuffer gzip 压缩的 Buffer 或 Uint8Array
 * @returns 解压后的 Buffer
 */
export async function gunzipBuffer(
  gzBuffer: Buffer | Uint8Array
): Promise<Buffer> {
  const data = await gunzipSync(gzBuffer)
  return data
}

/**
 * 解压 R2 Content
 * @param contentFile R2文件内容
 */
export async function getR2FileContent(
  contentFile: R2ObjectBody
): Promise<string> {
  // 解压 gzip 内容
  const compressedBuffer = await contentFile.arrayBuffer()
  const decompressedStream = new DecompressionStream('gzip')
  const writer = decompressedStream.writable.getWriter()
  writer.write(new Uint8Array(compressedBuffer))
  writer.close()

  const reader = decompressedStream.readable.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    chunks.push(value)
  }

  // 合并所有块
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return new TextDecoder().decode(result)
}
/**
 * 压缩字符串为 gzip 的 Uint8Array
 * @param text 待压缩的字符串
 * @returns 压缩后的 Uint8Array
 */
export async function gzipString(text: string): Promise<Uint8Array> {
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
