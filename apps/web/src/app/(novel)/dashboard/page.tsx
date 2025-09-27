import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import Dashboard from './dashboard'

export default async function DashboardPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  })

  if (!session.data) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 font-bold text-3xl">个人中心</h1>
        <p className="text-muted-foreground">
          欢迎回来，{session.data.user.name}
        </p>
      </div>
      <Dashboard session={session.data} />
    </div>
  )
}
