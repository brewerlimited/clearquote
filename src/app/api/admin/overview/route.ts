import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function baseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || '').replace(/\/$/, '');
}

function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'brewerlimited@gmail.com';
  return raw.split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);
}

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: 'Missing Supabase public environment variables.' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const verifier = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await verifier.auth.getUser(token);
  const email = userData.user?.email?.toLowerCase();

  if (userError || !email) {
    return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
  }

  if (!getAdminEmails().includes(email)) {
    return NextResponse.json({ error: 'Admin access only.' }, { status: 403 });
  }

  const [profilesRes, linksRes, responsesRes, quotesRes, opensRes] = await Promise.all([
    supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('feedback_links').select('*'),
    supabaseAdmin.from('feedback_responses').select('*'),
    supabaseAdmin.from('quote_records').select('*'),
    supabaseAdmin.from('feedback_link_events').select('*').eq('event_type', 'open'),
  ]);

  if (profilesRes.error) return NextResponse.json({ error: profilesRes.error.message }, { status: 500 });
  if (linksRes.error) return NextResponse.json({ error: linksRes.error.message }, { status: 500 });
  if (responsesRes.error) return NextResponse.json({ error: responsesRes.error.message }, { status: 500 });
  if (quotesRes.error) return NextResponse.json({ error: quotesRes.error.message }, { status: 500 });

  const profiles = profilesRes.data || [];
  const links = linksRes.data || [];
  const responses = responsesRes.data || [];
  const quotes = quotesRes.data || [];
  const opens = opensRes.error ? [] : (opensRes.data || []);

  const siteUrl = baseUrl();

  const rows = profiles.map((profile: any) => {
    const userQuotes = quotes.filter((q: any) => q.user_id === profile.id);
    const userResponses = responses.filter((r: any) => r.user_id === profile.id);
    const userOpens = opens.filter((event: any) => event.user_id === profile.id);
    const link = links.find((l: any) => l.user_id === profile.id);
    const avgQuoteValue = Number(profile.average_quote_value || 300);
    const fixableResponses = userResponses.filter((r: any) => r.q1_reason !== 'Job didn’t go ahead' && r.q3_improve !== 'Nothing — it was fine').length;
    const fixablePct = userResponses.length ? fixableResponses / userResponses.length : 0;
    const recoverableRevenue = Math.round(userResponses.length * avgQuoteValue * fixablePct);

    return {
      id: profile.id,
      company_name: profile.company_name || 'Unnamed company',
      email: profile.email || '',
      created_at: profile.created_at || null,
      responses: userResponses.length,
      link_opens: userOpens.length,
      quotes: userQuotes.length,
      won: userQuotes.filter((q: any) => q.status === 'won').length,
      lost: userQuotes.filter((q: any) => q.status === 'lost').length,
      no_response: userQuotes.filter((q: any) => q.status === 'no_response').length,
      sent: userQuotes.filter((q: any) => q.status === 'sent').length,
      recoverable_revenue: recoverableRevenue,
      feedback_link: link && siteUrl ? `${siteUrl}/f/${link.slug}` : link ? `/f/${link.slug}` : '',
    };
  });

  return NextResponse.json({
    rows,
    totals: {
      users: rows.length,
      responses: responses.length,
      link_opens: opens.length,
      quotes: quotes.length,
    },
    opensTableAvailable: !opensRes.error,
    opensTableError: opensRes.error?.message || null,
  });
}
