import { NextRequest, NextResponse } from 'next/server';
import { PayoutService } from '@/lib/payments/payout-service';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: scheduleId } = await context.params;
    const body = await request.json();
    const { action, reason } = body;

    if (!action) {
      return NextResponse.json({ error: 'action is required (freeze | force_release)' }, { status: 400 });
    }

    if (action === 'freeze') {
      const updated = await PayoutService.freezePayout(
        scheduleId,
        reason || 'Dispute investigation initiated by administrator'
      );
      return NextResponse.json({
        success: true,
        message: 'Payout schedule frozen successfully',
        data: updated,
      });
    }

    if (action === 'force_release') {
      const updated = await PayoutService.forceReleasePayout(
        scheduleId,
        'admin_system_override'
      );
      return NextResponse.json({
        success: true,
        message: 'Payout schedule force-released by administrator',
        data: updated,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    console.error('[Admin Payout Action Error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
