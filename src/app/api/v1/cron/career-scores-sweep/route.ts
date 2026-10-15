import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CareerScoreService } from '@/lib/career/career-score-service';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || process.env.NODE_ENV !== 'production') {
    return true;
  }
  const authHeader = req.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    const { recalculated_count } = await CareerScoreService.recalculateStaleScores(60);
    return NextResponse.json({
      success: true,
      message: `Career scores sweep completed. Recalculated ${recalculated_count} student scores.`,
      processed_count: recalculated_count,
    });
  } catch (err: any) {
    console.error('[Career Scores Sweep Route Error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req);
}
