'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, X } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { orpc } from '@/utils/orpc'

type NovelFormData = {
  title: string
  author: string
  description: string
  categoryId: string
  status: 'ongoing' | 'completed' | 'paused'
  coverImage: string
  tags: string[]
}

export default function EditNovelPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const novelId = params.id as string

  const [formData, setFormData] = useState<NovelFormData>({
    author: '',
    categoryId: '',
    coverImage: '',
    description: '',
    status: 'ongoing',
    tags: [],
    title: '',
  })
  const [newTag, setNewTag] = useState('')

  // 获取小说详情
  const { data: novelData, isLoading } = useQuery(
    orpc.getNovelDetail.queryOptions({ input: { id: novelId } })
  )
  // 获取分类列表
  const { data: categories } = useQuery(orpc.getCategories.queryOptions())

  // 当小说数据加载完成时，更新表单数据
  React.useEffect(() => {
    if (novelData?.novel && categories && categories.length > 0) {
      const novel = novelData.novel
      setFormData({
        author: novel.author,
        categoryId: novel.categoryId || '',
        coverImage: novel.coverImage || '',
        description: novel.description || '',
        status: novel.status,
        tags: novel.tags?.split(',') || [],
        title: novel.title,
      })
    }
  }, [novelData, categories])

  // 更新小说
  const updateMutation = useMutation({
    ...orpc.updateNovel.mutationOptions(),
    onError: (error) => {
      toast.error(`更新失败：${error.message}`)
    },
    onSuccess: () => {
      toast.success('小说更新成功')
      queryClient.invalidateQueries({ queryKey: ['getNovelDetail'] })
      queryClient.invalidateQueries({ queryKey: ['getNovelList'] })
      queryClient.invalidateQueries({ queryKey: ['getAdminStats'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('请输入小说标题')
      return
    }
    if (!formData.author.trim()) {
      toast.error('请输入作者名称')
      return
    }

    updateMutation.mutate({
      id: novelId,
      ...formData,
    })
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-48 rounded bg-muted" />
          <Card>
            <CardHeader>
              <div className="h-6 w-32 rounded bg-muted" />
              <div className="h-4 w-64 rounded bg-muted" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="h-10 w-full rounded bg-muted" />
              <div className="h-10 w-full rounded bg-muted" />
              <div className="h-32 w-full rounded bg-muted" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!novelData?.novel) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="mb-4 font-bold text-2xl">小说不存在</h1>
        <Button asChild>
          <a href="/admin/novels">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回小说列表
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      {/* 页面标题 */}
      <div className="mb-4 flex items-center">
        <Button onClick={() => router.back()} variant="ghost">
          <ArrowLeft className="size-6" />
        </Button>
        <div>
          <h1 className="font-bold text-xl lg:text-2xl">编辑小说</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>小说信息</CardTitle>
          <CardDescription>编辑小说的基本信息和设置</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">小说标题 *</Label>
              <Input
                id="title"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="请输入小说标题"
                required
                value={formData.title}
              />
            </div>

            {/* 作者 */}
            <div className="space-y-2">
              <Label htmlFor="author">作者 *</Label>
              <Input
                id="author"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, author: e.target.value }))
                }
                placeholder="请输入作者名称"
                required
                value={formData.author}
              />
            </div>

            {/* 描述 */}
            <div className="space-y-2">
              <Label htmlFor="description">小说简介</Label>
              <Textarea
                id="description"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="请输入小说简介"
                rows={4}
                value={formData.description}
              />
            </div>

            {/* 分类和状态 */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">分类</Label>
                <Select
                  onValueChange={(value) => {
                    if (value) {
                      setFormData((prev) => ({ ...prev, categoryId: value }))
                    }
                  }}
                  value={formData.categoryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select
                  onValueChange={(
                    value: 'ongoing' | 'completed' | 'paused'
                  ) => {
                    if (value) {
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  }}
                  value={formData.status}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">连载中</SelectItem>
                    <SelectItem value="completed">已完结</SelectItem>
                    <SelectItem value="paused">暂停</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 封面图片 */}
            <div className="space-y-2">
              <Label htmlFor="coverImage">封面图片链接</Label>
              <Input
                id="coverImage"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    coverImage: e.target.value,
                  }))
                }
                placeholder="请输入封面图片链接"
                value={formData.coverImage}
              />
            </div>

            {/* 标签 */}
            <div className="space-y-2">
              <Label htmlFor="tags">标签</Label>

              <div className="flex gap-2">
                <Input
                  id="tags"
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="输入标签后按回车添加"
                  value={newTag}
                />
                <Button onClick={addTag} type="button" variant="outline">
                  添加
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <div
                    className="inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 font-semibold text-secondary-foreground text-xs transition-colors hover:bg-secondary/80"
                    key={tag}
                  >
                    {tag}
                    <button
                      className="ml-1 hover:text-destructive"
                      onClick={() => removeTag(tag)}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
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
