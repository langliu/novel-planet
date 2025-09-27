import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { user } from './auth'

// 小说分类表
export const category = sqliteTable('category', {
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  description: text('description'),
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// 小说表
export const novel = sqliteTable('novel', {
  author: text('author').notNull(),
  categoryId: text('category_id').references(() => category.id),
  chapterCount: integer('chapter_count').default(0),
  coverImage: text('cover_image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  description: text('description'),
  favoriteCount: integer('favorite_count').default(0),
  id: text('id').primaryKey(),
  isRecommended: integer('is_recommended', { mode: 'boolean' }).default(false),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  rating: real('rating').default(0), // 评分 0-5
  ratingCount: integer('rating_count').default(0),
  status: text('status', { enum: ['ongoing', 'completed', 'paused'] })
    .notNull()
    .default('ongoing'),
  tags: text('tags'), // JSON 字符串存储标签数组
  title: text('title').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  viewCount: integer('view_count').default(0),
  wordCount: integer('word_count').default(0),
})

// 章节表
export const chapter = sqliteTable('chapter', {
  chapterNumber: integer('chapter_number').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  id: text('id').primaryKey(),
  isFree: integer('is_free', { mode: 'boolean' }).default(true),
  isPublished: integer('is_published', { mode: 'boolean' }).default(true),
  novelId: text('novel_id')
    .notNull()
    .references(() => novel.id, { onDelete: 'cascade' }),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  title: text('title').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  viewCount: integer('view_count').default(0),
  wordCount: integer('word_count').default(0),
})

// 用户收藏表
export const favorite = sqliteTable('favorite', {
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  id: text('id').primaryKey(),
  novelId: text('novel_id')
    .notNull()
    .references(() => novel.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

// 阅读历史表
export const readingHistory = sqliteTable('reading_history', {
  chapterId: text('chapter_id').references(() => chapter.id, {
    onDelete: 'set null',
  }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  id: text('id').primaryKey(),
  lastReadAt: integer('last_read_at', { mode: 'timestamp' }).notNull(),
  novelId: text('novel_id')
    .notNull()
    .references(() => novel.id, { onDelete: 'cascade' }),
  progress: real('progress').default(0), // 阅读进度 0-1
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

// 书签表
export const bookmark = sqliteTable('bookmark', {
  chapterId: text('chapter_id')
    .notNull()
    .references(() => chapter.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  id: text('id').primaryKey(),
  note: text('note'), // 书签备注
  novelId: text('novel_id')
    .notNull()
    .references(() => novel.id, { onDelete: 'cascade' }),
  position: integer('position').default(0), // 章节内位置
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

// 评论表
export const comment = sqliteTable('comment', {
  chapterId: text('chapter_id').references(() => chapter.id, {
    onDelete: 'cascade',
  }),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  id: text('id').primaryKey(),
  likeCount: integer('like_count').default(0),
  novelId: text('novel_id')
    .notNull()
    .references(() => novel.id, { onDelete: 'cascade' }),
  parentId: text('parent_id'), // 回复评论，暂时不设置外键约束
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

// 评分表
export const rating = sqliteTable('rating', {
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  id: text('id').primaryKey(),
  novelId: text('novel_id')
    .notNull()
    .references(() => novel.id, { onDelete: 'cascade' }),
  review: text('review'), // 评价内容
  score: integer('score').notNull(), // 1-5 分
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

// 评论点赞表
export const commentLike = sqliteTable('comment_like', {
  commentId: text('comment_id')
    .notNull()
    .references(() => comment.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})
