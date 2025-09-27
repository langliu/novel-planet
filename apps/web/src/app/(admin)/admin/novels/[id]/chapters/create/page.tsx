'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, BookOpen, Save } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { orpc } from '@/utils/orpc'

// 定义章节表单数据接口
type ChapterFormData = {
  title: string
  content: string
  chapterNumber: number
  isFree: boolean
}

export default function CreateChapterPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const novelId = params.id as string

  // 表单状态
  const [formData, setFormData] = useState<ChapterFormData>({
    chapterNumber: 1,
    content: '',
    isFree: true,
    title: '',
  })

  // 获取小说详情，用于显示小说标题和自动设置章节号
  const { data: novelData, isLoading } = useQuery({
    ...orpc.getNovelDetail.queryOptions({ input: { id: novelId } }),
  })

  // 当小说数据加载完成时，更新章节号
  useEffect(() => {
    if (
      novelData?.novel &&
      novelData.chapters &&
      novelData.chapters.length > 0
    ) {
      // 如果有章节，则设置为最后一章的章节号+1
      const lastChapterNumber = Math.max(
        ...novelData.chapters.map((chapter) => chapter.chapterNumber || 0)
      )
      setFormData((prev) => ({
        ...prev,
        chapterNumber: lastChapterNumber + 1,
      }))
    }
  }, [novelData])

  // 创建章节的 mutation
  const createMutation = useMutation({
    ...orpc.createChapter.mutationOptions(),
    onError: (error) => {
      toast.error(`创建失败：${error.message}`)
    },
    onSuccess: () => {
      toast.success('章节创建成功')
      queryClient.invalidateQueries({ queryKey: ['getNovelDetail'] })
      // 创建成功后返回章节列表页
      router.push(`/admin/novels/${novelId}`)
    },
  })

  // 表单提交处理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 表单验证
    if (!formData.title.trim()) {
      toast.error('请输入章节标题')
      return
    }

    if (!formData.content.trim()) {
      toast.error('请输入章节内容')
      return
    }

    // 提交表单
    createMutation.mutate({
      chapterNumber: formData.chapterNumber,
      content: formData.content,
      isFree: formData.isFree,
      novelId,
      title: formData.title,
    })
  }

  // 计算字数
  const wordCount = formData.content.trim().length

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 返回按钮和页面标题 */}
      <div className="mb-6">
        <Button asChild className="mb-4" variant="ghost">
          <Link href={`/admin/novels/${novelId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回章节列表
          </Link>
        </Button>

        <div>
          <h1 className="mb-2 font-bold text-3xl">
            {isLoading ? '加载中...' : `添加章节 - ${novelData?.novel.title}`}
          </h1>
          <p className="text-muted-foreground">创建新的小说章节</p>
        </div>
      </div>

      {/* 创建章节表单 */}
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* 章节标题 */}
              <div className="space-y-2">
                <Label htmlFor="title">章节标题</Label>
                <Input
                  id="title"
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="请输入章节标题"
                  value={formData.title}
                />
              </div>

              {/* 章节号 */}
              <div className="space-y-2">
                <Label htmlFor="chapterNumber">章节号</Label>
                <Input
                  id="chapterNumber"
                  min="1"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      chapterNumber: Number.parseInt(e.target.value) || 1,
                    })
                  }
                  type="number"
                  value={formData.chapterNumber}
                />
              </div>

              {/* 是否免费 */}
              <div className="flex items-center justify-between">
                <Label htmlFor="isFree">免费章节</Label>
                <Switch
                  checked={formData.isFree}
                  id="isFree"
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFree: checked })
                  }
                />
              </div>

              {/* 章节内容 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">章节内容</Label>
                  <span className="text-muted-foreground text-sm">
                    字数：{wordCount}
                  </span>
                </div>
                <Textarea
                  className="min-h-[400px]"
                  id="content"
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="请输入章节内容"
                  value={formData.content}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 提交按钮 */}
        <div className="flex justify-end gap-4">
          <Button
            onClick={() => router.push(`/admin/novels/${novelId}`)}
            type="button"
            variant="outline"
          >
            取消
          </Button>
          <Button
            className="gap-2"
            disabled={createMutation.isPending}
            type="submit"
          >
            <Save className="h-4 w-4" />
            {createMutation.isPending ? '保存中...' : '保存章节'}
          </Button>
        </div>
      </form>
    </div>
  )
}
