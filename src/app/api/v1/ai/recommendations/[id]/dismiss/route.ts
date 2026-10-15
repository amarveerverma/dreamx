import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RecommendationService } from '@/lib/career/recommendation-service';

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
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

    const success = await RecommendationService.dismissRecommendation(user.id, params.id);
    if (!success) {
      return NextResponse.json({ error: 'Failed to dismiss recommendation' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Recommendation dismissed for 14 days' });
  } catch (error: any) {
    console.error('[PATCH /api/v1/ai/recommendations/[id]/dismiss Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
