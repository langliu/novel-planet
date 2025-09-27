import type { RouterClient } from '@orpc/server'
import { protectedProcedure, publicProcedure } from '@/lib/orpc'
import { chaptersRouter } from './chapters'
import { novelsRouter } from './novels'

export const appRouter = {
  healthCheck: publicProcedure.handler(() => 'OK'),
  privateData: protectedProcedure.handler(({ context }) => ({
    message: 'This is private',
    user: context.session?.user,
  })),
  ...novelsRouter,
  ...chaptersRouter,
}
export type AppRouter = typeof appRouter
export type AppRouterClient = RouterClient<typeof appRouter>
