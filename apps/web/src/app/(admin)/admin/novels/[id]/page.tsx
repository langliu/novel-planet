'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Edit,
  Filter,
  Search,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useBreadcrumb } from '@/app/(admin)/admin/breadcrumb-provider'
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
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { orpc } from '@/utils/orpc'

// 定义章节类型
type Chapter = {
  id: string
  title: string
  chapterNumber: number
  wordCount: number | null
  isFree: boolean
  publishedAt: string
}

// 定义小说类型
type Novel = {
  id: string
  title: string
}

// 定义API返回数据类型
type NovelDetailData = {
  novel: Novel
  chapters: Chapter[]
}

// 定义分页常量
const ITEMS_PER_PAGE = 10

export default function NovelChaptersPage() {
  const params = useParams()
  const novelId = params.id as string
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [isFree, setIsFree] = useState<string>('all')
  const { setBreadcrumb } = useBreadcrumb()

  // 获取小说详情
  const { data: novelData, isLoading: novelLoading } = useQuery({
    ...orpc.getNovelDetail.queryOptions({ input: { id: novelId } }),
  })

  // 获取章节列表
  const { data: chaptersData, isLoading: chaptersLoading } = useQuery({
    ...orpc.getNovelDetail.queryOptions({ input: { id: novelId } }),
  })

  // 删除章节
  const deleteMutation = useMutation(
    orpc.deleteChapter.mutationOptions({
      onError: (error) => {
        toast.error(`删除失败：${error.message}`)
      },
      onSuccess: () => {
        toast.success('章节删除成功')
        queryClient.invalidateQueries({ queryKey: ['getNovelDetail'] })
      },
    })
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // 重置页码
  }

  const handleDelete = (chapterId: string) => {
    deleteMutation.mutate({ id: chapterId })
  }

  // 筛选和排序章节
  const filterAndSortChapters = () => {
    if (!chaptersData?.chapters) {
      return []
    }

    let filteredChapters = [...chaptersData.chapters]

    // 搜索筛选
    if (search) {
      filteredChapters = filteredChapters.filter((chapter) =>
        chapter.title.toLowerCase().includes(search.toLowerCase())
      )
    }

    // 免费状态筛选
    if (isFree !== 'all') {
      const isFreeValue = isFree === 'free'
      filteredChapters = filteredChapters.filter(
        (chapter) => chapter.isFree === isFreeValue
      )
    }

    // 排序
    return filteredChapters.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date(0)
      const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date(0)

      if (sortBy === 'newest') {
        return dateB.getTime() - dateA.getTime()
      }

      return dateA.getTime() - dateB.getTime()
    })
  }

  const filteredChapters = filterAndSortChapters()

  // 分页逻辑
  const totalPages = Math.ceil((filteredChapters?.length || 0) / ITEMS_PER_PAGE)
  const paginatedChapters = filteredChapters?.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const isLoading = novelLoading || chaptersLoading

  // 渲染章节列表
  const renderChapterList = () => {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div className="flex items-center gap-4" key={`skeleton-${i}`}>
                  <div className="h-4 w-1/12 rounded bg-muted" />
                  <div className="h-4 w-1/3 rounded bg-muted" />
                  <div className="h-4 w-1/6 rounded bg-muted" />
                  <div className="h-4 w-1/6 rounded bg-muted" />
                  <div className="h-4 w-1/6 rounded bg-muted" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )
    }

    if (filteredChapters.length === 0) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">暂无章节</h3>
            <p className="mb-4 text-muted-foreground">
              {search
                ? '没有找到匹配的章节'
                : '还没有创建任何章节，开始添加第一章吧'}
            </p>
            <Button asChild>
              <Link href={`/admin/novels/${novelId}/chapters/create`}>
                <BookOpen className="mr-2 h-4 w-4" />
                添加章节
              </Link>
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">章节</TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>字数</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>发布时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedChapters.map((chapter) => (
                  <TableRow key={chapter.id}>
                    <TableCell className="font-medium">
                      第 {chapter.chapterNumber} 章
                    </TableCell>
                    <TableCell>{chapter.title}</TableCell>
                    <TableCell>
                      {chapter.wordCount?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={chapter.isFree ? 'secondary' : 'outline'}>
                        {chapter.isFree ? '免费' : '付费'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {chapter.publishedAt
                          ? new Date(chapter.publishedAt).toLocaleDateString()
                          : '未发布'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="ghost">
                          <Link
                            href={`/admin/novels/${novelId}/chapters/${chapter.id}/edit`}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除</AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要删除章节 "{chapter.title}"
                                吗？此操作无法撤销。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(chapter.id)}
                              >
                                删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 分页 */}
        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className={
                    page <= 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNumber = i + 1

                // 显示当前页码前后各1页，以及首尾页
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= page - 1 && pageNumber <= page + 1)
                ) {
                  return (
                    <PaginationItem key={`page-${pageNumber}`}>
                      <PaginationLink
                        isActive={page === pageNumber}
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }

                // 显示省略号
                if (pageNumber === 2 && page > 3) {
                  return (
                    <PaginationItem key="ellipsis-start">
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }

                if (pageNumber === totalPages - 1 && page < totalPages - 2) {
                  return (
                    <PaginationItem key="ellipsis-end">
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }

                return null
              })}

              <PaginationItem>
                <PaginationNext
                  className={
                    page >= totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </>
    )
  }

  useEffect(() => {
    setBreadcrumb([
      {
        href: '/admin/novels',
        label: '小说',
      },
      {
        href: '',
        label: novelData?.novel.title || '',
      },
    ])
  }, [setBreadcrumb, novelData])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 返回按钮和页面标题 */}
      <div className="mb-6">
        <Button asChild className="mb-4" variant="ghost">
          <Link href="/admin/novels">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回小说列表
          </Link>
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 font-bold text-3xl">
              {isLoading ? '加载中...' : novelData?.novel.title}
            </h1>
            <p className="text-muted-foreground">管理小说章节</p>
          </div>

          <Button asChild>
            <Link href={`/admin/novels/${novelId}/chapters/create`}>
              <BookOpen className="mr-2 h-4 w-4" />
              添加章节
            </Link>
          </Button>
        </div>
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
                  placeholder="搜索章节标题..."
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
                onValueChange={(value: 'newest' | 'oldest') => setSortBy(value)}
                value={sortBy}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">最新发布</SelectItem>
                  <SelectItem value="oldest">最早发布</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={setIsFree} value={isFree}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部章节</SelectItem>
                  <SelectItem value="free">免费章节</SelectItem>
                  <SelectItem value="paid">付费章节</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 章节列表 */}
      {renderChapterList()}
    </div>
  )
}
