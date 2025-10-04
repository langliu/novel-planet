'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { useBreadcrumb } from '@/app/(admin)/admin/breadcrumb-provider'
import { Button } from '@/components/ui/button'
import { NovelDataTable } from './data-table'

export default function AdminNovelsPage() {
  const { setBreadcrumb } = useBreadcrumb()
  useEffect(() => {
    setBreadcrumb([
      {
        href: '/admin/novels',
        label: '小说',
      },
    ])
  }, [setBreadcrumb])

  return (
    <div className="container mx-auto">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl lg:text-2xl">小说管理</h1>
        </div>
        <Button asChild>
          <Link href="/admin/novels/create">
            <Plus className="mr-2 h-4 w-4" />
            添加小说
          </Link>
        </Button>
      </div>

      {/* 小说表格 */}
      <NovelDataTable />
    </div>
  )
}
