import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ogpgoxikulkfpyoorisc.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get('mentor_id') || searchParams.get('slug');

    if (!identifier) {
      return NextResponse.json({ error: 'mentor_id or slug parameter is required' }, { status: 400 });
    }

    // Resolve mentor UUID whether identifier is a UUID or a public slug
    let mentorId = identifier;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    if (!isUuid) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('public_slug', identifier)
        .maybeSingle();
      if (profile) {
        mentorId = profile.id;
      }
    }

    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

    // Fetch reviews for this mentor
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id,
        booking_id,
        reviewer_id,
        mentor_id,
        rating,
        punctuality_rating,
        actionability_rating,
        feedback_text,
        is_public,
        created_at,
        reviewer:profiles!reviewer_id(full_name, avatar_url)
      `)
      .eq('mentor_id', mentorId)
      .eq('is_public', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Reviews GET Error]:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    // Compute aggregate statistics
    const { data: allRatings } = await supabase
      .from('reviews')
      .select('rating')
      .eq('mentor_id', mentorId)
      .eq('is_public', true)
      .is('deleted_at', null);

    let averageRating = 0;
    const ratingBreakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const totalReviews = allRatings?.length || 0;

    if (allRatings && totalReviews > 0) {
      const sum = allRatings.reduce((acc, curr) => {
        const r = curr.rating as 1 | 2 | 3 | 4 | 5;
        if (ratingBreakdown[r] !== undefined) {
          ratingBreakdown[r]++;
        }
        return acc + curr.rating;
      }, 0);
      averageRating = Math.round((sum / totalReviews) * 10) / 10;
    }

    return NextResponse.json({
      success: true,
      reviews: reviews || [],
      total_reviews: totalReviews,
      average_rating: averageRating,
      rating_breakdown: ratingBreakdown,
    });
  } catch (err: any) {
    console.error('[Reviews GET Route Error]:', err);
    return NextResponse.json({ error: 'Internal server error', details: err?.message }, { status: 500 });
  }
}
