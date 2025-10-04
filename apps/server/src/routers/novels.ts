import { and, asc, count, desc, eq, like, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { db } from '../db'
import {
  bookmark,
  category,
  chapter,
  comment,
  favorite,
  novel,
  rating,
  readingHistory,
} from '../db/schema'
import { protectedProcedure, publicProcedure } from '../lib/orpc'

// 分页参数 schema
const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  page: z.number().min(1).default(1),
})

// 小说创建 schema
const createNovelSchema = z.object({
  author: z.string().min(1).max(100),
  categoryId: z.string().optional(),
  coverImage: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ongoing', 'completed', 'paused']).default('ongoing'),
  tags: z.array(z.string()).optional(),
  title: z.string().min(1).max(200),
})

export const novelsRouter = {
  // 添加书签
  addBookmark: protectedProcedure
    .input(
      z.object({
        chapterId: z.string(),
        note: z.string().optional(),
        novelId: z.string(),
        position: z.number().default(0),
      })
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id

      const bookmarkValue = {
        id: nanoid(),
        userId,
        ...input,
        createdAt: new Date(),
      }

      await db.insert(bookmark).values(bookmarkValue)
      return bookmark
    }),

  // 管理功能 - 创建分类
  createCategory: protectedProcedure
    .input(
      z.object({
        description: z.string().optional(),
        name: z.string().min(1, '分类名称不能为空'),
      })
    )
    .handler(async ({ input }) => {
      const categoryData = {
        createdAt: new Date(),
        description: input.description || '',
        id: nanoid(),
        name: input.name,
        updatedAt: new Date(),
      }

      await db.insert(category).values(categoryData)
      return categoryData
    }),
  // 创建小说 (需要登录)
  createNovel: protectedProcedure
    .input(createNovelSchema)
    .handler(async ({ input }) => {
      const novelId = nanoid()
      const now = new Date()

      const newNovel = {
        id: novelId,
        ...input,
        createdAt: now,
        tags: input.tags?.join(',') || '',
        updatedAt: now,
      }

      await db.insert(novel).values(newNovel)
      return newNovel
    }),

  // 管理功能 - 删除分类
  deleteCategory: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      // 检查是否有小说使用此分类
      const novelsWithCategory = await db
        .select({ id: novel.id })
        .from(novel)
        .where(eq(novel.categoryId, input.id))
        .limit(1)

      if (novelsWithCategory.length > 0) {
        throw new Error('无法删除：该分类下还有小说')
      }

      await db.delete(category).where(eq(category.id, input.id))
      return { success: true }
    }),

  // 管理功能 - 删除小说
  deleteNovel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      // 删除相关数据
      await db.delete(chapter).where(eq(chapter.novelId, input.id))
      await db.delete(favorite).where(eq(favorite.novelId, input.id))
      await db
        .delete(readingHistory)
        .where(eq(readingHistory.novelId, input.id))
      await db.delete(bookmark).where(eq(bookmark.novelId, input.id))
      await db.delete(novel).where(eq(novel.id, input.id))

      return { success: true }
    }),

  // 管理功能 - 获取管理统计数据
  getAdminStats: protectedProcedure.handler(async () => {
    const [totalNovels, totalChapters, totalCategories, recentNovels] =
      await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(novel),
        db.select({ count: sql<number>`count(*)` }).from(chapter),
        db.select({ count: sql<number>`count(*)` }).from(category),
        db
          .select({
            author: novel.author,
            chapterCount: sql<number>`count(${chapter.id})`,
            createdAt: novel.createdAt,
            id: novel.id,
            title: novel.title,
          })
          .from(novel)
          .leftJoin(chapter, eq(novel.id, chapter.novelId))
          .groupBy(novel.id)
          .orderBy(desc(novel.createdAt))
          .limit(5),
      ])

    return {
      recentNovels,
      totalCategories: totalCategories[0]?.count || 0,
      totalChapters: totalChapters[0]?.count || 0,
      totalNovels: totalNovels[0]?.count || 0,
    }
  }),

  // 获取分类列表
  getCategories: publicProcedure.handler(
    async () => await db.select().from(category).orderBy(asc(category.name))
  ),
  // 获取小说详情
  getNovelDetail: publicProcedure
    .input(
      z.object({
        id: z.string(),
        page: z.int().default(1),
        pageSize: z.int().default(10),
      })
    )
    .handler(async ({ input }) => {
      const novelDetail = await db
        .select()
        .from(novel)
        .where(eq(novel.id, input.id))
        .limit(1)

      if (!novelDetail.length) {
        throw new Error('小说不存在')
      }

      // 获取章节列表
      const chapters = await db
        .select({
          chapterNumber: chapter.chapterNumber,
          id: chapter.id,
          isFree: chapter.isFree,
          novelId: chapter.novelId,
          publishedAt: chapter.publishedAt,
          title: chapter.title,
          wordCount: chapter.wordCount,
        })
        .from(chapter)
        .where(eq(chapter.novelId, input.id))
        .orderBy(desc(chapter.chapterNumber))
        .offset(input.pageSize * (input.page - 1))
        .limit(input.pageSize)

      return {
        chapters,
        novel: novelDetail[0],
      }
    }),
  // 获取小说列表
  getNovelList: publicProcedure
    .input(
      paginationSchema.extend({
        categoryId: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.enum(['latest', 'popular', 'rating']).default('latest'),
        status: z.enum(['ongoing', 'completed', 'paused']).optional(),
      })
    )
    .handler(async ({ input }) => {
      const { page, limit, categoryId, status, sortBy, search } = input
      const offset = (page - 1) * limit

      let baseQuery = db.select().from(novel)

      // 构建查询条件
      if (categoryId && status && search) {
        baseQuery = baseQuery.where(
          and(
            eq(novel.categoryId, categoryId),
            eq(novel.status, status),
            like(novel.title, `%${search}%`)
          )
        ) as any
      } else if (categoryId && status) {
        baseQuery = baseQuery.where(
          and(eq(novel.categoryId, categoryId), eq(novel.status, status))
        ) as any
      } else if (categoryId && search) {
        baseQuery = baseQuery.where(
          and(
            eq(novel.categoryId, categoryId),
            like(novel.title, `%${search}%`)
          )
        ) as any
      } else if (status && search) {
        baseQuery = baseQuery.where(
          and(eq(novel.status, status), like(novel.title, `%${search}%`))
        ) as any
      } else if (categoryId) {
        baseQuery = baseQuery.where(eq(novel.categoryId, categoryId)) as any
      } else if (status) {
        baseQuery = baseQuery.where(eq(novel.status, status)) as any
      } else if (search) {
        baseQuery = baseQuery.where(like(novel.title, `%${search}%`)) as any
      }

      let query = baseQuery

      // 排序
      switch (sortBy) {
        case 'popular':
          query = query.orderBy(desc(novel.viewCount)) as any
          break
        case 'rating':
          query = query.orderBy(desc(novel.rating)) as any
          break
        default:
          query = query.orderBy(desc(novel.updatedAt)) as any
      }

      const novels = await query.limit(limit).offset(offset)

      // 获取总数
      let totalQuery = db.select({ count: count() }).from(novel)

      // 应用相同的查询条件
      if (categoryId && status && search) {
        totalQuery = totalQuery.where(
          and(
            eq(novel.categoryId, categoryId),
            eq(novel.status, status),
            like(novel.title, `%${search}%`)
          )
        ) as any
      } else if (categoryId && status) {
        totalQuery = totalQuery.where(
          and(eq(novel.categoryId, categoryId), eq(novel.status, status))
        ) as any
      } else if (categoryId && search) {
        totalQuery = totalQuery.where(
          and(
            eq(novel.categoryId, categoryId),
            like(novel.title, `%${search}%`)
          )
        ) as any
      } else if (status && search) {
        totalQuery = totalQuery.where(
          and(eq(novel.status, status), like(novel.title, `%${search}%`))
        ) as any
      } else if (categoryId) {
        totalQuery = totalQuery.where(eq(novel.categoryId, categoryId)) as any
      } else if (status) {
        totalQuery = totalQuery.where(eq(novel.status, status)) as any
      } else if (search) {
        totalQuery = totalQuery.where(like(novel.title, `%${search}%`)) as any
      }

      const [{ count: total }] = await totalQuery

      return {
        novels,
        pagination: {
          limit,
          page,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    }),

  // 获取阅读历史
  getReadingHistory: protectedProcedure
    .input(paginationSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id
      const { page, limit } = input
      const offset = (page - 1) * limit

      const history = await db
        .select({
          chapter: {
            chapterNumber: chapter.chapterNumber,
            id: chapter.id,
            title: chapter.title,
          },
          lastReadAt: readingHistory.lastReadAt,
          novel,
          progress: readingHistory.progress,
        })
        .from(readingHistory)
        .innerJoin(novel, eq(readingHistory.novelId, novel.id))
        .leftJoin(chapter, eq(readingHistory.chapterId, chapter.id))
        .where(eq(readingHistory.userId, userId))
        .orderBy(desc(readingHistory.lastReadAt))
        .limit(limit)
        .offset(offset)

      const [{ count: total }] = await db
        .select({ count: count() })
        .from(readingHistory)
        .where(eq(readingHistory.userId, userId))

      return {
        history,
        pagination: {
          limit,
          page,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    }),

  // 获取用户书签
  getUserBookmarks: protectedProcedure
    .input(
      z.object({
        novelId: z.string().optional(),
        ...paginationSchema.shape,
      })
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id
      const { page, limit, novelId } = input
      const offset = (page - 1) * limit

      let query = db
        .select({
          bookmark,
          chapter: {
            chapterNumber: chapter.chapterNumber,
            id: chapter.id,
            title: chapter.title,
          },
          novel: {
            id: novel.id,
            title: novel.title,
          },
        })
        .from(bookmark)
        .innerJoin(novel, eq(bookmark.novelId, novel.id))
        .innerJoin(chapter, eq(bookmark.chapterId, chapter.id))

      if (novelId) {
        query = query.where(
          and(eq(bookmark.userId, userId), eq(bookmark.novelId, novelId))
        ) as any
      } else {
        query = query.where(eq(bookmark.userId, userId)) as any
      }

      const bookmarks = await query
        .orderBy(desc(bookmark.createdAt))
        .limit(limit)
        .offset(offset)

      let countQuery = db.select({ count: count() }).from(bookmark)

      if (novelId) {
        countQuery = countQuery.where(
          and(eq(bookmark.userId, userId), eq(bookmark.novelId, novelId))
        ) as any
      } else {
        countQuery = countQuery.where(eq(bookmark.userId, userId)) as any
      }
      const [{ count: total }] = await countQuery

      return {
        bookmarks,
        pagination: {
          limit,
          page,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    }),

  // 获取用户收藏列表
  getUserFavorites: protectedProcedure
    .input(paginationSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id
      const { page, limit } = input
      const offset = (page - 1) * limit

      const favorites = await db
        .select({
          favoriteAt: favorite.createdAt,
          novel,
        })
        .from(favorite)
        .innerJoin(novel, eq(favorite.novelId, novel.id))
        .where(eq(favorite.userId, userId))
        .orderBy(desc(favorite.createdAt))
        .limit(limit)
        .offset(offset)

      const [{ count: total }] = await db
        .select({ count: count() })
        .from(favorite)
        .where(eq(favorite.userId, userId))

      return {
        favorites,
        pagination: {
          limit,
          page,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    }),

  // 收藏小说
  toggleFavorite: protectedProcedure
    .input(z.object({ novelId: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id

      // 检查是否已收藏
      const existing = await db
        .select()
        .from(favorite)
        .where(
          and(eq(favorite.userId, userId), eq(favorite.novelId, input.novelId))
        )
        .limit(1)

      if (existing.length > 0) {
        // 取消收藏
        await db
          .delete(favorite)
          .where(
            and(
              eq(favorite.userId, userId),
              eq(favorite.novelId, input.novelId)
            )
          )

        // 减少收藏数
        await db
          .update(novel)
          .set({ favoriteCount: sql`${novel.favoriteCount} - 1` })
          .where(eq(novel.id, input.novelId))

        return { favorited: false }
      }
      // 添加收藏
      await db.insert(favorite).values({
        createdAt: new Date(),
        id: nanoid(),
        novelId: input.novelId,
        userId,
      })

      // 增加收藏数
      await db
        .update(novel)
        .set({ favoriteCount: sql`${novel.favoriteCount} + 1` })
        .where(eq(novel.id, input.novelId))

      return { favorited: true }
    }),

  // 管理功能 - 更新分类
  updateCategory: protectedProcedure
    .input(
      z.object({
        description: z.string().optional(),
        id: z.string(),
        name: z.string().min(1, '分类名称不能为空'),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updateData } = input
      const categoryData = {
        ...updateData,
        description: updateData.description || '',
        updatedAt: new Date(),
      }

      await db.update(category).set(categoryData).where(eq(category.id, id))

      return { ...categoryData, id }
    }),
  // 管理功能 - 更新小说
  updateNovel: protectedProcedure
    .input(
      z.object({
        author: z.string().min(1, '作者不能为空'),
        categoryId: z.string(),
        coverImage: z.string().optional(),
        description: z.string().min(1, '简介不能为空'),
        id: z.string(),
        status: z.enum(['ongoing', 'completed', 'paused']).default('ongoing'),
        tags: z.array(z.string()).optional(),
        title: z.string().min(1, '小说标题不能为空'),
      })
    )
    .handler(
      async ({ input }) =>
        await db
          .update(novel)
          .set({
            author: input.author,
            categoryId: input.categoryId,
            coverImage: input.coverImage,
            description: input.description,
            status: input.status,
            tags: input.tags?.join(',') || '',
            title: input.title,
            updatedAt: new Date(),
          })
          .where(eq(novel.id, input.id))
    ),

  // // 更新阅读历史
  //   updateReadingHistory: protectedProcedure
  //     .input(
  //       z.object(
  //   chapterId: z.string(), novelId
  //   : z.string(),
  //         progress: z.number().min(0).max(1).default(0),
  //   )
  //     )
  //     .handler(async (
  //   input, context
  //   ) =>
  // {
  //   const userId = context.session.user.id
  //   const now = new Date()

  //   // 检查是否已有阅读历史
  //   const existing = await db
  //     .select()
  //     .from(readingHistory)
  //     .where(
  //       and(
  //         eq(readingHistory.userId, userId),
  //         eq(readingHistory.novelId, input.novelId)
  //       )
  //     )
  //     .limit(1)

  //   if (existing.length > 0) {
  //     // 更新现有记录
  //     await db
  //       .update(readingHistory)
  //       .set({
  //         chapterId: input.chapterId,
  //         lastReadAt: now,
  //         progress: input.progress,
  //         updatedAt: now,
  //       })
  //       .where(
  //         and(
  //           eq(readingHistory.userId, userId),
  //           eq(readingHistory.novelId, input.novelId)
  //         )
  //       )
  //   } else {
  //     // 创建新记录
  //     await db.insert(readingHistory).values({
  //       chapterId: input.chapterId,
  //       createdAt: now,
  //       id: nanoid(),
  //       lastReadAt: now,
  //       novelId: input.novelId,
  //       progress: input.progress,
  //       updatedAt: now,
  //       userId,
  //     })
  //   }

  //   return { success: true }
  // }
  // ),
}
