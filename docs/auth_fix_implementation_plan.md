# Authentication Remediation Implementation Plan

**Objective:** Execute surgical fixes to resolve the 404 routing bug, UI spinner lock, middleware session loss, and role metadata sync, as identified in the Auth Audit.

## Step 1: Fix Route Group Architecture (The 404 Fix)
**Target:** `src/app/(dashboard)`
**Action:** 
- Rename the folder `src/app/(dashboard)` to `src/app/dashboard`.
- By removing the `()` route group parentheses, Next.js will correctly map the files to `/dashboard/student` and `/dashboard/mentor`, which perfectly aligns with what `login/page.tsx`, `middleware.ts`, and the PRD expect.

## Step 2: Fix UI State Leak in Login
**Target:** `src/app/(auth)/login/page.tsx`
**Action:**
- Update `handleLogin` to ensure `setLoading(false)` is handled correctly so the UI doesn't freeze indefinitely if a navigation exception occurs.

## Step 3: Fix Middleware Cookie Loss
**Target:** `src/lib/supabase/middleware.ts`
**Action:**
- Refactor the `isAuthPage` and RBAC redirect logic.
- Instead of returning a raw `NextResponse.redirect`, create the redirect response and then copy all `Set-Cookie` headers from the `supabaseResponse` (which holds the refreshed session) into the new redirect response before returning it.

## Step 4: Fix Role Metadata Desync 
**Target:** `supabase/migrations/0005_auth_metadata_sync.sql`
**Action:**
- Create a new migration with a database function/trigger that automatically syncs a user's `role` from `public.profiles` into `auth.users.raw_app_meta_data`. 
- This ensures that if a role is updated in the database, the JWT token will correctly reflect the new role upon the next token refresh, removing the reliance on frontend fallbacks.

---

**Workflow Checkpoint:**
Please review this Implementation Plan. If you approve, I will immediately execute these 4 steps and verify the login flow.
