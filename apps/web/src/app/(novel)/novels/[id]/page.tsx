'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Eye, Heart, Star } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { orpc } from '@/utils/orpc'

export default function NovelDetailPage() {
  const params = useParams()
  const novelId = params.id as string
  const queryClient = useQueryClient()
  const [showAllChapters, setShowAllChapters] = useState(false)

  const { data: novelData, isLoading } = useQuery(
    orpc.getNovelDetail.queryOptions({ id: novelId })
  )

  const favoriteMutation = useMutation({
    mutationFn: (novelId: string) => orpc.toggleFavorite({ novelId }),
    onError: () => {
      toast.error('操作失败，请重试')
    },
    onSuccess: (data) => {
      toast.success(data.favorited ? '已添加到收藏' : '已取消收藏')
      queryClient.invalidateQueries({ queryKey: ['getNovelDetail'] })
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="mb-4 h-8 w-1/2 rounded bg-muted" />
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="mb-4 h-32 rounded bg-muted" />
              <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </div>
            <div>
              <div className="h-64 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!novelData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="mb-4 font-bold text-2xl">小说不存在</h1>
        <Button asChild>
          <Link href="/novels">返回小说列表</Link>
        </Button>
      </div>
    )
  }

  const { novel, chapters } = novelData
  const tags = novel.tags ? JSON.parse(novel.tags) : []
  const displayChapters = showAllChapters ? chapters : chapters.slice(0, 10)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 面包屑导航 */}
      <nav className="mb-6 text-muted-foreground text-sm">
        <Link className="hover:text-primary" href="/">
          首页
        </Link>
        <span className="mx-2">/</span>
        <Link className="hover:text-primary" href="/novels">
          小说
        </Link>
        <span className="mx-2">/</span>
        <span>{novel.title}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-3">
        {/* 主要内容 */}
        <div className="md:col-span-2">
          <div className="mb-6">
            <h1 className="mb-2 font-bold text-3xl">{novel.title}</h1>
            <p className="mb-4 text-lg text-muted-foreground">
              作者：
              <Link
                className="ml-1 transition-colors hover:text-primary"
                href={`/authors/${encodeURIComponent(novel.author)}`}
              >
                {novel.author}
              </Link>
            </p>

            {/* 标签 */}
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge variant="secondary">
                {novel.status === 'completed'
                  ? '已完结'
                  : novel.status === 'ongoing'
                    ? '连载中'
                    : '暂停'}
              </Badge>
              {tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* 统计信息 */}
            <div className="mb-6 flex items-center gap-6 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{novel.chapterCount} 章</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{novel.viewCount} 阅读</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{novel.favoriteCount} 收藏</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>{novel.rating} 评分</span>
              </div>
            </div>

            {/* 简介 */}
            <div className="prose max-w-none">
              <h3 className="mb-2 font-semibold text-lg">内容简介</h3>
              <p className="text-muted-foreground leading-relaxed">
                {novel.description || '暂无简介'}
              </p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="mb-8 flex gap-4">
            {chapters.length > 0 && (
              <Button asChild size="lg">
                <Link href={`/novels/${novel.id}/chapters/${chapters[0].id}`}>
                  开始阅读
                </Link>
              </Button>
            )}
            <Button
              disabled={favoriteMutation.isPending}
              onClick={() => favoriteMutation.mutate(novel.id)}
              size="lg"
              variant="outline"
            >
              <Heart className="mr-2 h-4 w-4" />
              {favoriteMutation.isPending ? '处理中...' : '收藏'}
            </Button>
          </div>

          {/* 章节列表 */}
          <Card>
            <CardHeader>
              <CardTitle>章节目录</CardTitle>
              <CardDescription>共 {chapters.length} 章</CardDescription>
            </CardHeader>
            <CardContent>
              {chapters.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  暂无章节
                </p>
              ) : (
                <>
                  <div className="grid gap-2">
                    {displayChapters.map((chapter) => (
                      <Link
                        className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted"
                        href={`/novels/${novel.id}/chapters/${chapter.id}`}
                        key={chapter.id}
                      >
                        <div>
                          <h4 className="font-medium">{chapter.title}</h4>
                          <p className="text-muted-foreground text-sm">
                            第 {chapter.chapterNumber} 章 · {chapter.wordCount}{' '}
                            字
                          </p>
                        </div>
                        {!chapter.isFree && (
                          <Badge variant="secondary">付费</Badge>
                        )}
                      </Link>
                    ))}
                  </div>

                  {chapters.length > 10 && (
                    <div className="mt-4 text-center">
                      <Button
                        onClick={() => setShowAllChapters(!showAllChapters)}
                        variant="ghost"
                      >
                        {showAllChapters
                          ? '收起'
                          : `查看全部 ${chapters.length} 章`}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 */}
        <div>
          {/* 封面图 */}
          {novel.coverImage && (
            <Card className="mb-6">
              <CardContent className="p-0">
                <img
                  alt={novel.title}
                  className="h-64 w-full rounded-lg object-cover"
                  src={novel.coverImage}
                />
              </CardContent>
            </Card>
          )}

          {/* 推荐小说 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">相关推荐</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">暂无推荐内容</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
