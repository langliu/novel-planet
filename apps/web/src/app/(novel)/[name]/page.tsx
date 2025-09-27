'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { orpc } from '@/utils/orpc'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, BookOpen, Star, Eye } from 'lucide-react'

export default function AuthorPage() {
  const params = useParams()
  const authorName = decodeURIComponent(params.name as string)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'rating'>('popular')

  const { data: novelsData, isLoading } = useQuery(
    orpc.getNovelList.queryOptions({
      page,
      limit: 20,
      search: `author:${authorName}`, // 使用特殊搜索语法搜索作者
      sortBy,
    })
  )

  // 计算作者统计信息
  const authorStats = novelsData ? {
    totalNovels: novelsData.pagination.total,
    totalViews: novelsData.novels.reduce((sum, novel) => sum + novel.viewCount, 0),
    totalChapters: novelsData.novels.reduce((sum, novel) => sum + novel.chapterCount, 0),
    avgRating: novelsData.novels.length > 0 
      ? (novelsData.novels.reduce((sum, novel) => sum + novel.rating, 0) / novelsData.novels.length).toFixed(1)
      : '0.0',
    completedNovels: novelsData.novels.filter(novel => novel.status === 'completed').length,
    ongoingNovels: novelsData.novels.filter(novel => novel.status === 'ongoing').length,
  } : null

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 面包屑导航 */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">首页</Link>
        <span className="mx-2">/</span>
        <Link href="/novels" className="hover:text-primary">小说</Link>
        <span className="mx-2">/</span>
        <span>作者：{authorName}</span>
      </nav>

      {/* 返回按钮 */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/novels">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回小说列表
          </Link>
        </Button>
      </div>

      {/* 作者信息 */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {authorName.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{authorName}</h1>
            <p className="text-muted-foreground">
              {novelsData?.pagination.total || 0} 部作品
            </p>
          </div>
        </div>

        {/* 作者统计 */}
        {authorStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold">{authorStats.totalNovels}</div>
                <div className="text-xs text-muted-foreground">作品数</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">{authorStats.totalViews.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">总阅读</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold">{authorStats.avgRating}</div>
                <div className="text-xs text-muted-foreground">平均评分</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{authorStats.totalChapters}</div>
                <div className="text-xs text-muted-foreground">总章节</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{authorStats.completedNovels}</div>
                <div className="text-xs text-muted-foreground">已完结</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{authorStats.ongoingNovels}</div>
                <div className="text-xs text-muted-foreground">连载中</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* 排序选择 */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">排序方式：</span>
          <Select value={sortBy} onValueChange={(value: 'latest' | 'popular' | 'rating') => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">最受欢迎</SelectItem>
              <SelectItem value="latest">最新更新</SelectItem>
              <SelectItem value="rating">评分最高</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 作品列表 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={`skeleton-${i}`} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : novelsData?.novels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">该作者暂无作品</p>
          <Button asChild className="mt-4">
            <Link href="/novels">浏览其他小说</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {novelsData?.novels.map((novel) => (
              <Card key={novel.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    <Link href={`/novels/${novel.id}`} className="hover:text-primary">
                      {novel.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge 
                      variant="secondary"
                      className={`text-xs ${
                        novel.status === 'completed' ? 'bg-green-100 text-green-800' :
                        novel.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {novel.status === 'completed' ? '已完结' : 
                       novel.status === 'ongoing' ? '连载中' : '暂停'}
                    </Badge>
                    <span className="text-xs">⭐ {novel.rating}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {novel.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{novel.chapterCount} 章</span>
                    <span>{novel.viewCount.toLocaleString()} 阅读</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 分页 */}
          {novelsData && novelsData.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                上一页
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, novelsData.pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                disabled={page === novelsData.pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
