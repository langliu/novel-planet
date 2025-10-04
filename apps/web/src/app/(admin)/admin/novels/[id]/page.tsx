'use client'
import { useQuery } from '@tanstack/react-query'
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { CircleX, Plus, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useBreadcrumb } from '@/app/(admin)/admin/breadcrumb-provider'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { orpc } from '@/utils/orpc'
import { columns } from './columns'

export default function NovelChaptersPage() {
  const params = useParams()
  const novelId = params.id as string
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { setBreadcrumb } = useBreadcrumb()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // 获取小说详情
  const { data: novelData, isLoading } = useQuery({
    ...orpc.getNovelDetail.queryOptions({
      input: {
        id: novelId,
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
      },
    }),
  })

  const table = useReactTable({
    columns,
    data: novelData?.chapters || [],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    rowCount: novelData?.novel.chapterCount || 0,
    state: {
      columnFilters,
      columnVisibility,
      pagination,
      rowSelection,
      sorting,
    },
  })

  function handleSearchChange(value: string) {
    setSearch(value)
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
    <div className="container mx-auto">
      {/* 返回按钮和页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl lg:text-2xl">
            {isLoading ? '加载中...' : novelData?.novel.title}
          </h1>
        </div>

        <Button asChild>
          <Link href={`/admin/novels/${novelId}/chapters/create`}>
            <Plus className="size-4" />
            添加章节
          </Link>
        </Button>
      </div>

      <div className="flex items-center py-4">
        <InputGroup className="max-w-xs">
          <InputGroupInput
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="搜索章节标题"
            value={search}
          />
          {Boolean(search) && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                className="rounded-full"
                onClick={() => handleSearchChange('')}
                size="icon-xs"
              >
                <CircleX />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
        {/*<Select*/}
        {/*  onValueChange={(value) => setCategoryId(value === 'all' ? '' : value)}*/}
        {/*  value={categoryId || 'all'}*/}
        {/*>*/}
        {/*  <SelectTrigger className="ml-4 w-40">*/}
        {/*    <SelectValue placeholder="分类" />*/}
        {/*  </SelectTrigger>*/}
        {/*  <SelectContent>*/}
        {/*    <SelectItem value="all">全部分类</SelectItem>*/}
        {/*    <SelectItem value={'free'}>免费章节</SelectItem>*/}
        {/*    <SelectItem value={'paid'}>付费章节</SelectItem>*/}
        {/*  </SelectContent>*/}
        {/*</Select>*/}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="ml-auto" variant="outline">
              <SlidersHorizontal /> Views
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                // 获取列的标题，如果存在自定义header则使用，否则使用column.id
                const header = column.columnDef.header
                let headerText = column.id

                if (typeof header === 'string') {
                  headerText = header
                } else if (typeof header === 'function') {
                  // 对于函数类型的header，我们暂时还是使用column.id
                  // 因为在dropdown中渲染可能会有问题
                  headerText = column.id
                }

                return (
                  <DropdownMenuCheckboxItem
                    checked={column.getIsVisible()}
                    className="capitalize"
                    key={column.id}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {headerText}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 章节列表表格 */}
      <DataTable
        columns={columns}
        isLoading={isLoading}
        pagination={{
          currentPage: table.getState().pagination.pageIndex + 1,
          onPageChange: (pageNumber: number) => {
            setPage(pageNumber)
            table.setPageIndex(pageNumber - 1)
          },
          totalPages: Math.ceil((novelData?.novel.chapterCount || 0) / 10),
        }}
        table={table}
      />
    </div>
  )
}
