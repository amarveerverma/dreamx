-- ============================================================================
-- MIGRATION 0009: REVIEWS, NOTIFICATIONS, MESSAGES & REALTIME ENGINE
-- ============================================================================

-- Add communication preferences to profiles if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'whatsapp_opt_in'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN whatsapp_opt_in BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone VARCHAR(20) DEFAULT NULL;
  END IF;
END $$;

-- 1. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.service_bookings(id) ON DELETE RESTRICT,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  actionability_rating INTEGER CHECK (actionability_rating >= 1 AND actionability_rating <= 5),
  feedback_text TEXT NOT NULL CHECK (char_length(feedback_text) >= 10 AND char_length(feedback_text) <= 2000),
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_mentor_id ON public.reviews(mentor_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON public.reviews(booking_id);

-- 2. MESSAGES TABLE (Real-Time Booking Chat)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.service_bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 2000),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_booking_created ON public.messages(booking_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);

-- 3. NOTIFICATIONS TABLE (In-App Alert Center)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('bookings', 'offers', 'deliverables', 'milestones', 'billing', 'system')),
  action_url VARCHAR(255),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ DEFAULT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

-- 4. NOTIFICATION SCHEDULES (Delayed Transactional Queue)
CREATE TABLE IF NOT EXISTS public.notification_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.service_bookings(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'whatsapp', 'in_app')),
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('session_reminder', 'review_request', 'booking_confirmed')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  idempotency_key VARCHAR(120) NOT NULL UNIQUE,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ DEFAULT NULL,
  error_message TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_schedules_sweep ON public.notification_schedules(scheduled_for, status)
  WHERE status = 'pending';

-- 5. NOTIFICATION DELIVERY LOGS (Audit & Idempotency Proof)
CREATE TABLE IF NOT EXISTS public.notification_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.notification_schedules(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.service_bookings(id) ON DELETE SET NULL,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  provider VARCHAR(30) NOT NULL,
  provider_message_id VARCHAR(150),
  status VARCHAR(20) NOT NULL CHECK (status IN ('delivered', 'simulated_success', 'failed', 'opted_out')),
  error_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_logs ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES

-- Reviews: Anyone can view active public reviews
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_reviews_select' AND tablename = 'reviews') THEN
    CREATE POLICY "policy_reviews_select" ON public.reviews
      FOR SELECT TO authenticated, anon
      USING (deleted_at IS NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_reviews_insert_student' AND tablename = 'reviews') THEN
    CREATE POLICY "policy_reviews_insert_student" ON public.reviews
      FOR INSERT TO authenticated
      WITH CHECK (
        reviewer_id = auth.uid() AND
        EXISTS (
          SELECT 1 FROM public.service_bookings sb
          WHERE sb.id = reviews.booking_id
            AND sb.student_id = auth.uid()
            AND sb.status = 'completed'
        )
      );
  END IF;
END $$;

-- Messages: Only confirmed booking participants can read and write chat messages
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_messages_select_participants' AND tablename = 'messages') THEN
    CREATE POLICY "policy_messages_select_participants" ON public.messages
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.service_bookings sb
          WHERE sb.id = messages.booking_id
            AND (sb.student_id = auth.uid() OR sb.mentor_id = auth.uid())
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_messages_insert_participants' AND tablename = 'messages') THEN
    CREATE POLICY "policy_messages_insert_participants" ON public.messages
      FOR INSERT TO authenticated
      WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
          SELECT 1 FROM public.service_bookings sb
          WHERE sb.id = messages.booking_id
            AND (sb.student_id = auth.uid() OR sb.mentor_id = auth.uid())
            AND sb.status IN ('confirmed', 'in_progress', 'deliverable_submitted', 'completed')
        )
      );
  END IF;
END $$;

-- Notifications: Users can read and update their own notifications
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_notifications_select_own' AND tablename = 'notifications') THEN
    CREATE POLICY "policy_notifications_select_own" ON public.notifications
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_notifications_update_own' AND tablename = 'notifications') THEN
    CREATE POLICY "policy_notifications_update_own" ON public.notifications
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Schedules and Logs: Service role only (internal engine)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_schedules_service_role' AND tablename = 'notification_schedules') THEN
    CREATE POLICY "policy_schedules_service_role" ON public.notification_schedules
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_logs_service_role' AND tablename = 'notification_delivery_logs') THEN
    CREATE POLICY "policy_logs_service_role" ON public.notification_delivery_logs
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 8. ENABLE SUPABASE REALTIME ON MESSAGES AND NOTIFICATIONS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
