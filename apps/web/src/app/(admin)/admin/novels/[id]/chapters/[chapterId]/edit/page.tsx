'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import type React from 'react'
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

export default function EditChapterPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const novelId = params.id as string
  const chapterId = params.chapterId as string

  // 表单状态
  const [formData, setFormData] = useState<ChapterFormData>({
    chapterNumber: 1,
    content: '',
    isFree: true,
    title: '',
  })

  // 获取章节详情
  const { data: chapterData, isLoading: isLoadingChapter } = useQuery({
    ...orpc.getChapterDetail.queryOptions({ input: { id: chapterId } }),
  })

  // 获取小说详情，用于显示小说标题
  const { data: novelData, isLoading: isLoadingNovel } = useQuery({
    ...orpc.getNovelDetail.queryOptions({ input: { id: novelId } }),
  })

  // 当章节数据加载完成时，更新表单数据
  useEffect(() => {
    if (chapterData) {
      setFormData({
        chapterNumber: chapterData.chapterNumber || 1,
        content: chapterData.content || '',
        isFree: chapterData.isFree ?? true,
        title: chapterData.title,
      })
    }
  }, [chapterData])

  // 更新章节的 mutation
  const updateMutation = useMutation({
    ...orpc.updateChapter.mutationOptions(),
    onError: (error) => {
      toast.error(`更新失败：${error.message}`)
    },
    onSuccess: () => {
      toast.success('章节更新成功')
      queryClient.invalidateQueries({ queryKey: ['getNovelDetail'] })
      queryClient.invalidateQueries({ queryKey: ['getChapterDetail'] })
      // 更新成功后返回小说详情页
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
    updateMutation.mutate({
      chapterNumber: formData.chapterNumber,
      content: formData.content,
      id: chapterId,
      isFree: formData.isFree,
      title: formData.title,
    })
  }

  const isLoading = isLoadingChapter || isLoadingNovel

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-48 rounded bg-muted" />
          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="h-10 w-full rounded bg-muted" />
              <div className="h-10 w-full rounded bg-muted" />
              <div className="h-64 w-full rounded bg-muted" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!chapterData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="mb-4 font-bold text-2xl">章节不存在</h1>
        <Button asChild>
          <a href={`/admin/novels/${novelId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回小说详情
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">编辑章节</h1>
          <p className="text-muted-foreground">
            {novelData?.novel?.title || '加载中...'}
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
      </div>

      {/* 表单卡片 */}
      <Card>
        <CardContent className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 章节标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">章节标题 *</Label>
              <Input
                id="title"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="请输入章节标题"
                required
                value={formData.title}
              />
            </div>

            {/* 章节号和免费设置 */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="chapterNumber">章节号 *</Label>
                <Input
                  id="chapterNumber"
                  min={1}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      chapterNumber: Number.parseInt(e.target.value, 10) || 1,
                    }))
                  }
                  required
                  type="number"
                  value={formData.chapterNumber}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isFree">免费章节</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    checked={formData.isFree}
                    id="isFree"
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isFree: checked }))
                    }
                  />
                  <Label className="cursor-pointer" htmlFor="isFree">
                    {formData.isFree ? '免费' : '付费'}
                  </Label>
                </div>
              </div>
            </div>

            {/* 章节内容 */}
            <div className="space-y-2">
              <Label htmlFor="content">章节内容 *</Label>
              <Textarea
                className="min-h-[400px] font-mono"
                id="content"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="请输入章节内容"
                required
                value={formData.content}
              />
              <p className="text-muted-foreground text-sm">
                字数：{formData.content.length}
              </p>
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-4">
              <Button
                className="flex-1"
                disabled={updateMutation.isPending}
                type="submit"
              >
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? '保存中...' : '保存更改'}
              </Button>
              <Button
                onClick={() => router.back()}
                type="button"
                variant="outline"
              >
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
