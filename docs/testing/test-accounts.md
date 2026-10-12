# DreamX Test Accounts

This document outlines the test accounts created for validating the Phase 3 functionality of the DreamX platform. 

These accounts have been provisioned directly via the Supabase Admin API to ensure that all database triggers (such as profile creation and role synchronization to `app_metadata`) are executed correctly, simulating real user registration flows.

## Test Accounts

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Student** | `student.test@your-test-domain.example` | `TestPassword123!` | Testing student dashboard, catalog exploration, and enrollment flows. |
| **Mentor** | `mentor.test@your-test-domain.example` | `TestPassword123!` | Testing mentor dashboard, service management, and cohort tracking. |

> [!NOTE] 
> Both accounts have standard permissions aligned with their respective roles and do not possess admin privileges. The `app_metadata.user_role` and `public.profiles.role` match the intended role for each account.

## Smoke Test Instructions

To verify that the platform is ready for Phase 4, perform the following role-based smoke tests:

### 1. Student Role Validation
1. Start the development server (`npm run dev`).
2. Navigate to `http://localhost:3000/auth/login`.
3. Log in with the **Student** credentials.
4. Verify you are successfully redirected to `/dashboard/student`.
5. Ensure there are no UI elements or navigation links exposing Mentor or Admin features.
6. Check that `/dashboard/mentor` returns a 404, redirects to login, or displays an "Unauthorized" message (depending on exact middleware handling).

### 2. Mentor Role Validation
1. Log out of the student account or open a new incognito window.
2. Log in with the **Mentor** credentials.
3. Verify you are successfully redirected to `/dashboard/mentor`.
4. Navigate to **My Services** (`/dashboard/mentor/services`) and verify the UI loads without errors.
5. Navigate to **My Cohorts** (`/dashboard/mentor/programs`) and verify the UI loads without errors.
6. Ensure that accessing student-only routes (if any are strictly protected) behaves correctly.

## Account Reset / Recreation

If the test accounts are deleted or need to be recreated (e.g. after a database reset), you can run the provided setup script:

```bash
node --env-file=.env.local scripts/setup-test-accounts.mjs
```

This script will use the Supabase Service Role Key to safely provision or update the accounts with the required `user_metadata`.
