'use client'

import {
  type ColumnDef,
  flexRender,
  type Table as ReactTable,
} from '@tanstack/react-table'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type DataTableProps<Data, Value> = {
  columns: ColumnDef<Data, Value>[]
  table: ReactTable<Data>
  isLoading?: boolean
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    itemsPerPage?: number
    onItemsPerPageChange?: (itemsPerPage: number) => void
  }
}

// biome-ignore lint/style/noMagicNumbers: 表格分页配置
const PAGE_SIZES = [10, 20, 50]

export function DataTable<Data, Value>({
  columns,
  isLoading,
  pagination,
  table,
}: DataTableProps<Data, Value>) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((_, index) => {
                const key = `table-header-${index}`
                return (
                  <TableHead key={key}>
                    <Skeleton className="h-4 w-full" />
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => {
              const rowKey = `table-body-${rowIndex}`
              return (
                <TableRow key={rowKey}>
                  {columns.map((_column, cellIndex) => {
                    const columnKey = `table-cell-${rowIndex}-${cellIndex}`
                    return (
                      <TableCell key={columnKey}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-state={row.getIsSelected() && 'selected'}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-6 lg:space-x-8">
            {pagination.onItemsPerPageChange && (
              <div className="flex items-center space-x-2">
                <p className="font-medium text-sm">每页显示</p>
                <Select
                  onValueChange={(value) => {
                    pagination.onItemsPerPageChange?.(Number(value))
                  }}
                  value={`${pagination.itemsPerPage || 10}`}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {PAGE_SIZES.map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-center font-medium text-sm">
              第 {pagination.currentPage} 页，共 {pagination.totalPages} 页
            </div>

            <div className="flex items-center space-x-2">
              <Button
                className="hidden h-8 w-8 p-0 lg:flex"
                disabled={pagination.currentPage === 1}
                onClick={() => pagination.onPageChange(1)}
                variant="outline"
              >
                <span className="sr-only">转到第一页</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                className="h-8 w-8 p-0"
                disabled={pagination.currentPage === 1}
                onClick={() =>
                  pagination.onPageChange(pagination.currentPage - 1)
                }
                variant="outline"
              >
                <span className="sr-only">上一页</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                className="h-8 w-8 p-0"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() =>
                  pagination.onPageChange(pagination.currentPage + 1)
                }
                variant="outline"
              >
                <span className="sr-only">下一页</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                className="hidden h-8 w-8 p-0 lg:flex"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => pagination.onPageChange(pagination.totalPages)}
                variant="outline"
              >
                <span className="sr-only">转到末页</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
