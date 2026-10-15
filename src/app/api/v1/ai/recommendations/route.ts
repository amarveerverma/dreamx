import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RecommendationService } from '@/lib/career/recommendation-service';

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

    const recommendations = await RecommendationService.evaluateRecommendations(user.id);
    return NextResponse.json({ success: true, data: recommendations });
  } catch (error: any) {
    console.error('[GET /api/v1/ai/recommendations Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
