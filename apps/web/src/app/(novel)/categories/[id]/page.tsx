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
import { ArrowLeft } from 'lucide-react'

export default function CategoryDetailPage() {
  const params = useParams()
  const categoryId = params.id as string
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'rating'>('popular')

  const { data: categories } = useQuery(orpc.getCategories.queryOptions())
  const currentCategory = categories?.find(cat => cat.id === categoryId)

  const { data: novelsData, isLoading } = useQuery(
    orpc.getNovelList.queryOptions({
      page,
      limit: 20,
      categoryId,
      sortBy,
    })
  )

  if (!currentCategory && categories) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">分类不存在</h1>
        <Button asChild>
          <Link href="/categories">返回分类列表</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 面包屑导航 */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">首页</Link>
        <span className="mx-2">/</span>
        <Link href="/categories" className="hover:text-primary">分类</Link>
        <span className="mx-2">/</span>
        <span>{currentCategory?.name}</span>
      </nav>

      {/* 返回按钮 */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/categories">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回分类列表
          </Link>
        </Button>
      </div>

      {/* 分类信息 */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold">{currentCategory?.name}</h1>
          <Badge variant="outline">
            {novelsData?.pagination.total || 0} 部作品
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          {currentCategory?.description}
        </p>
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
        
        {novelsData && (
          <div className="text-sm text-muted-foreground">
            共 {novelsData.pagination.total} 部作品
          </div>
        )}
      </div>

      {/* 小说列表 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
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
          <p className="text-muted-foreground text-lg">该分类下暂无小说</p>
          <Button asChild className="mt-4">
            <Link href="/novels">浏览其他小说</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {novelsData?.novels.map((novel) => (
              <Card key={novel.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-base">
                    <Link href={`/novels/${novel.id}`} className="hover:text-primary">
                      {novel.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    作者：{novel.author}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {novel.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{novel.chapterCount} 章</span>
                    <span>{novel.viewCount} 阅读</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
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
                    <span>⭐ {novel.rating}</span>
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
