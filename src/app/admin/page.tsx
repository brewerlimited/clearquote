
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type UserRow = {
  id: string;
  email: string;
  company_name: string;
  created_at?: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.push('/login');
        return;
      }

      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'brewerlimited@gmail.com';

      if (user.email !== adminEmail) {
        router.push('/dashboard');
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: links } = await supabase
        .from('feedback_links')
        .select('*');

      const { data: responses } = await supabase
        .from('feedback_responses')
        .select('*');

      const { data: quotes } = await supabase
        .from('quote_records')
        .select('*');

      const mapped = (profiles || []).map((profile: any) => {
        const userQuotes = (quotes || []).filter((q: any) => q.user_id === profile.id);
        const userResponses = (responses || []).filter((r: any) => r.user_id === profile.id);
        const link = (links || []).find((l: any) => l.user_id === profile.id);

        return {
          ...profile,
          responses: userResponses.length,
          quotes: userQuotes.length,
          won: userQuotes.filter((q: any) => q.status === 'won').length,
          lost: userQuotes.filter((q: any) => q.status === 'lost').length,
          noResponse: userQuotes.filter((q: any) => q.status === 'no_response').length,
          feedbackLink: link ? `${window.location.origin}/f/${link.slug}` : '',
        };
      });

      setRows(mapped);
      setLoading(false);
    }

    load();
  }, [router]);

  async function copy(text: string) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
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

      <div className="card">
        <div className="section-title">Users</div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: 12 }}>Company</th>
                <th style={{ padding: 12 }}>Email</th>
                <th style={{ padding: 12 }}>Responses</th>
                <th style={{ padding: 12 }}>Quotes</th>
                <th style={{ padding: 12 }}>Won</th>
                <th style={{ padding: 12 }}>Lost</th>
                <th style={{ padding: 12 }}>No Response</th>
                <th style={{ padding: 12 }}>Feedback Link</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: 12 }}>{row.company_name}</td>
                  <td style={{ padding: 12 }}>{row.email}</td>
                  <td style={{ padding: 12 }}>{row.responses}</td>
                  <td style={{ padding: 12 }}>{row.quotes}</td>
                  <td style={{ padding: 12 }}>{row.won}</td>
                  <td style={{ padding: 12 }}>{row.lost}</td>
                  <td style={{ padding: 12 }}>{row.noResponse}</td>
                  <td style={{ padding: 12 }}>
                    <button className="btn" onClick={() => copy(row.feedbackLink)}>Copy link</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
