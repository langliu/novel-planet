'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { orpc } from '@/utils/orpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, TrendingUp } from 'lucide-react'

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery(orpc.getCategories.queryOptions())

  // 获取每个分类的热门小说
  const categoryNovels = categories?.map(category => {
    const { data: novels } = useQuery(
      orpc.getNovelList.queryOptions({
        page: 1,
        limit: 3,
        categoryId: category.id,
        sortBy: 'popular'
      })
    )
    return { category, novels: novels?.novels || [] }
  }) || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">小说分类</h1>
        <p className="text-muted-foreground">
          按分类浏览小说，发现你喜欢的类型
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={`skeleton-${i}`} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-4 bg-muted rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryNovels.map(({ category, novels }) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    <Link 
                      href={`/novels?category=${category.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {category.name}
                    </Link>
                  </CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {novels.length}+
                  </Badge>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    热门作品
                  </h4>
                  
                  {novels.length === 0 ? (
                    <p className="text-sm text-muted-foreground">暂无作品</p>
                  ) : (
                    <div className="space-y-2">
                      {novels.slice(0, 3).map((novel) => (
                        <div key={novel.id} className="flex items-center justify-between">
                          <Link 
                            href={`/novels/${novel.id}`}
                            className="text-sm hover:text-primary transition-colors line-clamp-1 flex-1"
                          >
                            {novel.title}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground ml-2">
                            <span>{novel.viewCount} 阅读</span>
                            <span>⭐ {novel.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="pt-2 border-t">
                    <Link 
                      href={`/novels?category=${category.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      查看更多 {category.name} 小说 →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 分类统计 */}
      {!isLoading && categories && (
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{categories.length}</div>
              <div className="text-sm text-muted-foreground">个分类</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {categoryNovels.reduce((total, { novels }) => total + novels.length, 0)}+
              </div>
              <div className="text-sm text-muted-foreground">部作品</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
