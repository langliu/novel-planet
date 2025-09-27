import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Search, BookOpen, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 图标 */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-muted-foreground/20 mb-4">404</div>
          <div className="text-6xl mb-4">📚</div>
        </div>

        {/* 错误信息 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">页面未找到</CardTitle>
            <CardDescription className="text-lg">
              抱歉，您访问的页面不存在或已被移除
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              可能是链接地址有误，或者页面已经被删除。不过别担心，我们有很多其他精彩的内容等着您！
            </p>

            {/* 快捷导航 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Button asChild variant="default" size="lg">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  返回首页
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg">
                <Link href="/novels" className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  浏览小说
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg">
                <Link href="/search" className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  搜索内容
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" onClick={() => window.history.back()}>
                <span className="flex items-center gap-2 cursor-pointer">
                  <ArrowLeft className="h-5 w-5" />
                  返回上页
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 推荐内容 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">您可能感兴趣的</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <Link href="/categories" className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <div className="font-medium mb-1">📖 小说分类</div>
                <div className="text-muted-foreground">按类型浏览小说</div>
              </Link>
              
              <Link href="/rankings" className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <div className="font-medium mb-1">🏆 排行榜</div>
                <div className="text-muted-foreground">发现热门作品</div>
              </Link>
              
              <Link href="/dashboard" className="p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                <div className="font-medium mb-1">👤 个人中心</div>
                <div className="text-muted-foreground">管理收藏和历史</div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 帮助信息 */}
        <div className="mt-8 text-sm text-muted-foreground">
          <p>如果您认为这是一个错误，请联系我们的技术支持</p>
          <p className="mt-2">
            <Link href="mailto:support@novel-planet.com" className="hover:text-primary transition-colors">
              support@novel-planet.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
