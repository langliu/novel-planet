import { eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { TITLE_MAX_LENGTH } from '@/constants'
import { db } from '@/db'
import { bookmark, chapter, novel, readingHistory } from '@/db/schema'
import { protectedProcedure, publicProcedure } from '@/lib/orpc'

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
      const chapterId = nanoid()
      const now = new Date()
      const wordCount = input.content.length

      const newChapter = {
        id: chapterId,
        ...input,
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
          chapterCount: sql`${novel.chapterCount} + 1`,
          updatedAt: now,
          wordCount: sql`${novel.wordCount} + ${wordCount}`,
        })
        .where(eq(novel.id, input.novelId))

      return newChapter
    }),

  // 管理功能 - 删除章节
  deleteChapter: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      // 删除相关数据
      await db
        .delete(readingHistory)
        .where(eq(readingHistory.chapterId, input.id))
      await db.delete(bookmark).where(eq(bookmark.chapterId, input.id))
      await db.delete(chapter).where(eq(chapter.id, input.id))

      return { success: true }
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

      // 增加章节阅读量
      await db
        .update(chapter)
        .set({ viewCount: sql`${chapter.viewCount} + 1` })
        .where(eq(chapter.id, input.id))

      // 增加小说阅读量
      await db
        .update(novel)
        .set({ viewCount: sql`${novel.viewCount} + 1` })
        .where(eq(novel.id, chapterData[0].novelId))

      return chapterData[0]
    }),

  // 管理功能 - 更新章节
  updateChapter: protectedProcedure
    .input(
      z.object({
        chapterNumber: z.number().min(1),
        content: z.string().min(1, '章节内容不能为空'),
        id: z.string(),
        title: z.string().min(1, '章节标题不能为空'),
      })
    )
    .handler(async ({ input }) => {
      await db
        .update(chapter)
        .set({
          chapterNumber: input.chapterNumber,
          content: input.content,
          title: input.title,
          updatedAt: new Date(),
        })
        .where(eq(chapter.id, input.id))

      return { success: true }
    }),
}
