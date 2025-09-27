'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Edit, Eye, Filter, Plus, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
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

export default function AdminNovelsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'rating'>(
    'latest'
  )
  const queryClient = useQueryClient()

  const { data: categories } = useQuery(orpc.getCategories.queryOptions())

  const { data: novelsData, isLoading } = useQuery(
    orpc.getNovelList.queryOptions({
      input: {
        categoryId: categoryId || undefined,
        limit: 20,
        page,
        search: search || undefined,
        sortBy,
      },
    })
  )

  const deleteMutation = useMutation(
    orpc.deleteNovel.mutationOptions({
      onError: (error) => {
        toast.error('删除失败：' + error.message)
      },
      onSuccess: () => {
        toast.success('小说删除成功')
        queryClient.invalidateQueries({ queryKey: ['getNovelList'] })
        queryClient.invalidateQueries({ queryKey: ['getAdminStats'] })
      },
    })
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // 重置页码
  }

  const handleDelete = (novelId: string) => {
    deleteMutation.mutate(novelId)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题和操作 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-bold text-3xl">小说管理</h1>
          <p className="text-muted-foreground">管理所有小说作品</p>
        </div>
        <Button asChild>
          <Link href="/admin/novels/create">
            <Plus className="mr-2 h-4 w-4" />
            添加小说
          </Link>
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <form className="space-y-4" onSubmit={handleSearch}>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
                <Input
                  className="pl-10"
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索小说标题或作者..."
                  value={search}
                />
              </div>
              <Button type="submit">搜索</Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">筛选：</span>
              </div>

              <Select
                onValueChange={(value) =>
                  setCategoryId(value === 'all' ? '' : value)
                }
                value={categoryId || 'all'}
              >
                <SelectTrigger className="w-40">
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
                  <SelectItem value="latest">最新创建</SelectItem>
                  <SelectItem value="popular">最受欢迎</SelectItem>
                  <SelectItem value="rating">评分最高</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 小说列表 */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card className="animate-pulse" key={`skeleton-${i}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-16 rounded bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-muted" />
                    <div className="h-3 w-1/4 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-16 rounded bg-muted" />
                    <div className="h-8 w-16 rounded bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : novelsData?.novels.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">暂无小说</h3>
            <p className="mb-4 text-muted-foreground">
              还没有创建任何小说，开始添加第一部作品吧
            </p>
            <Button asChild>
              <Link href="/admin/novels/create">
                <Plus className="mr-2 h-4 w-4" />
                创建小说
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            {novelsData?.novels.map((novel) => (
              <Card
                className="transition-shadow hover:shadow-lg"
                key={novel.id}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* 封面 */}
                    <div className="flex h-20 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 font-bold text-lg text-white">
                      {novel.title.charAt(0)}
                    </div>

                    {/* 小说信息 */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="line-clamp-1 font-semibold text-lg">
                            {novel.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            作者：{novel.author}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${
                              novel.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : novel.status === 'ongoing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                            variant="secondary"
                          >
                            {novel.status === 'completed'
                              ? '已完结'
                              : novel.status === 'ongoing'
                                ? '连载中'
                                : '暂停'}
                          </Badge>
                        </div>
                      </div>

                      <p className="mb-3 line-clamp-2 text-muted-foreground text-sm">
                        {novel.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-muted-foreground text-sm">
                          <span>{novel.chapterCount} 章</span>
                          <span>{novel.viewCount.toLocaleString()} 阅读</span>
                          <span>⭐ {novel.rating}</span>
                          <span>
                            {new Date(novel.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button asChild size="sm" variant="ghost">
                            <Link href={`/novels/${novel.id}`}>
                              <Eye className="mr-1 h-4 w-4" />
                              预览
                            </Link>
                          </Button>

                          <Button size="sm" variant="outline">
                            <Link href={`/admin/novels/${novel.id}`}>详情</Link>
                          </Button>

                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/novels/${novel.id}/edit`}>
                              <Edit className="mr-1 h-4 w-4" />
                              编辑
                            </Link>
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="mr-1 h-4 w-4" />
                                删除
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除小说《{novel.title}
                                  》吗？此操作不可撤销，将同时删除所有相关的章节和数据。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDelete(novel.id)}
                                >
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 分页 */}
          {novelsData && novelsData.pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
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
