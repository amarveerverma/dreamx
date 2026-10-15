import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { JourneyService } from '@/lib/career/journey-service';

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

    const journeyData = await JourneyService.getStudentJourney(user.id);
    return NextResponse.json({ success: true, data: journeyData });
  } catch (error: any) {
    console.error('[GET /api/v1/students/me/journey Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
