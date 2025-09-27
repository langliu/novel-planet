'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { orpc } from '@/utils/orpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  FileText, 
  FolderOpen, 
  Users, 
  Plus, 
  Settings,
  BarChart3,
  TrendingUp,
  Eye,
  Star
} from 'lucide-react'

export default function AdminPage() {
  const { data: stats, isLoading } = useQuery(orpc.getAdminStats.queryOptions())

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">后台管理</h1>
        <p className="text-muted-foreground">
          管理小说、分类和内容
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总小说数</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats?.totalNovels || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% 较上月
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总章节数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats?.totalChapters || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% 较上月
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">分类数量</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats?.totalCategories || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +2 个新分类
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +5% 较上月
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              添加小说
            </CardTitle>
            <CardDescription>
              创建新的小说作品
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/novels/create">
                创建小说
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              管理分类
            </CardTitle>
            <CardDescription>
              添加或编辑小说分类
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/categories">
                管理分类
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              小说管理
            </CardTitle>
            <CardDescription>
              查看和编辑所有小说
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/novels">
                管理小说
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 最近创建的小说 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            最近创建的小说
          </CardTitle>
          <CardDescription>
            最新添加的小说作品
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="h-12 w-12 bg-muted rounded"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.recentNovels && stats.recentNovels.length > 0 ? (
            <div className="space-y-4">
              {stats.recentNovels.map((novel) => (
                <div key={novel.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center text-white font-bold">
                      {novel.title.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium">{novel.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        作者：{novel.author} • {novel.chapterCount} 章
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {new Date(novel.createdAt).toLocaleDateString()}
                    </Badge>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/novels/${novel.id}`}>
                        编辑
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无小说</p>
              <Button asChild className="mt-4">
                <Link href="/admin/novels/create">
                  创建第一部小说
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 系统状态 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              系统状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>数据库</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  正常
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>存储空间</span>
                <Badge variant="secondary">
                  85% 已使用
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>API 响应</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  正常
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4" />
              今日统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>页面访问</span>
                <span className="font-medium">2,345</span>
              </div>
              <div className="flex justify-between">
                <span>新增用户</span>
                <span className="font-medium">23</span>
              </div>
              <div className="flex justify-between">
                <span>章节阅读</span>
                <span className="font-medium">1,567</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Settings className="h-4 w-4" />
              快捷设置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                系统设置
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                用户管理
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                数据分析
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
