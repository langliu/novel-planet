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
import { type ReactNode, useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

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

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b bg-white transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              className="mr-2 data-[orientation=vertical]:h-4"
              orientation="vertical"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
