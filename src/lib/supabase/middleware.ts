import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/env.mjs'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options, path: '/' })
          supabaseResponse = NextResponse.next({ request })
          supabaseResponse.cookies.set({ name, value, ...options, path: '/' })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options, path: '/' })
          supabaseResponse = NextResponse.next({ request })
          supabaseResponse.cookies.set({ name, value: '', ...options, path: '/' })
        },
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options, path: '/' })
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set({
              name,
              value,
              ...options,
              path: '/',
            })
          })
        },
      },
    }
  )

  // Refresh session if expired and grab user
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Helper to safely redirect while preserving refreshed cookies with full site-wide path
  const redirectWithCookies = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set({
        name: cookie.name,
        value: cookie.value,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    })
    return redirectResponse
  }

  // API routes handle their own authentication and return pure JSON (401/403/500)
  if (pathname.startsWith('/api')) {
    return supabaseResponse
  }

  // Auth pages: redirect to destination or dashboard if already logged in
  const isAuthPage = pathname.startsWith('/login') || 
                     pathname.startsWith('/signup') || 
                     pathname.startsWith('/forgot-password') || 
                     pathname.startsWith('/reset-password') ||
                     pathname.startsWith('/verify')

  if (isAuthPage && user) {
    const role = user.app_metadata?.user_role || user.user_metadata?.user_role || 'student'
    const nextParam = request.nextUrl.searchParams.get('next')

    // If a valid local next param was passed and matches role permissions
    if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')) {
      const isRestrictedForStudent = nextParam.startsWith('/admin') || nextParam.startsWith('/dashboard/mentor')
      const isRestrictedForMentor = nextParam.startsWith('/admin') || nextParam.startsWith('/dashboard/student')

      if (role === 'admin') {
        return redirectWithCookies(new URL(nextParam, request.url))
      } else if (role === 'mentor' && !isRestrictedForMentor) {
        return redirectWithCookies(new URL(nextParam, request.url))
      } else if (role === 'student' && !isRestrictedForStudent) {
        return redirectWithCookies(new URL(nextParam, request.url))
      }
    }

    const dest = role === 'admin' ? '/admin' : `/dashboard/${role}`
    return redirectWithCookies(new URL(dest, request.url))
  }

  // Alias bridge: /dashboard/admin -> /admin
  if (pathname === '/dashboard/admin' || pathname.startsWith('/dashboard/admin/')) {
    const targetPath = pathname.replace(/^\/dashboard\/admin/, '/admin') || '/admin'
    return redirectWithCookies(new URL(targetPath, request.url))
  }

  // Dedicated RBAC check for Admin routes (/admin and /admin/*)
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return redirectWithCookies(loginUrl)
    }
    const role = user.app_metadata?.user_role || user.user_metadata?.user_role || 'student'
    if (role !== 'admin') {
      return redirectWithCookies(new URL('/403', request.url))
    }
  }

  // Protected Dashboard Routes (/dashboard and /dashboard/*)
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return redirectWithCookies(loginUrl)
    }

    const role = user.app_metadata?.user_role || user.user_metadata?.user_role || 'student'

    if (pathname.startsWith('/dashboard/student') && role !== 'student' && role !== 'admin') {
      return redirectWithCookies(new URL('/dashboard/mentor', request.url))
    }

    if (pathname.startsWith('/dashboard/mentor') && role !== 'mentor' && role !== 'admin') {
      return redirectWithCookies(new URL('/dashboard/student', request.url))
    }

    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      const dest = role === 'admin' ? '/admin' : `/dashboard/${role}`
      return redirectWithCookies(new URL(dest, request.url))
    }
  }

  // Protected Transactional Actions (requires authentication)
  const isProtectedAction = pathname.startsWith('/book') || pathname.startsWith('/match')
  if (isProtectedAction && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return redirectWithCookies(loginUrl)
  }

  return supabaseResponse
}
