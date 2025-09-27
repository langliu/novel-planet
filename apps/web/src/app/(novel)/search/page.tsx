'use client'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { orpc } from '@/utils/orpc'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter } from 'lucide-react'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'rating'>('popular')
  const [categoryId, setCategoryId] = useState<string>('')

  const { data: categories } = useQuery(orpc.getCategories.queryOptions())

  const { data: searchResults, isLoading } = useQuery(
    orpc.getNovelList.queryOptions({
      page,
      limit: 20,
      search: query || undefined,
      sortBy,
      categoryId: categoryId || undefined,
    }),
    {
      enabled: !!query, // 只有当有搜索词时才执行查询
    }
  )

  // 当URL参数变化时更新搜索词
  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery)
      setPage(1) // 重置页码
    }
  }, [searchParams, query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setPage(1) // 重置页码
      // 更新URL但不刷新页面
      const url = new URL(window.location.href)
      url.searchParams.set('q', query.trim())
      window.history.pushState({}, '', url.toString())
    }
  }

  const hasSearched = !!query

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">搜索小说</h1>
        <p className="text-muted-foreground">
          在海量小说中找到你想要的内容
        </p>
      </div>

      {/* 搜索表单 */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="输入小说名称、作者名或关键词..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">搜索</Button>
            </div>

            {/* 筛选选项 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">筛选：</span>
              </div>
              
              <Select value={categoryId || "all"} onValueChange={(value) => setCategoryId(value === "all" ? "" : value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
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
          </form>
        </CardContent>
      </Card>

      {/* 搜索结果 */}
      {!hasSearched ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">开始搜索</h2>
          <p className="text-muted-foreground">
            输入关键词搜索你感兴趣的小说
          </p>
        </div>
      ) : isLoading ? (
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
      ) : searchResults?.novels.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-semibold mb-2">没有找到相关结果</h2>
          <p className="text-muted-foreground mb-4">
            尝试使用不同的关键词或调整筛选条件
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => setQuery('')}>
              清空搜索
            </Button>
            <Button asChild>
              <Link href="/novels">浏览全部小说</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* 搜索结果统计 */}
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              搜索 "{query}" 找到 {searchResults?.pagination.total} 个结果
            </div>
            <div className="text-sm text-muted-foreground">
              第 {page} 页，共 {searchResults?.pagination.totalPages} 页
            </div>
          </div>

          {/* 结果列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {searchResults?.novels.map((novel) => (
              <Card key={novel.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    <Link href={`/novels/${novel.id}`} className="hover:text-primary">
                      {novel.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    作者：{novel.author}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {novel.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>{novel.chapterCount} 章</span>
                    <span>{novel.viewCount} 阅读</span>
                    <span>⭐ {novel.rating}</span>
                  </div>
                  <div className="flex items-center justify-between">
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 分页 */}
          {searchResults && searchResults.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                上一页
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, searchResults.pagination.totalPages) }, (_, i) => {
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
                disabled={page === searchResults.pagination.totalPages}
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
