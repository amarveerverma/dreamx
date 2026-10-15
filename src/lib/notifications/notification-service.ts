import { createClient } from '@supabase/supabase-js';
import { EmailService } from './email-service';
import { WhatsAppService } from './whatsapp-service';
import type { NotificationCategory, NotificationType } from '@/types/notifications';

// Privileged service role client for background notifications and schedules
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class NotificationService {
  /**
   * Creates an in-app notification entry
   */
  public static async createInAppNotification(params: {
    userId: string;
    title: string;
    body: string;
    category: NotificationCategory;
    actionUrl?: string;
    metadata?: Record<string, any>;
  }) {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: params.userId,
        title: params.title,
        body: params.body,
        category: params.category,
        action_url: params.actionUrl || null,
        metadata: params.metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('[NotificationService createInApp error]:', error);
      return null;
    }
    return data;
  }

  /**
   * Handles immediate dispatch & schedules 24h reminder upon verified booking confirmation
   */
  public static async onBookingConfirmed(bookingId: string) {
    try {
      // 1. Fetch booking with student, mentor, and service type details
      const { data: booking, error: bkErr } = await supabaseAdmin
        .from('service_bookings')
        .select(`
          id,
          student_id,
          mentor_id,
          scheduled_start_utc,
          scheduled_end_utc,
          meeting_url,
          gross_amount,
          status,
          student:profiles!student_id(id, full_name, email, phone, whatsapp_opt_in),
          mentor:profiles!mentor_id(id, full_name, email, phone, whatsapp_opt_in),
          service:service_types!service_type_id(title)
        `)
        .eq('id', bookingId)
        .single();

      if (bkErr || !booking) {
        console.error('[NotificationService onBookingConfirmed] Booking not found:', bkErr);
        return;
      }

      const student = booking.student as any;
      const mentor = booking.mentor as any;
      const service = booking.service as any;

      const scheduledStart = new Date(booking.scheduled_start_utc);
      const scheduledDateIST = scheduledStart.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const scheduledTimeIST = scheduledStart.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
      });

      // 2. In-App Notifications for both participants
      await this.createInAppNotification({
        userId: student.id,
        title: 'Booking Confirmed!',
        body: `Your session for "${service?.title || 'Mentorship'}" with ${mentor?.full_name} is confirmed for ${scheduledDateIST} at ${scheduledTimeIST} IST.`,
        category: 'bookings',
        actionUrl: `/dashboard/student/bookings?id=${booking.id}`,
        metadata: { booking_id: booking.id, meeting_url: booking.meeting_url },
      });

      await this.createInAppNotification({
        userId: mentor.id,
        title: 'New Session Scheduled',
        body: `${student?.full_name} has booked "${service?.title || 'Mentorship'}" for ${scheduledDateIST} at ${scheduledTimeIST} IST.`,
        category: 'bookings',
        actionUrl: `/dashboard/mentor/bookings?id=${booking.id}`,
        metadata: { booking_id: booking.id, meeting_url: booking.meeting_url },
      });

      // 3. Dispatch Immediate Confirmation Emails
      if (student?.email) {
        const studentHtml = EmailService.renderBookingConfirmed({
          recipientName: student.full_name,
          counterpartName: mentor.full_name,
          role: 'student',
          serviceTitle: service?.title || '1-on-1 Mentorship',
          scheduledDateIST,
          scheduledTimeIST,
          meetingUrl: booking.meeting_url,
          grossAmountINR: Number(booking.gross_amount) || 0,
          bookingId: booking.id,
        });

        const res = await EmailService.sendEmail({
          to: student.email,
          subject: `Booking Confirmed: ${service?.title || 'Mentorship'} with ${mentor.full_name}`,
          html: studentHtml,
        });

        await supabaseAdmin.from('notification_delivery_logs').insert({
          booking_id: booking.id,
          recipient_id: student.id,
          channel: 'email',
          notification_type: 'booking_confirmed',
          provider: 'resend',
          provider_message_id: res.messageId || null,
          status: res.success ? 'delivered' : 'failed',
          error_details: res.error ? { error: res.error } : null,
        });
      }

      if (mentor?.email) {
        const mentorHtml = EmailService.renderBookingConfirmed({
          recipientName: mentor.full_name,
          counterpartName: student.full_name,
          role: 'mentor',
          serviceTitle: service?.title || '1-on-1 Mentorship',
          scheduledDateIST,
          scheduledTimeIST,
          meetingUrl: booking.meeting_url,
          grossAmountINR: Number(booking.gross_amount) || 0,
          bookingId: booking.id,
        });

        const res = await EmailService.sendEmail({
          to: mentor.email,
          subject: `New Session Booked: ${student.full_name} for ${service?.title || 'Mentorship'}`,
          html: mentorHtml,
        });

        await supabaseAdmin.from('notification_delivery_logs').insert({
          booking_id: booking.id,
          recipient_id: mentor.id,
          channel: 'email',
          notification_type: 'booking_confirmed',
          provider: 'resend',
          provider_message_id: res.messageId || null,
          status: res.success ? 'delivered' : 'failed',
          error_details: res.error ? { error: res.error } : null,
        });
      }

      // 4. Schedule 24-Hour Pre-Session Reminder in Durable Queue
      const reminderTime = new Date(scheduledStart.getTime() - 24 * 60 * 60 * 1000);
      const scheduleTime = reminderTime > new Date() ? reminderTime.toISOString() : new Date().toISOString();

      await supabaseAdmin.from('notification_schedules').upsert(
        {
          booking_id: booking.id,
          recipient_id: student.id,
          channel: 'email',
          notification_type: 'session_reminder',
          scheduled_for: scheduleTime,
          status: 'pending',
          idempotency_key: `email_reminder_24h_${booking.id}_student`,
        },
        { onConflict: 'idempotency_key' }
      );

      // Also schedule WhatsApp reminder for student
      await supabaseAdmin.from('notification_schedules').upsert(
        {
          booking_id: booking.id,
          recipient_id: student.id,
          channel: 'whatsapp',
          notification_type: 'session_reminder',
          scheduled_for: scheduleTime,
          status: 'pending',
          idempotency_key: `wa_reminder_24h_${booking.id}_student`,
        },
        { onConflict: 'idempotency_key' }
      );

    } catch (err) {
      console.error('[NotificationService onBookingConfirmed exception]:', err);
    }
  }

  /**
   * Handles review request scheduling upon session completion
   */
  public static async onSessionCompleted(bookingId: string) {
    try {
      const { data: booking, error: bkErr } = await supabaseAdmin
        .from('service_bookings')
        .select(`
          id,
          student_id,
          mentor_id,
          status,
          student:profiles!student_id(id, full_name, email),
          mentor:profiles!mentor_id(id, full_name),
          service:service_types!service_type_id(title)
        `)
        .eq('id', bookingId)
        .single();

      if (bkErr || !booking) return;

      const student = booking.student as any;
      const mentor = booking.mentor as any;
      const service = booking.service as any;

      // In-app alert to student
      await this.createInAppNotification({
        userId: student.id,
        title: 'Session Completed — Leave a Review',
        body: `Your session for "${service?.title || 'Mentorship'}" with ${mentor?.full_name} is complete. Share your feedback!`,
        category: 'deliverables',
        actionUrl: `/dashboard/student/bookings?review=${booking.id}`,
        metadata: { booking_id: booking.id },
      });

      // Schedule review request email for 2 hours post-session (or immediately if overdue)
      const reviewTriggerTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      await supabaseAdmin.from('notification_schedules').upsert(
        {
          booking_id: booking.id,
          recipient_id: student.id,
          channel: 'email',
          notification_type: 'review_request',
          scheduled_for: reviewTriggerTime,
          status: 'pending',
          idempotency_key: `email_review_req_${booking.id}`,
        },
        { onConflict: 'idempotency_key' }
      );
    } catch (err) {
      console.error('[NotificationService onSessionCompleted exception]:', err);
    }
  }

  /**
   * Background sweep processor for due delayed reminders
   */
  public static async sweepScheduledNotifications(): Promise<{ processed: number; sent: number; failed: number }> {
    const nowIso = new Date().toISOString();
    let sent = 0;
    let failed = 0;

    const { data: dueSchedules, error } = await supabaseAdmin
      .from('notification_schedules')
      .select(`
        id,
        booking_id,
        recipient_id,
        channel,
        notification_type,
        attempts,
        booking:service_bookings!booking_id(
          id,
          status,
          scheduled_start_utc,
          meeting_url,
          student:profiles!student_id(id, full_name, email, phone, whatsapp_opt_in),
          mentor:profiles!mentor_id(id, full_name, email, phone, whatsapp_opt_in),
          service:service_types!service_type_id(title)
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', nowIso)
      .limit(50);

    if (error || !dueSchedules || dueSchedules.length === 0) {
      return { processed: 0, sent: 0, failed: 0 };
    }

    for (const schedule of dueSchedules) {
      const booking = schedule.booking as any;

      // 1. Safety check: If booking was cancelled, cancel the schedule
      if (!booking || booking.status === 'cancelled') {
        await supabaseAdmin
          .from('notification_schedules')
          .update({ status: 'cancelled' })
          .eq('id', schedule.id);
        continue;
      }

      const student = booking.student as any;
      const mentor = booking.mentor as any;
      const service = booking.service as any;

      const scheduledStart = new Date(booking.scheduled_start_utc);
      const scheduledDateIST = scheduledStart.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' });
      const scheduledTimeIST = scheduledStart.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });

      try {
        let dispatchSuccess = false;
        let providerMsgId: string | undefined = undefined;

        if (schedule.notification_type === 'session_reminder') {
          if (schedule.channel === 'email' && student?.email) {
            const html = EmailService.renderSessionReminder({
              recipientName: student.full_name,
              counterpartName: mentor.full_name,
              serviceTitle: service?.title || 'Mentorship',
              scheduledDateIST,
              scheduledTimeIST,
              meetingUrl: booking.meeting_url,
              bookingId: booking.id,
            });
            const res = await EmailService.sendEmail({
              to: student.email,
              subject: `Reminder: Session tomorrow at ${scheduledTimeIST} IST (${mentor.full_name})`,
              html,
            });
            dispatchSuccess = res.success;
            providerMsgId = res.messageId;
          } else if (schedule.channel === 'whatsapp') {
            const waRes = await WhatsAppService.sendSessionReminder({
              recipientPhone: student?.phone || '+919876543210',
              optIn: student?.whatsapp_opt_in ?? true,
              studentName: student.full_name,
              mentorName: mentor.full_name,
              serviceTitle: service?.title || 'Mentorship',
              scheduledTimeIST,
              meetingUrl: booking.meeting_url,
            });
            if (waRes.status === 'opted_out') {
              dispatchSuccess = true;
              providerMsgId = 'opted_out';
            } else {
              dispatchSuccess = waRes.success;
              providerMsgId = waRes.messageId;
            }
          }
        } else if (schedule.notification_type === 'review_request') {
          if (schedule.channel === 'email' && student?.email) {
            const html = EmailService.renderReviewRequest({
              studentName: student.full_name,
              mentorName: mentor.full_name,
              serviceTitle: service?.title || 'Mentorship',
              bookingId: booking.id,
              reviewUrl: `https://dreamx.com/dashboard/student/bookings?review=${booking.id}`,
            });
            const res = await EmailService.sendEmail({
              to: student.email,
              subject: `Review your session with ${mentor.full_name} — DreamX`,
              html,
            });
            dispatchSuccess = res.success;
            providerMsgId = res.messageId;
          }
        }

        if (dispatchSuccess) {
          sent++;
          await supabaseAdmin
            .from('notification_schedules')
            .update({ status: 'sent', last_attempt_at: new Date().toISOString() })
            .eq('id', schedule.id);

          await supabaseAdmin.from('notification_delivery_logs').insert({
            schedule_id: schedule.id,
            booking_id: booking.id,
            recipient_id: schedule.recipient_id,
            channel: schedule.channel,
            notification_type: schedule.notification_type,
            provider: schedule.channel === 'email' ? 'resend' : 'meta_whatsapp',
            provider_message_id: providerMsgId || null,
            status: providerMsgId === 'opted_out' ? 'opted_out' : (schedule.channel === 'whatsapp' ? 'simulated_success' : 'delivered'),
          });
        } else {
          failed++;
          const nextAttempts = (schedule.attempts || 0) + 1;
          await supabaseAdmin
            .from('notification_schedules')
            .update({
              attempts: nextAttempts,
              status: nextAttempts >= 3 ? 'failed' : 'pending',
              last_attempt_at: new Date().toISOString(),
              error_message: 'Dispatch attempt failed',
            })
            .eq('id', schedule.id);
        }
      } catch (err: any) {
        failed++;
        console.error('[Sweep error on schedule]:', schedule.id, err);
      }
    }

    return { processed: dueSchedules.length, sent, failed };
  }

  /**
   * Cancels any pending notification schedules when a booking is cancelled
   */
  public static async cancelBookingSchedules(bookingId: string) {
    await supabaseAdmin
      .from('notification_schedules')
      .update({ status: 'cancelled' })
      .eq('booking_id', bookingId)
      .eq('status', 'pending');
  }
}
