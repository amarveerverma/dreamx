import { NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notifications/notification-service';

function isAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  // If no CRON_SECRET is configured or in development mode, allow invocation
  if (!cronSecret || process.env.NODE_ENV !== 'production') {
    return true;
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  return false;
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    const result = await NotificationService.sweepScheduledNotifications();

    return NextResponse.json({
      success: true,
      message: `Notifications sweep completed. Processed: ${result.processed}, Sent: ${result.sent}, Failed: ${result.failed}`,
      data: result,
    });
  } catch (err: any) {
    console.error('[Notifications Sweep Route Error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req);
}
