import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MentorAnalyticsService } from '@/lib/analytics/mentor-analytics-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify role is mentor
    const userRole = (user.app_metadata as any)?.user_role || (user.user_metadata as any)?.role;
    if (userRole && userRole !== 'mentor') {
      return NextResponse.json({ error: 'Forbidden: Mentor role required' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';

    let days = 30;
    if (period === '7d') days = 7;
    else if (period === '90d') days = 90;
    else if (period === 'all') days = 0;

    const analytics = await MentorAnalyticsService.getMentorAnalytics(user.id, days);
    return NextResponse.json({ success: true, data: analytics });
  } catch (error: any) {
    console.error('[GET /api/v1/mentors/me/analytics Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
