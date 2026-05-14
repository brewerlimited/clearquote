'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type AdminRow = {
  id: string;
  company_name: string;
  email: string;
  created_at?: string | null;
  responses: number;
  link_opens: number;
  quotes: number;
  won: number;
  lost: number;
  no_response: number;
  sent: number;
  recoverable_revenue: number;
  feedback_link: string;
};

type AdminResponse = {
  rows: AdminRow[];
  totals: {
    users: number;
    responses: number;
    link_opens: number;
    quotes: number;
  };
  opensTableAvailable?: boolean;
  opensTableError?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [totals, setTotals] = useState<AdminResponse['totals']>({ users: 0, responses: 0, link_opens: 0, quotes: 0 });
  const [search, setSearch] = useState('');
  const [copyStatus, setCopyStatus] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opensWarning, setOpensWarning] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');

      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/admin/overview', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (response.status === 403) {
        router.push('/dashboard');
        return;
      }

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || 'Failed to load admin dashboard.');
        setLoading(false);
        return;
      }

      setRows(payload.rows || []);
      setTotals(payload.totals || { users: 0, responses: 0, link_opens: 0, quotes: 0 });
      setOpensWarning(payload.opensTableAvailable === false ? 'Link opens are not being tracked yet. Run the admin SQL patch in Supabase.' : '');
      setLoading(false);
    }

    load();
  }, [router]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => `${row.company_name} ${row.email}`.toLowerCase().includes(term));
  }, [rows, search]);

  async function copy(row: AdminRow) {
    if (!row.feedback_link) return;
    await navigator.clipboard.writeText(row.feedback_link);
    setCopyStatus((current) => ({ ...current, [row.id]: 'Copied' }));
    setTimeout(() => setCopyStatus((current) => ({ ...current, [row.id]: 'Copy link' })), 1600);
  }

  if (loading) {
    return <main className="page"><p className="body-text">Loading admin dashboard...</p></main>;
  }

  return (
    <main className="page">
      <nav className="nav">
        <div className="logo">ClearQuote Admin</div>
        <div className="nav-links">
          <Link className="btn" href="/dashboard">Dashboard</Link>
        </div>
      </nav>

      <header className="header">
        <div className="eyebrow">Admin overview</div>
        <h1>Global ClearQuote activity</h1>
        <p className="sub">All users, quote activity, feedback responses and feedback link usage.</p>
      </header>

      {error && <section className="card"><p className="error">{error}</p></section>}
      {opensWarning && <section className="card"><p className="body-text">{opensWarning}</p></section>}

      <section className="metrics" style={{ marginBottom: 12 }}>
        <div className="mini-card"><div className="label">Users</div><div className="mini-value">{totals.users}</div></div>
        <div className="mini-card"><div className="label">Feedback responses</div><div className="mini-value">{totals.responses}</div></div>
        <div className="mini-card"><div className="label">Link opens</div><div className="mini-value">{totals.link_opens}</div></div>
        <div className="mini-card"><div className="label">Quotes tracked</div><div className="mini-value">{totals.quotes}</div></div>
      </section>

      <section className="card">
        <div className="section-title">Users</div>
        <p className="body-text" style={{ marginBottom: 12 }}>Search by company or email.</p>
        <input
          className="input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search users..."
          style={{ marginBottom: 14 }}
        />

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1120 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: 12 }}>Company</th>
                <th style={{ padding: 12 }}>Email</th>
                <th style={{ padding: 12 }}>Signup</th>
                <th style={{ padding: 12 }}>Opens</th>
                <th style={{ padding: 12 }}>Responses</th>
                <th style={{ padding: 12 }}>Quotes</th>
                <th style={{ padding: 12 }}>Won</th>
                <th style={{ padding: 12 }}>Lost</th>
                <th style={{ padding: 12 }}>No response</th>
                <th style={{ padding: 12 }}>Recoverable</th>
                <th style={{ padding: 12 }}>Feedback link</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: 12 }}>{row.company_name}</td>
                  <td style={{ padding: 12 }}>{row.email || '—'}</td>
                  <td style={{ padding: 12 }}>{formatDate(row.created_at)}</td>
                  <td style={{ padding: 12 }}>{row.link_opens}</td>
                  <td style={{ padding: 12 }}>{row.responses}</td>
                  <td style={{ padding: 12 }}>{row.quotes}</td>
                  <td style={{ padding: 12 }}>{row.won}</td>
                  <td style={{ padding: 12 }}>{row.lost}</td>
                  <td style={{ padding: 12 }}>{row.no_response}</td>
                  <td style={{ padding: 12 }}>£{row.recoverable_revenue.toLocaleString()}</td>
                  <td style={{ padding: 12 }}>
                    <button className="btn" onClick={() => copy(row)} disabled={!row.feedback_link}>
                      {copyStatus[row.id] || 'Copy link'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
