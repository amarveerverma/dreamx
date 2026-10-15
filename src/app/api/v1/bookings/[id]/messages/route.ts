import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { NotificationService } from '@/lib/notifications/notification-service';

export async function GET(
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

    // 1. Participant Access Verification
    const { data: booking, error: bkErr } = await supabase
      .from('service_bookings')
      .select('id, student_id, mentor_id, status')
      .eq('id', bookingId)
      .single();

    if (bkErr || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.student_id !== user.id && booking.mentor_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You are not a participant of this booking' },
        { status: 403 }
      );
    }

    // 2. Fetch Messages with sender profile
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);

    const { data: messages, error: msgErr } = await supabase
      .from('messages')
      .select(`
        id,
        booking_id,
        sender_id,
        content,
        is_read,
        read_at,
        created_at,
        sender:profiles!sender_id(id, full_name, avatar_url, role)
      `)
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (msgErr) {
      console.error('[Messages GET Error]:', msgErr);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // 3. Mark unread messages sent by counterpart as read
    const unreadMessageIds = (messages || [])
      .filter((m) => m.sender_id !== user.id && !m.is_read)
      .map((m) => m.id);

    if (unreadMessageIds.length > 0) {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', unreadMessageIds);
    }

    return NextResponse.json({
      messages: messages || [],
      has_more: (messages?.length || 0) >= limit,
    });
  } catch (err: any) {
    console.error('[Messages GET Route Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const content = typeof body?.content === 'string' ? body.content.trim() : '';

    if (!content || content.length < 1 || content.length > 2000) {
      return NextResponse.json(
        { error: 'Message content must be between 1 and 2,000 characters' },
        { status: 400 }
      );
    }

    // 1. Participant & Status Verification
    const { data: booking, error: bkErr } = await supabase
      .from('service_bookings')
      .select(`
        id,
        student_id,
        mentor_id,
        status,
        service:service_types!service_type_id(title)
      `)
      .eq('id', bookingId)
      .single();

    if (bkErr || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.student_id !== user.id && booking.mentor_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You are not a participant of this booking' },
        { status: 403 }
      );
    }

    const allowedStatuses = ['confirmed', 'in_progress', 'deliverable_submitted', 'completed'];
    if (!allowedStatuses.includes(booking.status)) {
      return NextResponse.json(
        { error: `Cannot send messages for bookings with status "${booking.status}"` },
        { status: 400 }
      );
    }

    // 2. Insert message
    const { data: insertedMessage, error: insertErr } = await supabase
      .from('messages')
      .insert({
        booking_id: bookingId,
        sender_id: user.id,
        content,
      })
      .select(`
        id,
        booking_id,
        sender_id,
        content,
        is_read,
        read_at,
        created_at,
        sender:profiles!sender_id(id, full_name, avatar_url, role)
      `)
      .single();

    if (insertErr || !insertedMessage) {
      console.error('[Messages POST Insert Error]:', insertErr);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // 3. Notify the counterpart participant via in-app alert asynchronously
    const counterpartId = user.id === booking.student_id ? booking.mentor_id : booking.student_id;
    const sender = (insertedMessage as any).sender;
    const senderName = sender?.full_name || 'Participant';
    const preview = content.length > 60 ? `${content.substring(0, 57)}...` : content;

    NotificationService.createInAppNotification({
      userId: counterpartId,
      title: `New message from ${senderName}`,
      body: preview,
      category: 'bookings',
      actionUrl: `/dashboard/${sender?.role === 'student' ? 'mentor' : 'student'}/bookings?id=${bookingId}&chat=true`,
      metadata: { booking_id: bookingId, message_id: insertedMessage.id },
    }).catch((err) => console.error('[Messages Notification Error]:', err));

    return NextResponse.json({
      message: insertedMessage,
    }, { status: 201 });
  } catch (err: any) {
    console.error('[Messages POST Route Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
