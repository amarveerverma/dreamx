export type NotificationCategory = 
  | 'bookings' 
  | 'offers' 
  | 'deliverables' 
  | 'milestones' 
  | 'billing' 
  | 'system';

export type NotificationChannel = 'email' | 'whatsapp' | 'in_app';

export type NotificationType = 
  | 'booking_confirmed' 
  | 'session_reminder' 
  | 'review_request';

export type ScheduleStatus = 
  | 'pending' 
  | 'processing' 
  | 'sent' 
  | 'failed' 
  | 'cancelled';

export interface InAppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  action_url?: string | null;
  is_read: boolean;
  read_at?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  booking_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  sender?: {
    full_name: string;
    avatar_url?: string | null;
    role: string;
  };
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  mentor_id: string;
  rating: number;
  punctuality_rating?: number | null;
  actionability_rating?: number | null;
  feedback_text: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  reviewer?: {
    full_name: string;
    avatar_url?: string | null;
  };
}

export interface NotificationSchedule {
  id: string;
  booking_id: string;
  recipient_id: string;
  channel: NotificationChannel;
  notification_type: NotificationType;
  scheduled_for: string;
  status: ScheduleStatus;
  idempotency_key: string;
  attempts: number;
  last_attempt_at?: string | null;
  error_message?: string | null;
  created_at: string;
}

export interface NotificationDeliveryLog {
  id: string;
  schedule_id?: string | null;
  booking_id?: string | null;
  recipient_id: string;
  channel: string;
  notification_type: string;
  provider: string;
  provider_message_id?: string | null;
  status: 'delivered' | 'simulated_success' | 'failed' | 'opted_out';
  error_details?: Record<string, any> | null;
  created_at: string;
}
