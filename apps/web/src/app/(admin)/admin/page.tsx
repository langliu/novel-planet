'use client'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  BookOpen,
  Eye,
  FileText,
  FolderOpen,
  Plus,
  Settings,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { orpc } from '@/utils/orpc'

export default function AdminPage() {
  const { data: stats, isLoading } = useQuery(orpc.getAdminStats.queryOptions())

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="mb-2 font-bold text-3xl">后台管理</h1>
        <p className="text-muted-foreground">管理小说、分类和内容</p>
      </div>

      {/* 统计卡片 */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">总小说数</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {isLoading ? '...' : stats?.totalNovels || 0}
            </div>
            <p className="text-muted-foreground text-xs">+12% 较上月</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">总章节数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {isLoading ? '...' : stats?.totalChapters || 0}
            </div>
            <p className="text-muted-foreground text-xs">+8% 较上月</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">分类数量</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {isLoading ? '...' : stats?.totalCategories || 0}
            </div>
            <p className="text-muted-foreground text-xs">+2 个新分类</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">活跃用户</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">1,234</div>
            <p className="text-muted-foreground text-xs">+5% 较上月</p>
          </CardContent>
        </Card>
      </div>

      {/* 快捷操作 */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              添加小说
            </CardTitle>
            <CardDescription>创建新的小说作品</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/novels/create">创建小说</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              管理分类
            </CardTitle>
            <CardDescription>添加或编辑小说分类</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/categories">管理分类</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              小说管理
            </CardTitle>
            <CardDescription>查看和编辑所有小说</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/novels">管理小说</Link>
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
          <CardDescription>最新添加的小说作品</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  className="flex animate-pulse items-center space-x-4"
                  key={i}
                >
                  <div className="h-12 w-12 rounded bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.recentNovels && stats.recentNovels.length > 0 ? (
            <div className="space-y-4">
              {stats.recentNovels.map((novel) => (
                <div
                  className="flex items-center justify-between rounded-lg border p-4"
                  key={novel.id}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 font-bold text-white">
                      {novel.title.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium">{novel.title}</h4>
                      <p className="text-muted-foreground text-sm">
                        作者：{novel.author} • {novel.chapterCount} 章
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {new Date(novel.createdAt).toLocaleDateString()}
                    </Badge>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/novels/${novel.id}`}>编辑</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>暂无小说</p>
              <Button asChild className="mt-4">
                <Link href="/admin/novels/create">创建第一部小说</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 系统状态 */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
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
                <Badge
                  className="bg-green-100 text-green-800"
                  variant="secondary"
                >
                  正常
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>存储空间</span>
                <Badge variant="secondary">85% 已使用</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>API 响应</span>
                <Badge
                  className="bg-green-100 text-green-800"
                  variant="secondary"
                >
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
              <Button
                className="w-full justify-start"
                size="sm"
                variant="ghost"
              >
                <Settings className="mr-2 h-4 w-4" />
                系统设置
              </Button>
              <Button
                className="w-full justify-start"
                size="sm"
                variant="ghost"
              >
                <Users className="mr-2 h-4 w-4" />
                用户管理
              </Button>
              <Button
                className="w-full justify-start"
                size="sm"
                variant="ghost"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                数据分析
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
