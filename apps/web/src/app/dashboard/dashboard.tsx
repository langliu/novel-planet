'use client'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import type { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

export default function Dashboard({
  session,
}: {
  session: typeof authClient.$Infer.Session
}) {
  const privateData = useQuery(orpc.privateData.queryOptions())

  return (
    <>
      <p>API: {privateData.data?.message}</p>
    </>
  )
}
