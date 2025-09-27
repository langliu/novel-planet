'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { orpc } from '@/utils/orpc'

export default function Home() {
  const { data: novels, isLoading } = useQuery(
    orpc.getNovelList.queryOptions({
      limit: 6,
      page: 1,
      sortBy: 'popular',
    })
  )

  const { data: categories } = useQuery(orpc.getCategories.queryOptions())

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 头部横幅 */}
      <section className="mb-12 py-12 text-center">
        <h1 className="mb-4 font-bold text-4xl">小说星球</h1>
        <p className="mb-8 text-muted-foreground text-xl">
          发现精彩故事，享受阅读时光
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/novels">浏览小说</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/categories">分类浏览</Link>
          </Button>
        </div>
      </section>

      {/* 热门小说 */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bold text-2xl">热门小说</h2>
          <Button asChild variant="ghost">
            <Link href="/novels?sort=popular">查看更多</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card className="animate-pulse" key={i}>
                <CardHeader>
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {novels?.novels.map((novel) => (
              <Card
                className="transition-shadow hover:shadow-lg"
                key={novel.id}
              >
                <CardHeader>
                  <CardTitle className="line-clamp-1">
                    <Link
                      className="hover:text-primary"
                      href={`/novels/${novel.id}`}
                    >
                      {novel.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>作者：{novel.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 line-clamp-3 text-muted-foreground text-sm">
                    {novel.description}
                  </p>
                  <div className="flex items-center justify-between text-muted-foreground text-xs">
                    <span>{novel.chapterCount} 章</span>
                    <span>{novel.viewCount} 阅读</span>
                    <span>⭐ {novel.rating}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* 分类导航 */}
      <section>
        <h2 className="mb-6 font-bold text-2xl">热门分类</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories?.map((category) => (
            <Card
              className="transition-shadow hover:shadow-md"
              key={category.id}
            >
              <CardContent className="p-4 text-center">
                <Link
                  className="block"
                  href={`/novels?category=${category.id}`}
                >
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="mt-1 text-muted-foreground text-xs">
                    {category.description}
                  </p>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
