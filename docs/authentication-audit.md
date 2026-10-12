# DreamX Authentication Audit & Verification Report

**Date:** 2026-10-08
**Auditor:** Principal Security Engineer & Senior Full-Stack Engineer
**Objective:** Diagnose why the authentication flow gets "stuck" after logging in, without modifying any code.

---

## Executive Summary

The authentication system is getting "stuck" primarily due to a **routing structure mismatch** combined with a **missing state reset** in the UI. 

When a user successfully logs in, the Next.js router is instructed to navigate to `/dashboard/student`. However, because the dashboard pages were placed inside a `(dashboard)` Route Group (`src/app/(dashboard)/student`), Next.js mapped the actual URL to `/student`. As a result, the router hits a 404 (Not Found). 

Because the `login/page.tsx` never resets its `loading` state upon a successful login, the UI remains permanently frozen on the "Authenticating..." spinner while Next.js silently fails to resolve the `/dashboard/student` route in the background.

Below is the detailed step-by-step trace and breakdown of all identified issues.

---

## 1. Trace & Verification Details

### A. Frontend Submit (`login/page.tsx`)
- **Status:** FAIL (UI State Leak)
- **Trace:** The user enters credentials and clicks submit. `setLoading(true)` is called. The app successfully calls `supabase.auth.signInWithPassword`. On success, it calls `router.push('/dashboard/student')` and `router.refresh()`. 
- **Problem:** The `loading` state is never set back to `false` in the success path. If `router.push()` fails to navigate (e.g., due to a 404), the component remains mounted and frozen on the loading spinner.

### B. Routing & Folder Structure
- **Status:** FAIL (Path Mismatch)
- **Trace:** The code attempts to navigate to `/dashboard/student` (or `/dashboard/mentor`).
- **Problem:** The directory `src/app/dashboard/student` does not exist. Instead, the implementation placed the files in `src/app/(dashboard)/student`. In Next.js, parenthesis indicate a Route Group, which is omitted from the URL path. Therefore, the actual URL is `/student`, NOT `/dashboard/student`. Navigating to `/dashboard/student` results in a 404 error.

### C. Middleware (`src/lib/supabase/middleware.ts`)
- **Status:** DEGRADED (Cookie Loss & Hardcoded Redirects)
- **Trace:** The middleware correctly initializes the Supabase Server Client and intercepts requests. If an authenticated user hits `/login`, it attempts to redirect them.
- **Problem 1 (URL Mismatch):** The middleware also hardcodes a redirect to `/dashboard/${role}`, which suffers from the exact same 404 routing bug mentioned above.
- **Problem 2 (Cookie Loss):** When `@supabase/ssr` refreshes an expired token, it attaches `Set-Cookie` headers to the `supabaseResponse` object (which is a `NextResponse.next()` object). However, if the user hits the `isAuthPage` check, the middleware returns a brand new `NextResponse.redirect(...)`. This discards the `supabaseResponse` entirely, meaning the browser never receives the newly refreshed session cookies.

### D. Database & Profile Initialization (`0001_initial_auth_profiles.sql`)
- **Status:** DEGRADED (Role Desynchronization)
- **Trace:** When a user signs up, Supabase GoTrue creates a record in `auth.users`. The `on_auth_user_created` trigger fires and successfully creates a record in `public.profiles`.
- **Problem:** The trigger defaults the user's role to `student` in the `public.profiles` table, but it **does not** sync this role back into `auth.users.raw_app_meta_data`. Because the JWT derives its role from `app_metadata`, `user.app_metadata.user_role` remains undefined. The frontend and middleware currently rely on a fallback `|| 'student'` to survive this, but if an admin manually upgrades a user to a `mentor` in the profiles table, the user will still be treated as a `student` by the middleware because the JWT token was never updated.

### E. OAuth Callback (`src/app/auth/callback/route.ts`)
- **Status:** PASS
- **Trace:** Correctly extracts `code` or `token_hash`, exchanges it for a session, and redirects to the `next` param (defaulting to `/onboard`).

---

## 2. Identified Problems Matrix

| Severity | Component | File | Issue Description | Recommendation |
|----------|-----------|------|-------------------|----------------|
| **CRITICAL** | Routing | `src/app/(dashboard)/*` | **404 URL Mismatch:** The code expects `/dashboard/student` but the Route Group mapping creates `/student`. | Move `(dashboard)` contents to a literal `dashboard` directory, OR update all `router.push()` and middleware redirects to point to `/student` and `/mentor`. |
| **HIGH** | Frontend | `login/page.tsx` | **Infinite Spinner (Stuck Flow):** Missing `setLoading(false)` on success path causes the UI to freeze if navigation fails. | Add `setLoading(false)` or ensure the router navigates to a valid page that instantly unmounts the login view. |
| **MEDIUM** | Middleware| `middleware.ts` | **Session Cookie Loss:** Returning `NextResponse.redirect` destroys refreshed `Set-Cookie` headers attached to `supabaseResponse`. | Construct a new redirect response, but copy the `Set-Cookie` headers from `supabaseResponse` into the new response before returning it. |
| **MEDIUM** | Database | `0001_initial_auth_profiles.sql` | **Role Desync:** The trigger creates the profile but fails to update the Auth user's `app_metadata` with their role. | Update the trigger or create an Edge Function to sync the `public.profiles.role` into `auth.users.raw_app_meta_data` so the JWT always contains the correct role. |

---

## 3. Conclusion

The authentication flow is not getting stuck because of Supabase GoTrue, RLS policies, or database locking. **It is getting stuck due to a Next.js frontend routing mismatch (404) compounded by a missing loading state reset.**

**Next Steps for Phase 1 Remediation:**
Awaiting your approval to generate the Implementation Plan to fix the routing structure, update the middleware, and repair the login state handling.
