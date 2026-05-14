'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type QuoteStatus = 'sent' | 'won' | 'lost' | 'no_response';

type QuoteRecord = {
  id: string;
  quote_name: string | null;
  quote_value: number;
  status: QuoteStatus;
  quoted_at: string;
  notes: string | null;
  created_at: string;
};

const statusOptions: { value: QuoteStatus; label: string }[] = [
  { value: 'sent', label: 'Sent' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'no_response', label: 'No response' }
];

const statusLabels: Record<QuoteStatus, string> = {
  sent: 'Sent',
  won: 'Won',
  lost: 'Lost',
  no_response: 'No response'
};

function monthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function QuotesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [form, setForm] = useState({
    quote_name: '',
    quote_value: '',
    status: 'sent' as QuoteStatus,
    quoted_at: today(),
    notes: ''
  });

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return router.push('/login');

      setUserId(user.id);
      const { data, error } = await supabase
        .from('quote_records')
        .select('*')
        .eq('user_id', user.id)
        .gte('quoted_at', monthStart())
        .order('quoted_at', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) setError(error.message);
      setQuotes(data || []);
      setLoading(false);
    }

    load();
  }, [router]);

  const stats = useMemo(() => {
    const total = quotes.length;
    const won = quotes.filter((q) => q.status === 'won').length;
    const lost = quotes.filter((q) => q.status === 'lost').length;
    const noResponse = quotes.filter((q) => q.status === 'no_response').length;
    const sent = quotes.filter((q) => q.status === 'sent').length;
    const conversionRate = total ? Math.round((won / total) * 100) : 0;
    const totalValue = quotes.reduce((sum, q) => sum + Number(q.quote_value || 0), 0);
    const wonValue = quotes.filter((q) => q.status === 'won').reduce((sum, q) => sum + Number(q.quote_value || 0), 0);
    const openValue = quotes.filter((q) => q.status === 'sent' || q.status === 'no_response').reduce((sum, q) => sum + Number(q.quote_value || 0), 0);

    return { total, won, lost, noResponse, sent, conversionRate, totalValue, wonValue, openValue };
  }, [quotes]);

  async function addQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setError('');
    setSaved('');

    const { data, error } = await supabase
      .from('quote_records')
      .insert({
        user_id: userId,
        quote_name: form.quote_name.trim() || null,
        quote_value: Number(form.quote_value || 0),
        status: form.status,
        quoted_at: form.quoted_at || today(),
        notes: form.notes.trim() || null
      })
      .select('*')
      .single();

    setSaving(false);

    if (error) return setError(error.message);

    setQuotes((prev) => [data, ...prev]);
    setSaved('Quote added');
    setForm({ quote_name: '', quote_value: '', status: 'sent', quoted_at: today(), notes: '' });
    setTimeout(() => setSaved(''), 1800);
  }

  async function updateStatus(id: string, status: QuoteStatus) {
    setError('');
    const { error } = await supabase
      .from('quote_records')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return setError(error.message);
    setQuotes((prev) => prev.map((quote) => quote.id === id ? { ...quote, status } : quote));
  }

  async function deleteQuote(id: string) {
    setError('');
    const { error } = await supabase.from('quote_records').delete().eq('id', id);
    if (error) return setError(error.message);
    setQuotes((prev) => prev.filter((quote) => quote.id !== id));
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) return <main className="page"><p className="body-text">Loading quote tracker...</p></main>;

  return (
    <main className="page">
      <nav className="nav">
        <div className="logo">ClearQuote</div>
        <div className="nav-links">
          <Link className="btn" href="/dashboard">Dashboard</Link>
          <Link className="btn" href="/settings">Settings</Link>
          <button className="btn" onClick={signOut}>Sign out</button>
        </div>
      </nav>

      <header className="header">
        <div className="eyebrow">Quote tracking</div>
        <h1>Track quotes, wins and lost work.</h1>
        <p className="sub">Log basic quote outcomes so ClearQuote can show conversion rate, open value and performance alongside anonymous feedback.</p>
      </header>

      <section className="dashboard-grid">
        <div className="card hero">
          <div className="label">Conversion rate this month</div>
          <div className="hero-value"><span>{stats.conversionRate}</span>%</div>
          <p className="body-text" style={{ marginTop: 10 }}>{stats.won} won from {stats.total} quote{stats.total === 1 ? '' : 's'} logged.</p>
        </div>
        <div className="card">
          <div className="section-title">Open quote value</div>
          <div className="mini-value">£{stats.openValue.toLocaleString()}</div>
          <p className="body-text" style={{ marginTop: 8 }}>Value of quotes still marked as sent or no response.</p>
        </div>
      </section>

      <section className="metrics quote-metrics">
        <div className="mini-card"><div className="label">Sent</div><div className="mini-value">{stats.sent}</div></div>
        <div className="mini-card"><div className="label">Won</div><div className="mini-value">{stats.won}</div></div>
        <div className="mini-card"><div className="label">Lost</div><div className="mini-value">{stats.lost}</div></div>
        <div className="mini-card"><div className="label">No response</div><div className="mini-value">{stats.noResponse}</div></div>
      </section>

      <section className="dashboard-grid">
        <form className="card form" onSubmit={addQuote}>
          <div className="section-title">Add quote</div>

          <label>
            <div className="label">Quote / customer reference</div>
            <input className="input" value={form.quote_name} onChange={(e) => setForm({ ...form, quote_name: e.target.value })} placeholder="e.g. Boiler replacement - HU3" />
          </label>

          <label>
            <div className="label">Quote value (£)</div>
            <input className="input" type="number" min="0" step="1" value={form.quote_value} onChange={(e) => setForm({ ...form, quote_value: e.target.value })} placeholder="350" required />
          </label>

          <label>
            <div className="label">Status</div>
            <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as QuoteStatus })}>
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <label>
            <div className="label">Quote date</div>
            <input className="input" type="date" value={form.quoted_at} onChange={(e) => setForm({ ...form, quoted_at: e.target.value })} required />
          </label>

          <label>
            <div className="label">Notes (optional)</div>
            <textarea className="textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional internal note" />
          </label>

          {error && <p className="error">{error}</p>}
          {saved && <p className="success">{saved}</p>}

          <button className="btn primary" disabled={saving}>{saving ? 'Adding...' : 'Add quote'}</button>
        </form>

        <section className="card">
          <div className="section-title">Quotes this month</div>
          {!quotes.length && <p className="body-text">No quotes logged yet. Add the first one to start tracking conversion.</p>}
          <div className="quote-list">
            {quotes.map((quote) => (
              <div className="quote-item" key={quote.id}>
                <div className="quote-item-top">
                  <div>
                    <div className="quote-name">{quote.quote_name || 'Untitled quote'}</div>
                    <div className="quote-meta">{new Date(quote.quoted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · £{Number(quote.quote_value || 0).toLocaleString()}</div>
                  </div>
                  <span className={`status-badge status-${quote.status}`}>{statusLabels[quote.status]}</span>
                </div>

                {quote.notes && <p className="body-text quote-note">{quote.notes}</p>}

                <div className="quote-actions">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`mini-action ${quote.status === option.value ? 'active' : ''}`}
                      onClick={() => updateStatus(quote.id, option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                  <button type="button" className="mini-action danger-action" onClick={() => deleteQuote(quote.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
