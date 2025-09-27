'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Edit, FolderOpen, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { orpc } from '@/utils/orpc'

interface CategoryFormData {
  name: string
  description: string
}

interface Category {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

function DeleteCategoryDialog({
  category,
  onDelete,
}: {
  category: Category
  onDelete: (id: string) => void
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Trash2 className="mr-1 h-4 w-4" />
          删除
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除分类「{category.name}」吗？此操作不可撤销。
            如果该分类下有小说，将无法删除。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => onDelete(category.id)}
          >
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function AdminCategoriesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    description: '',
    name: '',
  })
  const queryClient = useQueryClient()

  const {
    data: categories,
    isLoading,
    refetch,
  } = useQuery(orpc.getCategories.queryOptions())

  const createMutation = useMutation({
    ...orpc.createCategory.mutationOptions(),
    onError: (error) => {
      toast.error('创建失败：' + error.message)
    },
    onSuccess: () => {
      toast.success('分类创建成功')
      setIsCreateDialogOpen(false)
      setFormData({ description: '', name: '' })
      queryClient.invalidateQueries({ queryKey: ['getCategories'] })
      queryClient.invalidateQueries({ queryKey: ['getAdminStats'] })
      refetch()
    },
  })

  const updateMutation = useMutation({
    ...orpc.updateCategory.mutationOptions(),
    onError: (error) => {
      toast.error('更新失败：' + error.message)
    },
    onSuccess: () => {
      toast.success('分类更新成功')
      setIsEditDialogOpen(false)
      setEditingCategory(null)
      setFormData({ description: '', name: '' })
      queryClient.invalidateQueries({ queryKey: ['getCategories'] })
      refetch()
    },
  })

  const deleteMutation = useMutation({
    ...orpc.deleteCategory.mutationOptions(),
    onError: (error) => {
      toast.error('删除失败：' + error.message)
    },
    onSuccess: () => {
      toast.success('分类删除成功')
      queryClient.invalidateQueries({ queryKey: ['getCategories'] })
      queryClient.invalidateQueries({ queryKey: ['getAdminStats'] })
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('请输入分类名称')
      return
    }
    createMutation.mutate(formData)
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setFormData({
      description: category.description || '',
      name: category.name,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('请输入分类名称')
      return
    }
    updateMutation.mutate({
      id: editingCategory.id,
      ...formData,
    })
  }

  const handleDelete = (categoryId: string) => {
    deleteMutation.mutate({ id: categoryId })
  }

  const resetForm = () => {
    setFormData({ description: '', name: '' })
    setEditingCategory(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题和操作 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-bold text-3xl">分类管理</h1>
          <p className="text-muted-foreground">管理小说分类</p>
        </div>

        <Dialog onOpenChange={setIsCreateDialogOpen} open={isCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              添加分类
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建分类</DialogTitle>
              <DialogDescription>添加新的小说分类</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">分类名称 *</Label>
                  <Input
                    id="create-name"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="输入分类名称"
                    required
                    value={formData.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-description">分类描述</Label>
                  <Textarea
                    id="create-description"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="输入分类描述（可选）"
                    rows={3}
                    value={formData.description}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => setIsCreateDialogOpen(false)}
                  type="button"
                  variant="outline"
                >
                  取消
                </Button>
                <Button disabled={createMutation.isPending} type="submit">
                  {createMutation.isPending ? '创建中...' : '创建'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 分类列表 */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card className="animate-pulse" key={`skeleton-${i}`}>
              <CardHeader>
                <div className="mb-2 h-4 w-1/2 rounded bg-muted" />
                <div className="h-3 w-3/4 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="mb-4 h-16 rounded bg-muted" />
                <div className="flex justify-between">
                  <div className="h-6 w-16 rounded bg-muted" />
                  <div className="flex gap-2">
                    <div className="h-8 w-16 rounded bg-muted" />
                    <div className="h-8 w-16 rounded bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : categories?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">暂无分类</h3>
            <p className="mb-4 text-muted-foreground">
              还没有创建任何分类，开始添加第一个分类吧
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              创建分类
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories?.map((category) => (
            <Card
              className="transition-shadow hover:shadow-lg"
              key={category.id}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="line-clamp-1">{category.name}</span>
                  <Badge
                    className="flex items-center gap-1"
                    variant="secondary"
                  >
                    <BookOpen className="h-3 w-3" />0
                  </Badge>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {category.description || '暂无描述'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">
                    创建时间：
                    {new Date(category.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleEdit(category)}
                      size="sm"
                      variant="outline"
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      编辑
                    </Button>

                    <DeleteCategoryDialog
                      category={category}
                      onDelete={handleDelete}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 编辑对话框 */}
      <Dialog onOpenChange={setIsEditDialogOpen} open={isEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑分类</DialogTitle>
            <DialogDescription>修改分类信息</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">分类名称 *</Label>
                <Input
                  id="edit-name"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="输入分类名称"
                  required
                  value={formData.name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">分类描述</Label>
                <Textarea
                  id="edit-description"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="输入分类描述（可选）"
                  rows={3}
                  value={formData.description}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsEditDialogOpen(false)}
                type="button"
                variant="outline"
              >
                取消
              </Button>
              <Button disabled={updateMutation.isPending} type="submit">
                {updateMutation.isPending ? '更新中...' : '更新'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
