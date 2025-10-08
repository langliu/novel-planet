import { env } from 'cloudflare:workers'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { bookmark, chapter, novel, readingHistory } from '../db/schema'
import { protectedProcedure, publicProcedure } from '../lib/orpc'
import { getR2FileContent, gzipString } from '../utils'

const TITLE_MAX_LENGTH = 200

// 章节创建 schema
const createChapterSchema = z.object({
  chapterNumber: z.number().min(1),
  content: z.string().min(1),
  isFree: z.boolean().default(true),
  novelId: z.string(),
  title: z.string().min(1).max(TITLE_MAX_LENGTH),
})

export const chaptersRouter = {
  // 创建章节 (需要登录)
  createChapter: protectedProcedure
    .input(createChapterSchema)
    .handler(async ({ input }) => {
      const chapterId = crypto.randomUUID()
      const now = new Date()
      const wordCount = input.content.length
      const fileName = `${input.novelId}/${chapterId}.txt.gz`
      const bucket = env.R2
      const compressedData = await gzipString(input.content)
      try {
        await bucket.put(fileName, compressedData, {
          httpMetadata: {
            contentEncoding: 'gzip',
            contentType: 'text/plain',
          },
        })
      } catch (e) {
        throw new Error(`保存失败${(e as Error).message}`)
      }

      const newChapter = {
        id: chapterId,
        ...input,
        content: fileName,
        createdAt: now,
        publishedAt: now,
        updatedAt: now,
        wordCount,
      }

      await db.insert(chapter).values(newChapter)

      // 更新小说的章节数和字数
      await db
        .update(novel)
        .set({
          chapterCount: sql<number>`novel.chapterCount + ${1}`,
          updatedAt: now,
          wordCount: sql<number>`novel.wordCount + ${wordCount}`,
        })
        .where(eq(novel.id, input.novelId))

      return newChapter
    }),

  // 管理功能 - 删除章节
  deleteChapter: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const chapterData = await db
        .select()
        .from(chapter)
        .where(eq(chapter.id, input.id))
        .limit(1)
      if (chapterData.length === 0) {
        return { message: '章节不存在', success: false }
      }
      if (chapterData) {
        // 删除相关数据
        await db
          .delete(readingHistory)
          .where(eq(readingHistory.chapterId, input.id))
        await db.delete(bookmark).where(eq(bookmark.chapterId, input.id))
        await db.delete(chapter).where(eq(chapter.id, input.id))
        const bucket = env.R2
        await bucket.delete(chapterData[0].content)

        return { success: true }
      }
    }),

  // 获取章节内容
  getChapterContent: publicProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const chapterData = await db
        .select()
        .from(chapter)
        .where(eq(chapter.id, input.id))
        .limit(1)

      if (!chapterData.length) {
        throw new Error('章节不存在')
      }
      const bucket = env.R2
      const content = await bucket.get(chapterData[0].content)
      if (!content) {
        throw new Error('章节内容不存在')
      }
      const decompressed = await getR2FileContent(content)
      // 增加章节阅读量
      await db
        .update(chapter)
        .set({ viewCount: sql<number>`chapter.viewCount + ${1}` })
        .where(eq(chapter.id, input.id))

      // 增加小说阅读量
      await db
        .update(novel)
        .set({ viewCount: sql<number>`novel.viewCount + ${1}` })
        .where(eq(novel.id, chapterData[0].novelId))

      return { ...chapterData[0], content: decompressed }
    }),

  // 获取章节详情（用于编辑）
  getChapterDetail: publicProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const chapterData = await db
        .select()
        .from(chapter)
        .where(eq(chapter.id, input.id))
        .limit(1)

      if (!chapterData.length) {
        throw new Error('章节不存在')
      }

      const bucket = env.R2
      const contentFile = await bucket.get(chapterData[0].content)

      if (!contentFile) {
        throw new Error('章节内容不存在')
      }

      const decompressed = await getR2FileContent(contentFile)

      return {
        ...chapterData[0],
        content: decompressed,
      }
    }),

  // 管理功能 - 更新章节
  updateChapter: protectedProcedure
    .input(
      z.object({
        chapterNumber: z.number().min(1),
        content: z.string().min(1, '章节内容不能为空'),
        id: z.string(),
        isFree: z.boolean().optional(),
        title: z.string().min(1, '章节标题不能为空'),
      })
    )
    .handler(async ({ input }) => {
      const chapterData = await db
        .select()
        .from(chapter)
        .where(eq(chapter.id, input.id))
        .limit(1)

      if (!chapterData.length) {
        throw new Error('章节不存在')
      }

      const wordCount = input.content.length
      const bucket = env.R2
      const compressedData = await gzipString(input.content)

      try {
        await bucket.put(chapterData[0].content, compressedData, {
          httpMetadata: {
            contentEncoding: 'gzip',
            contentType: 'text/plain',
          },
        })
      } catch (e) {
        throw new Error(`保存失败：${(e as Error).message}`)
      }

      const updateSchema = createChapterSchema
        .extend({
          content: z.string().optional(),
          isFree: z.boolean().optional(),
          updatedAt: z.date(),
          wordCount: z.int(),
        })
        .omit({ novelId: true })

      const updateData: z.infer<typeof updateSchema> = {
        chapterNumber: input.chapterNumber,
        title: input.title,
        updatedAt: new Date(),
        wordCount,
      }

      if (input.isFree !== undefined) {
        updateData.isFree = input.isFree
      }

      await db.update(chapter).set(updateData).where(eq(chapter.id, input.id))

      // 更新小说的字数（计算差值）
      const oldWordCount = chapterData[0].wordCount || 0
      const wordCountDiff = wordCount - oldWordCount

      if (wordCountDiff !== 0) {
        await db
          .update(novel)
          .set({
            updatedAt: new Date(),
            wordCount: sql<number>`novel.wordCount + ${wordCountDiff}`,
          })
          .where(eq(novel.id, chapterData[0].novelId))
      }

      return { success: true }
    }),
}
