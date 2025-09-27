'use client'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { orpc } from '@/utils/orpc'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, List, Settings } from 'lucide-react'

export default function ChapterPage() {
  const params = useParams()
  const novelId = params.id as string
  const chapterId = params.chapterId as string
  
  const [fontSize, setFontSize] = useState('16')
  const [lineHeight, setLineHeight] = useState('1.8')
  const [showSettings, setShowSettings] = useState(false)

  const { data: chapterData, isLoading: chapterLoading } = useQuery(
    orpc.getChapterContent.queryOptions({ id: chapterId })
  )

  const { data: novelData, isLoading: novelLoading } = useQuery(
    orpc.getNovelDetail.queryOptions({ id: novelId })
  )

  if (chapterLoading || novelLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-muted rounded w-2/3 mb-6"></div>
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!chapterData || !novelData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">章节不存在</h1>
        <Button asChild>
          <Link href={`/novels/${novelId}`}>返回小说详情</Link>
        </Button>
      </div>
    )
  }

  const { chapters } = novelData
  const currentChapterIndex = chapters.findIndex(ch => ch.id === chapterId)
  const prevChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null
  const nextChapter = currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/novels/${novelId}`}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  返回
                </Link>
              </Button>
              <div>
                <h1 className="font-medium">{novelData.novel.title}</h1>
                <p className="text-sm text-muted-foreground">{chapterData.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/novels/${novelId}#chapters`}>
                  <List className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 阅读设置面板 */}
      {showSettings && (
        <div className="border-b bg-muted/50 p-4">
          <div className="container mx-auto">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm">字体大小:</span>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="14">14px</SelectItem>
                    <SelectItem value="16">16px</SelectItem>
                    <SelectItem value="18">18px</SelectItem>
                    <SelectItem value="20">20px</SelectItem>
                    <SelectItem value="22">22px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm">行高:</span>
                <Select value={lineHeight} onValueChange={setLineHeight}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.5">1.5</SelectItem>
                    <SelectItem value="1.8">1.8</SelectItem>
                    <SelectItem value="2.0">2.0</SelectItem>
                    <SelectItem value="2.2">2.2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 章节内容 */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-8">
            <header className="mb-8 text-center">
              <h1 className="text-2xl font-bold mb-2">{chapterData.title}</h1>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>第 {chapterData.chapterNumber} 章</span>
                <span>{chapterData.wordCount} 字</span>
                <span>{new Date(chapterData.publishedAt || '').toLocaleDateString()}</span>
              </div>
            </header>

            <article 
              className="prose prose-lg max-w-none"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
              }}
            >
              {chapterData.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-foreground">
                  {paragraph.trim() || '\u00A0'}
                </p>
              ))}
            </article>
          </CardContent>
        </Card>

        {/* 章节导航 */}
        <div className="flex items-center justify-between mt-8">
          <div>
            {prevChapter ? (
              <Button asChild>
                <Link href={`/novels/${novelId}/chapters/${prevChapter.id}`}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  上一章：{prevChapter.title}
                </Link>
              </Button>
            ) : (
              <Button disabled>
                <ChevronLeft className="h-4 w-4 mr-2" />
                已是第一章
              </Button>
            )}
          </div>

          <Button variant="outline" asChild>
            <Link href={`/novels/${novelId}`}>
              <List className="h-4 w-4 mr-2" />
              目录
            </Link>
          </Button>

          <div>
            {nextChapter ? (
              <Button asChild>
                <Link href={`/novels/${novelId}/chapters/${nextChapter.id}`}>
                  下一章：{nextChapter.title}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <Button disabled>
                已是最后一章
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
