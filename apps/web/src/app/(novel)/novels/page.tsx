'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { orpc } from '@/utils/orpc'

export default function NovelsPage() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'rating'>(
    'latest'
  )
  const [categoryId, setCategoryId] = useState<string>('')

  const { data: novelsData, isLoading } = useQuery(
    orpc.getNovelList.queryOptions({
      categoryId: categoryId || undefined,
      limit: 20,
      page,
      search: search || undefined,
      sortBy,
    })
  )

  const { data: categories } = useQuery(orpc.getCategories.queryOptions())

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // 重置到第一页
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-6 font-bold text-3xl">小说列表</h1>

        {/* 搜索和筛选 */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <form className="flex flex-1 gap-2" onSubmit={handleSearch}>
            <Input
              className="flex-1"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索小说标题..."
              value={search}
            />
            <Button type="submit">搜索</Button>
          </form>

          <div className="flex gap-2">
            <Select
              onValueChange={(value) =>
                setCategoryId(value === 'all' ? '' : value)
              }
              value={categoryId || 'all'}
            >
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

            <Select
              onValueChange={(value: 'latest' | 'popular' | 'rating') =>
                setSortBy(value)
              }
              value={sortBy}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">最新更新</SelectItem>
                <SelectItem value="popular">最受欢迎</SelectItem>
                <SelectItem value="rating">评分最高</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 小说列表 */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card className="animate-pulse" key={`skeleton-${i}`}>
              <CardHeader>
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="mb-4 h-20 rounded bg-muted" />
                <div className="flex justify-between">
                  <div className="h-3 w-16 rounded bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : novelsData?.novels.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">没有找到相关小说</p>
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {novelsData?.novels.map((novel) => (
              <Card
                className="transition-shadow hover:shadow-lg"
                key={novel.id}
              >
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-base">
                    <Link
                      className="hover:text-primary"
                      href={`/novels/${novel.id}`}
                    >
                      {novel.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    作者：{novel.author}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 line-clamp-3 text-muted-foreground text-sm">
                    {novel.description}
                  </p>
                  <div className="flex items-center justify-between text-muted-foreground text-xs">
                    <span>{novel.chapterCount} 章</span>
                    <span>{novel.viewCount} 阅读</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-muted-foreground text-xs">
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        novel.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : novel.status === 'ongoing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {novel.status === 'completed'
                        ? '已完结'
                        : novel.status === 'ongoing'
                          ? '连载中'
                          : '暂停'}
                    </span>
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
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                variant="outline"
              >
                上一页
              </Button>

              <div className="flex items-center gap-2">
                {Array.from(
                  { length: Math.min(5, novelsData.pagination.totalPages) },
                  (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        size="sm"
                        variant={page === pageNum ? 'default' : 'outline'}
                      >
                        {pageNum}
                      </Button>
                    )
                  }
                )}
              </div>

              <Button
                disabled={page === novelsData.pagination.totalPages}
                onClick={() => setPage(page + 1)}
                variant="outline"
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
