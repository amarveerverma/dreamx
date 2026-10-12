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
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired and grab user
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Helper to safely redirect while preserving refreshed cookies
  const redirectWithCookies = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  // Auth pages: redirect to dashboard if already logged in
  const isAuthPage = pathname.startsWith('/login') || 
                     pathname.startsWith('/signup') || 
                     pathname.startsWith('/forgot-password') || 
                     pathname.startsWith('/reset-password') ||
                     pathname.startsWith('/verify')

  if (isAuthPage && user) {
    const role = user.app_metadata?.user_role || 'student'
    return redirectWithCookies(new URL(`/dashboard/${role}`, request.url))
  }

  // Protected Routes
  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/discover') || pathname.startsWith('/search')
  const isBookPage = pathname.includes('/book') || pathname.includes('/match')

  if ((isDashboard || isBookPage) && !user) {
    return redirectWithCookies(new URL('/login', request.url))
  }

  // RBAC checks for dashboard
  if (pathname.startsWith('/dashboard') && user) {
    const role = user.app_metadata?.user_role || 'student'
    
    if (pathname.startsWith('/dashboard/student') && role !== 'student') {
      return redirectWithCookies(new URL(`/dashboard/${role}`, request.url))
    }
    
    if (pathname.startsWith('/dashboard/mentor') && role !== 'mentor') {
      return redirectWithCookies(new URL(`/dashboard/${role}`, request.url))
    }
    
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return redirectWithCookies(new URL('/403', request.url))
    }
  }

  return supabaseResponse
}
