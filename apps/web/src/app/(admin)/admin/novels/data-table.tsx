'use client'

import { useQuery } from '@tanstack/react-query'
import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { debounce } from 'es-toolkit'
import { CircleX, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { orpc } from '@/utils/orpc'
import { columns } from './columns'

export type DataTableProps<Data> = {
  columns: ColumnDef<Data>[]
  data: Data[]
  isLoading: boolean
}

const DebounceMs = 500

export function NovelDataTable<Data>({
  data: externalData,
  isLoading: externalLoading,
}: DataTableProps<Data>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [search, setSearch] = useState<string | undefined>(undefined)
  const [querySearch, setQuerySearch] = useState<string | undefined>(undefined)
  const [categoryId, setCategoryId] = useState('')

  const { data: categories } = useQuery(orpc.getCategories.queryOptions())
  const { data: queryData, isLoading: queryLoading } = useQuery(
    orpc.getNovelList.queryOptions({
      input: {
        categoryId: categoryId || undefined,
        limit: 20,
        // page,
        search: querySearch || undefined,
        // sortBy,
      },
    })
  )

  // 使用外部传入的数据或查询数据
  const data = externalData || queryData?.novels || []
  const isLoading = externalLoading || queryLoading

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      sorting,
    },
  })

  // 使用防抖优化搜索输入
  const debouncedSetSearch = debounce((event: string) => {
    setQuerySearch(event)
  }, DebounceMs)

  function handleSearchChange(value: string) {
    setSearch(value)
    debouncedSetSearch(value)
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <InputGroup className="max-w-xs">
          <InputGroupInput
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="搜索小说标题"
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
        <Select
          onValueChange={(value) => setCategoryId(value === 'all' ? '' : value)}
          value={categoryId || 'all'}
        >
          <SelectTrigger className="ml-4 w-40">
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
      <DataTable columns={columns} isLoading={isLoading} table={table} />
    </div>
  )
}
