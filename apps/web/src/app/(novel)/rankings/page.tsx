'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { orpc } from '@/utils/orpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, Star, Eye, Clock, Medal } from 'lucide-react'

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState('popular')

  // 获取不同排行榜数据
  const { data: popularNovels, isLoading: popularLoading } = useQuery(
    orpc.getNovelList.queryOptions({
      page: 1,
      limit: 50,
      sortBy: 'popular',
    })
  )

  const { data: ratingNovels, isLoading: ratingLoading } = useQuery(
    orpc.getNovelList.queryOptions({
      page: 1,
      limit: 50,
      sortBy: 'rating',
    })
  )

  const { data: latestNovels, isLoading: latestLoading } = useQuery(
    orpc.getNovelList.queryOptions({
      page: 1,
      limit: 50,
      sortBy: 'latest',
    })
  )

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-lg font-bold text-muted-foreground">{rank}</span>
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
    if (rank <= 10) return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
    return 'bg-muted text-muted-foreground'
  }

  const RankingList = ({ novels, isLoading, type }: { 
    novels: any, 
    isLoading: boolean, 
    type: 'popular' | 'rating' | 'latest' 
  }) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={`skeleton-${i}`} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="h-6 w-16 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {novels?.novels.slice(0, 50).map((novel: any, index: number) => {
          const rank = index + 1
          return (
            <Card key={novel.id} className={`hover:shadow-lg transition-all ${rank <= 3 ? 'ring-2 ring-yellow-200' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* 排名 */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(rank)}`}>
                    {getRankIcon(rank)}
                  </div>

                  {/* 小说信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link 
                        href={`/novels/${novel.id}`}
                        className="font-semibold hover:text-primary transition-colors line-clamp-1"
                      >
                        {novel.title}
                      </Link>
                      <Badge 
                        variant="secondary"
                        className={`text-xs ${
                          novel.status === 'completed' ? 'bg-green-100 text-green-800' :
                          novel.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {novel.status === 'completed' ? '完结' : 
                         novel.status === 'ongoing' ? '连载' : '暂停'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Link 
                        href={`/authors/${encodeURIComponent(novel.author)}`}
                        className="hover:text-primary transition-colors"
                      >
                        {novel.author}
                      </Link>
                      <span>{novel.chapterCount} 章</span>
                    </div>
                  </div>

                  {/* 统计数据 */}
                  <div className="text-right">
                    {type === 'popular' && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Eye className="h-4 w-4" />
                        <span className="font-semibold">{novel.viewCount.toLocaleString()}</span>
                      </div>
                    )}
                    {type === 'rating' && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Star className="h-4 w-4" />
                        <span className="font-semibold">{novel.rating}</span>
                      </div>
                    )}
                    {type === 'latest' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">最新更新</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          小说排行榜
        </h1>
        <p className="text-muted-foreground">
          发现最受欢迎、评分最高和最新更新的优质小说
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            人气榜
          </TabsTrigger>
          <TabsTrigger value="rating" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            评分榜
          </TabsTrigger>
          <TabsTrigger value="latest" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            更新榜
          </TabsTrigger>
        </TabsList>

        <TabsContent value="popular">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                人气排行榜
              </CardTitle>
              <CardDescription>
                根据阅读量排序，展示最受读者喜爱的小说
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RankingList novels={popularNovels} isLoading={popularLoading} type="popular" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rating">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                评分排行榜
              </CardTitle>
              <CardDescription>
                根据用户评分排序，展示质量最高的小说
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RankingList novels={ratingNovels} isLoading={ratingLoading} type="rating" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="latest">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                更新排行榜
              </CardTitle>
              <CardDescription>
                根据更新时间排序，展示最新更新的小说
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RankingList novels={latestNovels} isLoading={latestLoading} type="latest" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 排行榜说明 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">排行榜说明</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>人气榜：</strong>根据小说的总阅读量进行排序，反映读者的关注度</p>
          <p><strong>评分榜：</strong>根据用户评分进行排序，反映小说的质量和口碑</p>
          <p><strong>更新榜：</strong>根据最新更新时间进行排序，帮助发现活跃更新的作品</p>
          <p className="text-xs mt-4">* 排行榜数据每小时更新一次</p>
        </CardContent>
      </Card>
    </div>
  )
}
