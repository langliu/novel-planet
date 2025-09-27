'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { orpc } from '@/utils/orpc'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { toast } from 'sonner'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileText,
  BookOpen,
  Filter,
  Eye
} from 'lucide-react'

interface ChapterFormData {
  novelId: string
  title: string
  content: string
  chapterNumber: number
  isFree: boolean
}

export default function AdminChaptersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedNovelId, setSelectedNovelId] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingChapter, setEditingChapter] = useState<any>(null)
  const [formData, setFormData] = useState<ChapterFormData>({
    novelId: '',
    title: '',
    content: '',
    chapterNumber: 1,
    isFree: true,
  })
  const queryClient = useQueryClient()

  const { data: novels } = useQuery(
    orpc.getNovelList.queryOptions({
      page: 1,
      limit: 100,
      sortBy: 'latest',
    })
  )

  // 这里需要一个获取章节列表的API，暂时使用模拟数据
  const chapters = []
  const isLoading = false

  const createMutation = useMutation({
    mutationFn: (data: ChapterFormData) => orpc.createChapter(data),
    onSuccess: () => {
      toast.success('章节创建成功')
      setIsCreateDialogOpen(false)
      resetForm()
      // 刷新章节列表
    },
    onError: (error) => {
      toast.error('创建失败：' + error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: ChapterFormData & { id: string }) => orpc.updateChapter(data),
    onSuccess: () => {
      toast.success('章节更新成功')
      setIsEditDialogOpen(false)
      setEditingChapter(null)
      resetForm()
      // 刷新章节列表
    },
    onError: (error) => {
      toast.error('更新失败：' + error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (chapterId: string) => orpc.deleteChapter({ id: chapterId }),
    onSuccess: () => {
      toast.success('章节删除成功')
      // 刷新章节列表
    },
    onError: (error) => {
      toast.error('删除失败：' + error.message)
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.novelId) {
      toast.error('请选择小说')
      return
    }
    if (!formData.title.trim()) {
      toast.error('请输入章节标题')
      return
    }
    if (!formData.content.trim()) {
      toast.error('请输入章节内容')
      return
    }
    createMutation.mutate(formData)
  }

  const handleEdit = (chapter: any) => {
    setEditingChapter(chapter)
    setFormData({
      novelId: chapter.novelId,
      title: chapter.title,
      content: chapter.content,
      chapterNumber: chapter.chapterNumber,
      isFree: chapter.isFree,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('请输入章节标题')
      return
    }
    if (!formData.content.trim()) {
      toast.error('请输入章节内容')
      return
    }
    updateMutation.mutate({
      id: editingChapter.id,
      ...formData,
    })
  }

  const handleDelete = (chapterId: string) => {
    deleteMutation.mutate(chapterId)
  }

  const resetForm = () => {
    setFormData({
      novelId: '',
      title: '',
      content: '',
      chapterNumber: 1,
      isFree: true,
    })
    setEditingChapter(null)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    // 执行搜索
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">章节管理</h1>
          <p className="text-muted-foreground">
            管理所有小说章节
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              添加章节
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>创建章节</DialogTitle>
              <DialogDescription>
                为小说添加新章节
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-novel">选择小说 *</Label>
                    <Select value={formData.novelId} onValueChange={(value) => setFormData(prev => ({ ...prev, novelId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择小说" />
                      </SelectTrigger>
                      <SelectContent>
                        {novels?.novels.map((novel) => (
                          <SelectItem key={novel.id} value={novel.id}>
                            {novel.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-chapter-number">章节序号 *</Label>
                    <Input
                      id="create-chapter-number"
                      type="number"
                      min="1"
                      value={formData.chapterNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, chapterNumber: parseInt(e.target.value) || 1 }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-title">章节标题 *</Label>
                  <Input
                    id="create-title"
                    placeholder="输入章节标题"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-content">章节内容 *</Label>
                  <Textarea
                    id="create-content"
                    placeholder="输入章节内容"
                    rows={15}
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="create-is-free"
                    checked={formData.isFree}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFree: e.target.checked }))}
                  />
                  <Label htmlFor="create-is-free">免费章节</Label>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  取消
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? '创建中...' : '创建'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索章节标题..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">搜索</Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">筛选：</span>
              </div>
              
              <Select value={selectedNovelId || "all"} onValueChange={(value) => setSelectedNovelId(value === "all" ? "" : value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="选择小说" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部小说</SelectItem>
                  {novels?.novels.map((novel) => (
                    <SelectItem key={novel.id} value={novel.id}>
                      {novel.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 章节列表 */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={`skeleton-${i}`} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-16 bg-muted rounded"></div>
                    <div className="h-8 w-16 bg-muted rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : chapters.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">暂无章节</h3>
            <p className="text-muted-foreground mb-4">
              还没有创建任何章节，开始添加第一个章节吧
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              创建章节
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* 这里会显示章节列表，目前为空 */}
        </div>
      )}

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑章节</DialogTitle>
            <DialogDescription>
              修改章节信息
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-novel">所属小说</Label>
                  <Select value={formData.novelId} onValueChange={(value) => setFormData(prev => ({ ...prev, novelId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择小说" />
                    </SelectTrigger>
                    <SelectContent>
                      {novels?.novels.map((novel) => (
                        <SelectItem key={novel.id} value={novel.id}>
                          {novel.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-chapter-number">章节序号 *</Label>
                  <Input
                    id="edit-chapter-number"
                    type="number"
                    min="1"
                    value={formData.chapterNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, chapterNumber: parseInt(e.target.value) || 1 }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-title">章节标题 *</Label>
                <Input
                  id="edit-title"
                  placeholder="输入章节标题"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">章节内容 *</Label>
                <Textarea
                  id="edit-content"
                  placeholder="输入章节内容"
                  rows={15}
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-is-free"
                  checked={formData.isFree}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFree: e.target.checked }))}
                />
                <Label htmlFor="edit-is-free">免费章节</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                取消
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? '更新中...' : '更新'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
