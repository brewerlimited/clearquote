import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const linkId = String(body.link_id || '');
    const userId = String(body.user_id || '');

    if (!linkId || !userId) {
      return NextResponse.json({ ok: false, error: 'Missing link_id or user_id.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('feedback_link_events').insert({
      link_id: linkId,
      user_id: userId,
      event_type: 'open',
      user_agent: request.headers.get('user-agent'),
      referrer: request.headers.get('referer'),
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Failed to record open.' }, { status: 500 });
  }
}
