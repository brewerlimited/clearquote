'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Profile = { id: string; email: string | null; company_name: string; average_quote_value: number };
type FeedbackLink = { id: string; slug: string; user_id: string };
type ResponseRow = {
  id: string;
  q1_reason: string;
  q2_priority: string;
  q3_improve: string;
  q4_other: string | null;
  created_at: string;
};

type QuoteRecord = {
  id: string;
  quote_name: string | null;
  quote_value: number;
  status: 'sent' | 'won' | 'lost' | 'no_response';
  quoted_at: string;
  created_at: string;
};

const monthStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

const isFixable = (r: ResponseRow) => r.q1_reason !== "Job didn’t go ahead" && r.q3_improve !== "Nothing — it was fine";

function countBy(rows: ResponseRow[], key: keyof Pick<ResponseRow, 'q1_reason' | 'q2_priority' | 'q3_improve'>) {
  const counts = new Map<string, number>();
  rows.forEach((row) => counts.set(String(row[key]), (counts.get(String(row[key])) || 0) + 1));
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count, pct: rows.length ? Math.round((count / rows.length) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);
}

function Bars({ data }: { data: { label: string; pct: number; count: number }[] }) {
  if (!data.length) return <p className="body-text">No responses yet. Send your feedback link after lost quotes to start building insights.</p>;
  return <div className="bars">{data.map((item) => (
    <div className="bar-row" key={item.label}>
      <div className="bar-meta"><span>{item.label}</span><span>{item.pct}%</span></div>
      <div className="bar-track"><div className="bar-fill" style={{ width: `${item.pct}%` }} /></div>
    </div>
  ))}</div>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [link, setLink] = useState<FeedbackLink | null>(null);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState('Copy link');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);

    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return router.push('/login');

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: linkData } = await supabase.from('feedback_links').select('*').eq('user_id', user.id).single();
      const { data: responseData } = await supabase
        .from('feedback_responses')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', monthStart().toISOString())
        .order('created_at', { ascending: false });

      const { data: quoteData } = await supabase
        .from('quote_records')
        .select('*')
        .eq('user_id', user.id)
        .gte('quoted_at', monthStart().toISOString().slice(0, 10))
        .order('quoted_at', { ascending: false });

      setProfile(profileData);
      setLink(linkData);
      setResponses(responseData || []);
      setQuotes(quoteData || []);
      setLoading(false);
    }
    load();
  }, [router]);

  const stats = useMemo(() => {
    const total = responses.length;
    const fixableCount = responses.filter(isFixable).length;
    const fixablePct = total ? Math.round((fixableCount / total) * 100) : 0;

    const quotesLogged = quotes.length;
    const quotesWon = quotes.filter((q) => q.status === 'won').length;
    const quotesLost = quotes.filter((q) => q.status === 'lost').length;
    const quotesNoResponse = quotes.filter((q) => q.status === 'no_response').length;
    const quotesOpen = quotes.filter((q) => q.status === 'sent' || q.status === 'no_response').length;
    const conversionRate = quotesLogged ? Math.round((quotesWon / quotesLogged) * 100) : 0;
    const quotedValue = quotes.reduce((sum, q) => sum + Number(q.quote_value || 0), 0);
    const wonValue = quotes.filter((q) => q.status === 'won').reduce((sum, q) => sum + Number(q.quote_value || 0), 0);
    const openValue = quotes.filter((q) => q.status === 'sent' || q.status === 'no_response').reduce((sum, q) => sum + Number(q.quote_value || 0), 0);

    const trackedAverage = quotesLogged ? quotedValue / quotesLogged : 0;
    const avgValue = trackedAverage || profile?.average_quote_value || 300;
    const opportunity = total * avgValue * (fixablePct / 100);
    const low = Math.round(opportunity * 0.5 / 50) * 50;
    const high = Math.round(opportunity / 50) * 50;

    const reasons = countBy(responses, 'q1_reason');
    const priorities = countBy(responses, 'q2_priority');
    const improvements = countBy(responses, 'q3_improve');
    const last = responses[0]?.created_at ? new Date(responses[0].created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';
    const topReason = reasons[0]?.label || 'No data yet';
    const priority = priorities[0]?.label || reasons[0]?.label || 'Collect more feedback';
    const biggestMissedWin = improvements[0]?.label || priority;
    const competitiveStrength = priorities.find((p) => ['Trust / confidence', 'Communication', 'Reviews', 'Availability'].includes(p.label))?.label || priorities[0]?.label || 'Collect more feedback';

    return {
      total,
      fixableCount,
      fixablePct,
      low,
      high,
      reasons,
      priorities,
      improvements,
      last,
      topReason,
      priority,
      biggestMissedWin,
      competitiveStrength,
      quotesLogged,
      quotesWon,
      quotesLost,
      quotesNoResponse,
      quotesOpen,
      conversionRate,
      quotedValue,
      wonValue,
      openValue
    };
  }, [responses, quotes, profile]);

  const feedbackUrl = link ? `${(process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || origin)}/f/${link.slug}` : '';

  async function copyFeedbackLink() {
    if (!feedbackUrl) return;

    try {
      await navigator.clipboard.writeText(feedbackUrl);
      setCopyStatus('Copied');
      setTimeout(() => setCopyStatus('Copy link'), 1800);
    } catch {
      setCopyStatus('Copy failed');
      setTimeout(() => setCopyStatus('Copy link'), 1800);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) return <main className="page"><p className="body-text">Loading dashboard...</p></main>;

  return (
    <main className="page">
      <nav className="nav">
        <div className="logo">ClearQuote</div>
        <div className="nav-links">
          <Link className="btn" href="/quotes">Quotes</Link>
          <Link className="btn" href="/settings">Settings</Link>
          <Link className="btn" href="/admin">Admin</Link>
          <button className="btn" onClick={signOut}>Sign out</button>
        </div>
      </nav>

      <header className="header">
        <div className="eyebrow">{profile?.company_name || 'Quote feedback summary'}</div>
        <h1>Why quotes didn’t convert this month</h1>
        <p className="sub">Anonymous customer feedback turned into practical quote-winning insight.</p>
      </header>

      <section className="top-grid">
        <div className="card hero">
          <div className="label">Potentially fixable quotes</div>
          <div className="hero-value"><span>{stats.fixablePct}</span>%</div>
          <p className="body-text" style={{ marginTop: 10 }}>Lost for reasons such as speed, clarity, trust or communication.</p>
        </div>
        <div className="grid">
          <div className="card">
            <div className="label">Recoverable work</div>
            <div className="mini-value">£{stats.low.toLocaleString()} – £{stats.high.toLocaleString()}</div>
            <p className="body-text" style={{ marginTop: 8 }}>Based on customer feedback, tracked quotes and fixable percentage.</p>
          </div>
          <div className="metrics">
            <div className="mini-card"><div className="label">Responses this month</div><div className="mini-value">{stats.total}</div></div>
            <div className="mini-card"><div className="label">Last response</div><div className="mini-value">{stats.last}</div></div>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="card">
          <div className="section-title">Quote performance</div>
          <div className="quote-performance">
            <div><span className="label">Quotes logged</span><strong>{stats.quotesLogged}</strong></div>
            <div><span className="label">Conversion</span><strong>{stats.conversionRate}%</strong></div>
            <div><span className="label">Won value</span><strong>£{stats.wonValue.toLocaleString()}</strong></div>
            <div><span className="label">Open value</span><strong>£{stats.openValue.toLocaleString()}</strong></div>
          </div>
          <p className="body-text" style={{ marginTop: 12 }}>Track quotes to connect customer feedback with real conversion and revenue performance.</p>
        </div>
        <div className="card">
          <div className="section-title">Quote status this month</div>
          <div className="status-strip">
            <span>Won: {stats.quotesWon}</span>
            <span>Lost: {stats.quotesLost}</span>
            <span>No response: {stats.quotesNoResponse}</span>
            <span>Open: {stats.quotesOpen}</span>
          </div>
          <Link className="btn primary" href="/quotes" style={{ marginTop: 14 }}>Add or update quotes</Link>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="card">
          <div className="section-title">Biggest missed win</div>
          <p className="body-text">Focus first on <strong className="accent">{stats.biggestMissedWin}</strong>. This is the clearest improvement signal from customer feedback.</p>
        </div>
        <div className="card">
          <div className="section-title">Where you’re competitive</div>
          <p className="body-text">Your strongest customer decision signal is <strong>{stats.competitiveStrength}</strong>. Protect this while improving the main loss reason.</p>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="card"><div className="section-title">Why you’re losing quotes</div><Bars data={stats.reasons} /><p className="chart-takeaway">Most lost quotes are currently linked to {stats.topReason.toLowerCase()}.</p></div>
        <div className="card"><div className="section-title">What customers care about</div><Bars data={stats.priorities} /><p className="chart-takeaway">Customers are mainly choosing based on {stats.priority.toLowerCase()}.</p></div>
        <div className="card"><div className="section-title">What could have improved the quote</div><Bars data={stats.improvements} /><p className="chart-takeaway">The strongest improvement signal is {stats.biggestMissedWin.toLowerCase()}.</p></div>
        <div className="card">
          <div className="section-title">Quote tracking link</div>
          <p className="body-text">Log sent, won, lost and no-response quotes so ClearQuote can compare feedback against actual conversion.</p>
          <Link className="btn primary" href="/quotes" style={{ marginTop: 14 }}>Open quote tracker</Link>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="card">
          <div className="section-title">Anonymous customer comments</div>
          {responses.filter(r => r.q4_other && r.q4_other.trim()).slice(0, 5).map(r => (
            <div className="comment" key={r.id}>{r.q4_other}<div className="comment-date">{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div></div>
          ))}
          {!responses.some(r => r.q4_other && r.q4_other.trim()) && <p className="body-text">No comments yet.</p>}
        </div>
        <div className="card">
          <div className="section-title">This month’s summary</div>
          <p className="body-text">You received {stats.total} feedback response{stats.total === 1 ? '' : 's'} and logged {stats.quotesLogged} quote{stats.quotesLogged === 1 ? '' : 's'} this month. {stats.fixableCount} feedback response{stats.fixableCount === 1 ? '' : 's'} were potentially fixable. Conversion is currently {stats.conversionRate}%, with £{stats.openValue.toLocaleString()} still open or unanswered.</p>
        </div>
      </section>

      {link && (
        <section className="card wide">
          <div className="section-title">Your feedback link</div>
          <p className="body-text" style={{ marginBottom: 10 }}>Copy and send this after quotes that don’t go ahead.</p>
          <div className="copy-row">
            <input
              className="copy-input"
              value={feedbackUrl}
              readOnly
              onClick={(e) => e.currentTarget.select()}
              aria-label="Customer feedback link"
            />
            <button className="btn primary copy-btn" type="button" onClick={copyFeedbackLink}>
              {copyStatus}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
