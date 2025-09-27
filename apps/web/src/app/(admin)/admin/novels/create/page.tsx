'use client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
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

export default function CreateNovelPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    author: '',
    categoryId: '',
    coverImage: '',
    description: '',
    status: 'ongoing' as 'ongoing' | 'completed' | 'paused',
    tags: [] as string[],
    title: '',
  })
  const [newTag, setNewTag] = useState('')

  const { data: categories } = useQuery(orpc.getCategories.queryOptions())

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => orpc.createNovel.call(data),
    onError: (error) => {
      toast.error(`创建失败：${error.message}`)
    },
    onSuccess: (novel) => {
      toast.success('小说创建成功')
      router.push(`/admin/novels/${novel.id}/edit`)
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
    if (!formData.description.trim()) {
      toast.error('请输入小说简介')
      return
    }
    if (!formData.categoryId) {
      toast.error('请选择分类')
      return
    }

    createMutation.mutate(formData)
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8 flex items-center gap-4">
        <Button asChild size="sm" variant="ghost">
          <Link href="/admin/novels">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Link>
        </Button>
        <div>
          <h1 className="font-bold text-3xl">创建小说</h1>
          <p className="text-muted-foreground">添加新的小说作品</p>
        </div>
      </div>

      <form className="max-w-2xl" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>填写小说的基本信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">小说标题 *</Label>
              <Input
                id="title"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="输入小说标题"
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
                placeholder="输入作者名称"
                required
                value={formData.author}
              />
            </div>

            {/* 分类 */}
            <div className="space-y-2">
              <Label htmlFor="category">分类 *</Label>
              <Select
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, categoryId: value }))
                }
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

            {/* 状态 */}
            <div className="space-y-2">
              <Label htmlFor="status">状态</Label>
              <Select
                onValueChange={(value: 'ongoing' | 'completed' | 'paused') =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
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

            {/* 封面图片 */}
            <div className="space-y-2">
              <Label htmlFor="coverImage">封面图片 URL</Label>
              <Input
                id="coverImage"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    coverImage: e.target.value,
                  }))
                }
                placeholder="输入封面图片链接（可选）"
                value={formData.coverImage}
              />
            </div>

            {/* 简介 */}
            <div className="space-y-2">
              <Label htmlFor="description">小说简介 *</Label>
              <Textarea
                id="description"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="输入小说简介"
                required
                rows={4}
                value={formData.description}
              />
            </div>

            {/* 标签 */}
            <div className="space-y-2">
              <Label htmlFor="tags">标签</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入标签后按回车添加"
                  value={newTag}
                />
                <Button onClick={addTag} size="sm" type="button">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
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
              )}
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="mt-8 flex gap-4">
          <Button
            className="min-w-24"
            disabled={createMutation.isPending}
            type="submit"
          >
            {createMutation.isPending ? '创建中...' : '创建小说'}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link href="/admin/novels">取消</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
