import { env } from 'cloudflare:workers'
import { type BetterAuthOptions, betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db'
import { account, session, user, verification } from '../db/schema/auth'

export const auth = betterAuth<BetterAuthOptions>({
  advanced: {
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    },
    // uncomment crossSubDomainCookies setting when ready to deploy and replace <your-workers-subdomain> with your actual workers subdomain
    // https://developers.cloudflare.com/workers/wrangler/configuration/#workersdev
    // crossSubDomainCookies: {
    //   enabled: true,
    //   domain: "<your-workers-subdomain>",
    // },
  },
  // biome-ignore lint/style/useNamingConvention: 忽略
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      account,
      session,
      user,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  // uncomment cookieCache setting when ready to deploy to Cloudflare using *.workers.dev domains
  // session: {
  //   cookieCache: {
  //     enabled: true,
  //     maxAge: 60,
  //   },
  // },
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.CORS_ORIGIN],
})
