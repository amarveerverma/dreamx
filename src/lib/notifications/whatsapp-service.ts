export interface WhatsAppReminderProps {
  recipientPhone?: string | null;
  optIn: boolean;
  studentName: string;
  mentorName: string;
  serviceTitle: string;
  scheduledTimeIST: string;
  meetingUrl: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  status: 'delivered' | 'simulated_success' | 'opted_out' | 'failed';
  optedOut?: boolean;
  messageId?: string;
  error?: string;
}

export class WhatsAppService {
  /**
   * Dispatches 24h pre-session reminder via Meta Graph API v19 or local simulation
   */
  public static async sendSessionReminder(props: WhatsAppReminderProps): Promise<WhatsAppSendResult> {
    // 1. Consent Check (India DPDP Act compliance)
    if (!props.optIn) {
      console.log('[WhatsAppService] Recipient opted out of WhatsApp reminders.');
      return { success: false, status: 'opted_out', optedOut: true };
    }

    const phone = props.recipientPhone?.trim();
    if (!phone) {
      console.log('[WhatsAppService] No phone number on profile; skipping WhatsApp reminder.');
      return { success: false, status: 'failed', error: 'Missing phone number' };
    }

    const isLiveEnabled = process.env.FLAG_WHATSAPP_NOTIFICATIONS === 'true';

    // 2. Local Simulation Provider (Active when live Meta API is deferred)
    if (!isLiveEnabled) {
      console.log(`[WhatsAppService Simulated Mode] 24h Reminder staged for ${phone.slice(0, 4)}***${phone.slice(-3)}:`, {
        template: 'dreamx_session_reminder_24h',
        mentor: props.mentorName,
        time: props.scheduledTimeIST,
        meet: props.meetingUrl,
      });

      return {
        success: true,
        status: 'simulated_success',
        messageId: `wamid.simulated.${Date.now()}`,
      };
    }

    // 3. Live Meta Graph API v19 Dispatch
    const metaToken = process.env.META_WHATSAPP_TOKEN;
    const phoneId = process.env.META_PHONE_NUMBER_ID;

    if (!metaToken || !phoneId) {
      return {
        success: false,
        status: 'failed',
        error: 'Missing Meta WhatsApp API credentials in environment',
      };
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone.replace(/[^0-9]/g, ''),
          type: 'template',
          template: {
            name: 'dreamx_session_reminder_24h',
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: props.studentName },
                  { type: 'text', text: props.mentorName },
                  { type: 'text', text: props.serviceTitle },
                  { type: 'text', text: props.scheduledTimeIST },
                  { type: 'text', text: props.meetingUrl },
                ],
              },
            ],
          },
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('[WhatsAppService Meta API Error]:', data);
        return {
          success: false,
          status: 'failed',
          error: data.error?.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        status: 'delivered',
        messageId: data.messages?.[0]?.id,
      };
    } catch (err: any) {
      console.error('[WhatsAppService Network Error]:', err);
      return {
        success: false,
        status: 'failed',
        error: err.message || 'Meta network failure',
      };
    }
  }
}
