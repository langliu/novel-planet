'use client'
import Link from 'next/link'
import { ModeToggle } from './mode-toggle'
import UserMenu from './user-menu'

export default function Header() {
  const links = [
    { label: '首页', to: '/' },
    { label: '小说', to: '/novels' },
    { label: '分类', to: '/categories' },
    { label: '排行榜', to: '/rankings' },
    { label: '我的', to: '/dashboard' },
  ] as const

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => (
            <Link href={to} key={to}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  )
}
