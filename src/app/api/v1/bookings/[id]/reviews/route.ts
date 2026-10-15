import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { NotificationService } from '@/lib/notifications/notification-service';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = params.id;
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    const body = await req.json();
    const rating = Number(body?.rating);
    const punctualityRating = body?.punctuality_rating ? Number(body.punctuality_rating) : null;
    const actionabilityRating = body?.actionability_rating ? Number(body.actionability_rating) : null;
    const feedbackText = typeof body?.feedback_text === 'string' ? body.feedback_text.trim() : '';

    // 1. Validation
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 });
    }

    if (punctualityRating !== null && (punctualityRating < 1 || punctualityRating > 5)) {
      return NextResponse.json({ error: 'Punctuality rating must be between 1 and 5' }, { status: 400 });
    }

    if (actionabilityRating !== null && (actionabilityRating < 1 || actionabilityRating > 5)) {
      return NextResponse.json({ error: 'Actionability rating must be between 1 and 5' }, { status: 400 });
    }

    if (!feedbackText || feedbackText.length < 10 || feedbackText.length > 2000) {
      return NextResponse.json(
        { error: 'Feedback text must be between 10 and 2,000 characters' },
        { status: 400 }
      );
    }

    // 2. Booking Eligibility Verification
    const { data: booking, error: bkErr } = await supabase
      .from('service_bookings')
      .select('id, student_id, mentor_id, status')
      .eq('id', bookingId)
      .single();

    if (bkErr || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.student_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Only the student who booked the session can submit a review' },
        { status: 403 }
      );
    }

    if (booking.status !== 'completed') {
      return NextResponse.json(
        { error: `Reviews can only be submitted for completed sessions. Current status: "${booking.status}"` },
        { status: 400 }
      );
    }

    // 3. Duplicate Review Check
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json(
        { error: 'A review has already been submitted for this session' },
        { status: 409 }
      );
    }

    // 4. Insert Review
    const { data: insertedReview, error: insertErr } = await supabase
      .from('reviews')
      .insert({
        booking_id: bookingId,
        reviewer_id: user.id,
        mentor_id: booking.mentor_id,
        rating,
        punctuality_rating: punctualityRating,
        actionability_rating: actionabilityRating,
        feedback_text: feedbackText,
        is_public: true,
      })
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
      .single();

    if (insertErr || !insertedReview) {
      console.error('[Review POST Insert Error]:', insertErr);
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    // 5. Notify the mentor of the new review
    const preview = feedbackText.length > 80 ? `${feedbackText.substring(0, 77)}...` : feedbackText;
    NotificationService.createInAppNotification({
      userId: booking.mentor_id,
      title: `New ${rating}★ Review Received!`,
      body: `A student reviewed your completed session: "${preview}"`,
      category: 'milestones',
      actionUrl: `/dashboard/mentor/bookings?id=${bookingId}`,
      metadata: { booking_id: bookingId, review_id: insertedReview.id, rating },
    }).catch((err) => console.error('[Review Notification Error]:', err));

    return NextResponse.json({
      success: true,
      review: insertedReview,
    }, { status: 201 });
  } catch (err: any) {
    console.error('[Review POST Route Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
