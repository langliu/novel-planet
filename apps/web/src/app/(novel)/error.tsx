'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 记录错误到控制台
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* 错误图标 */}
        <div className="mb-8">
          <AlertTriangle className="h-24 w-24 text-red-500 mx-auto mb-4" />
          <div className="text-6xl mb-4">😵</div>
        </div>

        {/* 错误信息 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">出现了一些问题</CardTitle>
            <CardDescription className="text-lg">
              应用程序遇到了意外错误
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              我们很抱歉给您带来不便。这个错误已经被记录，我们的技术团队会尽快处理。
            </p>

            {/* 错误详情（仅在开发环境显示） */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <h4 className="font-medium text-red-800 mb-2">错误详情（开发模式）：</h4>
                <pre className="text-sm text-red-700 whitespace-pre-wrap break-words">
                  {error.message}
                </pre>
                {error.digest && (
                  <p className="text-xs text-red-600 mt-2">
                    错误ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Button onClick={reset} variant="default" size="lg" className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                重试
              </Button>
              
              <Button asChild variant="outline" size="lg">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  返回首页
                </Link>
              </Button>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回上一页
            </Button>
          </CardContent>
        </Card>

        {/* 建议操作 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">您可以尝试</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-muted">
                <div className="font-medium mb-1">🔄 刷新页面</div>
                <div className="text-muted-foreground">点击重试按钮或刷新浏览器</div>
              </div>
              
              <div className="p-4 rounded-lg bg-muted">
                <div className="font-medium mb-1">🏠 返回首页</div>
                <div className="text-muted-foreground">从首页重新开始浏览</div>
              </div>
              
              <div className="p-4 rounded-lg bg-muted">
                <div className="font-medium mb-1">🔍 检查网络</div>
                <div className="text-muted-foreground">确保网络连接正常</div>
              </div>
              
              <div className="p-4 rounded-lg bg-muted">
                <div className="font-medium mb-1">⏰ 稍后再试</div>
                <div className="text-muted-foreground">可能是临时性问题</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 联系支持 */}
        <div className="mt-8 text-sm text-muted-foreground">
          <p>如果问题持续存在，请联系我们的技术支持</p>
          <p className="mt-2">
            <Link href="mailto:support@novel-planet.com" className="hover:text-primary transition-colors">
              support@novel-planet.com
            </Link>
          </p>
          {error.digest && (
            <p className="mt-2 text-xs">
              错误ID: {error.digest}（请在联系支持时提供此ID）
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
