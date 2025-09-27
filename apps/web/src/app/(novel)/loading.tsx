import { Card, CardContent } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题骨架 */}
      <div className="mb-8">
        <div className="h-8 bg-muted rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
      </div>

      {/* 内容骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <Card key={`loading-${i}`} className="animate-pulse">
            <CardContent className="p-6">
              {/* 标题骨架 */}
              <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
              
              {/* 内容骨架 */}
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
                <div className="h-3 bg-muted rounded w-4/6"></div>
              </div>
              
              {/* 底部信息骨架 */}
              <div className="flex justify-between items-center">
                <div className="h-3 bg-muted rounded w-16"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 加载指示器 */}
      <div className="flex justify-center items-center mt-12">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>正在加载精彩内容...</span>
        </div>
      </div>
    </div>
  )
}
