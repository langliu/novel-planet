'use client'
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  FileText,
  FolderOpen,
  Home,
  Menu,
  Settings,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const navigation = [
  {
    href: '/admin',
    icon: Home,
    name: '概览',
  },
  {
    href: '/admin/novels',
    icon: BookOpen,
    name: '小说管理',
  },
  {
    href: '/admin/categories',
    icon: FolderOpen,
    name: '分类管理',
  },
  {
    href: '/admin/chapters',
    icon: FileText,
    name: '章节管理',
  },
  {
    href: '/admin/users',
    icon: Users,
    name: '用户管理',
  },
  {
    href: '/admin/analytics',
    icon: BarChart3,
    name: '数据统计',
  },
  {
    href: '/admin/settings',
    icon: Settings,
    name: '系统设置',
  },
]

function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-muted/10">
      <div className="flex h-16 items-center border-b px-6">
        <Link className="flex items-center gap-2 font-semibold" href="/admin">
          <Settings className="h-6 w-6" />
          后台管理
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              href={item.href}
              key={item.name}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <Button asChild className="w-full justify-start" variant="ghost">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回前台
          </Link>
        </Button>
      </div>
    </div>
  )
}

function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button className="md:hidden" size="icon" variant="ghost">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-64 p-0" side="left">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <Link
              className="flex items-center gap-2 font-semibold"
              href="/admin"
            >
              <Settings className="h-6 w-6" />
              后台管理
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  href={item.href}
                  key={item.name}
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t p-4">
            <Button asChild className="w-full justify-start" variant="ghost">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回前台
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      {/* 桌面端侧边栏 */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* 主内容区域 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 移动端顶部栏 */}
        <div className="flex h-16 items-center border-b px-4 md:hidden">
          <MobileSidebar />
          <div className="ml-4">
            <h1 className="font-semibold text-lg">后台管理</h1>
          </div>
        </div>

        {/* 页面内容 */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
