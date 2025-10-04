'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { clsx } from 'clsx'
import { format } from 'date-fns'
import { ArrowUpDown, Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { orpc } from '@/utils/orpc'

export type Novel = {
  id: string
  title: string
  author: string
  description: string
  status: 'ongoing' | 'completed' | 'paused'
  chapterCount: number
  viewCount: number
  rating: number
  createdAt: string
  categoryId?: string
}

export const columns: ColumnDef<Novel>[] = [
  {
    accessorKey: 'title',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('title')}</div>
    ),
    enableHiding: false,
    header: '标题',
  },
  {
    accessorKey: 'author',
    header: '作者',
  },
  {
    accessorKey: 'status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const statusClass = clsx({
        'bg-blue-100 text-blue-800': status === 'ongoing',
        'bg-gray-100 text-gray-800': status === 'paused',
        'bg-green-100 text-green-800': status === 'completed',
      })
      function getStatusText(statusEnum: string) {
        switch (statusEnum) {
          case 'completed':
            return '已完结'
          case 'ongoing':
            return '连载中'
          case 'paused':
            return '暂停'
          default:
            return null
        }
      }

      return (
        <Badge className={statusClass} variant="secondary">
          {getStatusText(status)}
        </Badge>
      )
    },
    header: '状态',
  },
  {
    accessorKey: 'chapterCount',
    header: '章节数',
  },
  {
    accessorKey: 'viewCount',
    header: '阅读量',
  },
  {
    accessorKey: 'rating',
    header: '评分',
  },
  {
    accessorKey: 'createdAt',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return format(date, 'yyyy-MM-dd HH:mm')
    },
    header: ({ column }) => (
      <Button
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        variant="ghost"
      >
        创建时间
        <ArrowUpDown />
      </Button>
    ),
  },
  {
    cell: ({ row }) => {
      const novel = row.original
      const queryClient = useQueryClient()

      const deleteMutation = useMutation(
        orpc.deleteNovel.mutationOptions({
          onError: (error) => {
            toast.error(`删除失败：${error.message}`)
          },
          onSuccess: async () => {
            toast.success('小说删除成功')
            await queryClient.invalidateQueries({ queryKey: ['getNovelList'] })
            await queryClient.invalidateQueries({ queryKey: ['getAdminStats'] })
          },
        })
      )

      const handleDelete = () => {
        deleteMutation.mutate({ id: novel.id })
      }

      return (
        <div className={'flex items-center gap-2'}>
          <Link
            className="flex items-center"
            href={`/admin/novels/${novel.id}`}
          >
            <Eye className="size-4" />
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 p-0" variant="ghost">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>操作</DropdownMenuLabel>
              <DropdownMenuItem>
                <Link
                  className="flex items-center"
                  href={`/admin/novels/${novel.id}`}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  查看详情
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  className="flex items-center"
                  href={`/admin/novels/${novel.id}/edit`}
                >
                  <Edit className="mr-2 size-4" />
                  编辑
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                <Trash2 className="size-4 text-red-600" />
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
