'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Calendar, Edit, MoreHorizontal, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { orpc } from '@/utils/orpc'

export type Chapter = {
  id: string
  chapterNumber: number
  title: string
  wordCount?: number
  isFree: boolean
  publishedAt?: string
  novelId: string
}

export const columns: ColumnDef<Chapter>[] = [
  {
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    id: 'select',
  },
  {
    accessorKey: 'chapterNumber',
    cell: ({ row }) => (
      <div className="font-medium">第 {row.getValue('chapterNumber')} 章</div>
    ),
    header: '章节',
  },
  {
    accessorKey: 'title',
    enableHiding: false,
    header: '标题',
  },
  {
    accessorKey: 'wordCount',
    cell: ({ row }) => {
      const wordCount = row.getValue('wordCount') as number | undefined
      return wordCount?.toLocaleString() || '0'
    },
    header: '字数',
  },
  {
    accessorKey: 'isFree',
    cell: ({ row }) => {
      const isFree = row.getValue('isFree') as boolean
      return (
        <Badge variant={isFree ? 'secondary' : 'outline'}>
          {isFree ? '免费' : '付费'}
        </Badge>
      )
    },
    header: '状态',
  },
  {
    accessorKey: 'publishedAt',
    cell: ({ row }) => {
      const publishedAt = row.getValue('publishedAt') as string | undefined
      if (!publishedAt) {
        return <span>未发布</span>
      }

      return (
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          {format(new Date(publishedAt), 'yyyy-MM-dd', { locale: zhCN })}
        </div>
      )
    },
    header: '发布时间',
  },
  {
    cell: ({ row }) => {
      const chapter = row.original
      const queryClient = useQueryClient()

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

      const handleDelete = () => {
        deleteMutation.mutate({ id: chapter.id })
      }

      return (
        <div className="flex justify-end gap-2">
          <Button asChild size="sm" variant="ghost">
            <Link
              href={`/admin/novels/${chapter.novelId}/chapters/${chapter.id}/edit`}
            >
              <Edit className="size-4" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 p-0" variant="ghost">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>操作</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(chapter.id)}
              >
                复制章节ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    enableHiding: false,
    id: 'actions',
  },
]
