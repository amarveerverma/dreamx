import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CareerScoreService } from '@/lib/career/career-score-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scoreData = await CareerScoreService.getStudentScore(user.id);
    return NextResponse.json({ success: true, data: scoreData });
  } catch (error: any) {
    console.error('[GET /api/v1/students/me/score Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
