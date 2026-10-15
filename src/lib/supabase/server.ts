import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'
import { env } from '@/env.mjs'

export function createClient() {
  const cookieStore = cookies()
  let authHeader: string | undefined = undefined
  try {
    const headerStore = headers()
    const header = headerStore.get('authorization')
    if (header) {
      authHeader = header
    }
  } catch {
    // Fallback if headers() is unavailable in specific execution context
  }

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: authHeader ? { Authorization: authHeader } : undefined,
      },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options, path: '/' })
          } catch {
            // Server Component context
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options, path: '/' })
          } catch {
            // Server Component context
          }
        },
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, path: '/' })
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
