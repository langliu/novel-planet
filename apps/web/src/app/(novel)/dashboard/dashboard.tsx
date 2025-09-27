'use client'
import { useQuery } from '@tanstack/react-query'
import { Bookmark, Heart, History, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

export default function Dashboard({
  session,
}: {
  session: typeof authClient.$Infer.Session
}) {
  const [activeTab, setActiveTab] = useState('favorites')

  const { data: favorites, isLoading: favoritesLoading } = useQuery(
    orpc.getUserFavorites.queryOptions({ limit: 10, page: 1 })
  )

  const { data: readingHistory, isLoading: historyLoading } = useQuery(
    orpc.getReadingHistory.queryOptions({ limit: 10, page: 1 })
  )

  const { data: bookmarks, isLoading: bookmarksLoading } = useQuery(
    orpc.getUserBookmarks.queryOptions({ limit: 10, page: 1 })
  )

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">我的收藏</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {favorites?.pagination.total || 0}
            </div>
            <p className="text-muted-foreground text-xs">本小说已收藏</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">阅读历史</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {readingHistory?.pagination.total || 0}
            </div>
            <p className="text-muted-foreground text-xs">本小说已阅读</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">我的书签</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {bookmarks?.pagination.total || 0}
            </div>
            <p className="text-muted-foreground text-xs">个书签已保存</p>
          </CardContent>
        </Card>
      </div>

      {/* 详细内容 */}
      <Tabs onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="favorites">我的收藏</TabsTrigger>
          <TabsTrigger value="history">阅读历史</TabsTrigger>
          <TabsTrigger value="bookmarks">我的书签</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>收藏的小说</CardTitle>
              <CardDescription>你收藏的所有小说</CardDescription>
            </CardHeader>
            <CardContent>
              {favoritesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      className="flex animate-pulse items-center space-x-4"
                      key={i}
                    >
                      <div className="h-12 w-12 rounded bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 rounded bg-muted" />
                        <div className="h-3 w-1/2 rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : favorites?.favorites.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">还没有收藏任何小说</p>
                  <Button asChild className="mt-4">
                    <Link href="/novels">去发现好书</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {favorites?.favorites.map(({ novel, favoriteAt }) => (
                    <div
                      className="flex items-center justify-between rounded-lg border p-4"
                      key={novel.id}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex h-16 w-12 items-center justify-center rounded bg-muted">
                          📚
                        </div>
                        <div>
                          <h4 className="font-medium">
                            <Link
                              className="hover:text-primary"
                              href={`/novels/${novel.id}`}
                            >
                              {novel.title}
                            </Link>
                          </h4>
                          <p className="text-muted-foreground text-sm">
                            {novel.author} · {novel.chapterCount} 章
                          </p>
                          <p className="text-muted-foreground text-xs">
                            收藏于 {new Date(favoriteAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/novels/${novel.id}`}>阅读</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="history">
          <Card>
            <CardHeader>
              <CardTitle>阅读历史</CardTitle>
              <CardDescription>最近阅读的小说</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      className="flex animate-pulse items-center space-x-4"
                      key={i}
                    >
                      <div className="h-12 w-12 rounded bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 rounded bg-muted" />
                        <div className="h-3 w-1/2 rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : readingHistory?.history.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">还没有阅读记录</p>
                  <Button asChild className="mt-4">
                    <Link href="/novels">开始阅读</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {readingHistory?.history.map(
                    ({ novel, chapter, progress, lastReadAt }) => (
                      <div
                        className="flex items-center justify-between rounded-lg border p-4"
                        key={`${novel.id}-${lastReadAt}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex h-16 w-12 items-center justify-center rounded bg-muted">
                            📖
                          </div>
                          <div>
                            <h4 className="font-medium">
                              <Link
                                className="hover:text-primary"
                                href={`/novels/${novel.id}`}
                              >
                                {novel.title}
                              </Link>
                            </h4>
                            <p className="text-muted-foreground text-sm">
                              {chapter ? `读到：${chapter.title}` : '开始阅读'}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {new Date(lastReadAt).toLocaleDateString()} · 进度{' '}
                              {Math.round(progress * 100)}%
                            </p>
                          </div>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link
                            href={
                              chapter
                                ? `/novels/${novel.id}/chapters/${chapter.id}`
                                : `/novels/${novel.id}`
                            }
                          >
                            继续阅读
                          </Link>
                        </Button>
                      </div>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="bookmarks">
          <Card>
            <CardHeader>
              <CardTitle>我的书签</CardTitle>
              <CardDescription>保存的阅读位置</CardDescription>
            </CardHeader>
            <CardContent>
              {bookmarksLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      className="flex animate-pulse items-center space-x-4"
                      key={i}
                    >
                      <div className="h-12 w-12 rounded bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 rounded bg-muted" />
                        <div className="h-3 w-1/2 rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : bookmarks?.bookmarks.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">还没有保存任何书签</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookmarks?.bookmarks.map(({ bookmark, novel, chapter }) => (
                    <div
                      className="flex items-center justify-between rounded-lg border p-4"
                      key={bookmark.id}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex h-16 w-12 items-center justify-center rounded bg-muted">
                          🔖
                        </div>
                        <div>
                          <h4 className="font-medium">
                            <Link
                              className="hover:text-primary"
                              href={`/novels/${novel.id}`}
                            >
                              {novel.title}
                            </Link>
                          </h4>
                          <p className="text-muted-foreground text-sm">
                            {chapter.title}
                          </p>
                          {bookmark.note && (
                            <p className="text-muted-foreground text-xs italic">
                              "{bookmark.note}"
                            </p>
                          )}
                          <p className="text-muted-foreground text-xs">
                            {new Date(bookmark.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={`/novels/${novel.id}/chapters/${chapter.id}`}
                        >
                          跳转
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
