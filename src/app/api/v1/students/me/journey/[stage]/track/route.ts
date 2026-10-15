import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { JourneyService } from '@/lib/career/journey-service';

export async function POST(
  request: Request,
  { params }: { params: { stage: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stageNum = parseInt(params.stage, 10);
    if (isNaN(stageNum) || (stageNum !== 7 && stageNum !== 10)) {
      return NextResponse.json(
        { error: 'Only Stage 7 (Job Application) and Stage 10 (Career Growth) support manual tracking' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const result = await JourneyService.recordManualProgress(user.id, stageNum, body);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    console.error('[POST /api/v1/students/me/journey/[stage]/track Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
