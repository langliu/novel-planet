import { nanoid } from 'nanoid'
import { db } from './index'
import { category, chapter, novel } from './schema'

export async function seedDatabase() {
  console.log('开始初始化数据库数据...')

  // 创建分类
  const categories = [
    { description: '玄幻小说', id: nanoid(), name: '玄幻' },
    { description: '都市小说', id: nanoid(), name: '都市' },
    { description: '历史小说', id: nanoid(), name: '历史' },
    { description: '科幻小说', id: nanoid(), name: '科幻' },
    { description: '武侠小说', id: nanoid(), name: '武侠' },
    { description: '言情小说', id: nanoid(), name: '言情' },
  ]

  const now = new Date()

  for (const cat of categories) {
    await db.insert(category).values({
      ...cat,
      createdAt: now,
      updatedAt: now,
    })
  }

  // 创建示例小说
  const novels = [
    {
      author: '天蚕土豆',
      categoryId: categories[0].id, // 玄幻
      chapterCount: 1648,
      description:
        '这里是斗气大陆，没有花俏的魔法，有的，仅仅是繁衍到巅峰的斗气！',
      favoriteCount: 50_000,
      id: nanoid(),
      isRecommended: true,
      rating: 4.5,
      ratingCount: 10_000,
      status: 'completed' as const,
      tags: JSON.stringify(['玄幻', '热血', '升级']),
      title: '斗破苍穹',
      viewCount: 1_000_000,
      wordCount: 5_000_000,
    },
    {
      author: '蝴蝶蓝',
      categoryId: categories[1].id, // 都市
      chapterCount: 1728,
      description:
        '网游荣耀中被誉为教科书级别的顶尖高手，因为种种原因遭到俱乐部的驱逐...',
      favoriteCount: 40_000,
      id: nanoid(),
      isRecommended: true,
      rating: 4.7,
      ratingCount: 8000,
      status: 'completed' as const,
      tags: JSON.stringify(['电竞', '都市', '励志']),
      title: '全职高手',
      viewCount: 800_000,
      wordCount: 4_000_000,
    },
    {
      author: '刘慈欣',
      categoryId: categories[3].id, // 科幻
      chapterCount: 46,
      description:
        '文化大革命如火如荼进行的同时，军方探寻外星文明的绝秘计划"红岸工程"取得了突破性进展...',
      favoriteCount: 35_000,
      id: nanoid(),
      isRecommended: true,
      rating: 4.8,
      ratingCount: 12_000,
      status: 'completed' as const,
      tags: JSON.stringify(['科幻', '硬科幻', '宇宙']),
      title: '三体',
      viewCount: 600_000,
      wordCount: 800_000,
    },
  ]

  for (const novelData of novels) {
    await db.insert(novel).values({
      ...novelData,
      createdAt: now,
      publishedAt: now,
      updatedAt: now,
    })
  }

  // 为每本小说创建几个示例章节
  for (let i = 0; i < novels.length; i++) {
    const novelData = novels[i]

    for (let j = 1; j <= 3; j++) {
      await db.insert(chapter).values({
        chapterNumber: j,
        content: `这是《${novelData.title}》第${j}章的内容。\n\n在这个充满奇幻色彩的世界里，主人公即将开始他的冒险之旅。这一章将为整个故事奠定基础，介绍主要人物和世界观设定。\n\n故事从一个平凡的日子开始，但很快就会发生翻天覆地的变化。主人公将面临前所未有的挑战，也将获得意想不到的力量。\n\n让我们一起见证这个传奇故事的开始吧！`,
        createdAt: now,
        id: nanoid(),
        isFree: true,
        isPublished: true,
        novelId: novelData.id,
        publishedAt: now,
        title: `第${j}章 ${novelData.title}的开始`,
        updatedAt: now,
        viewCount: Math.floor(Math.random() * 10_000),
        wordCount: 500,
      })
    }
  }

  console.log('数据库初始化完成！')
  console.log(`创建了 ${categories.length} 个分类`)
  console.log(`创建了 ${novels.length} 本小说`)
  console.log(`创建了 ${novels.length * 3} 个章节`)
}

// 如果直接运行此文件，则执行种子数据
if (import.meta.main) {
  seedDatabase().catch(console.error)
}
