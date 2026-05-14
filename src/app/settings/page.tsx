'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Profile = { id: string; company_name: string; average_quote_value: number };
type FeedbackLink = { slug: string };

function buildFeedbackUrl(slug: string, origin: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  const baseUrl = configuredUrl || origin;
  return `${baseUrl}/f/${slug}`;
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [link, setLink] = useState<FeedbackLink | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [averageQuoteValue, setAverageQuoteValue] = useState('300');
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState('Copy link');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);

    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return router.push('/login');

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: linkData } = await supabase.from('feedback_links').select('slug').eq('user_id', user.id).single();

      setProfile(profileData);
      setLink(linkData);
      setCompanyName(profileData?.company_name || '');
      setAverageQuoteValue(String(profileData?.average_quote_value || 300));
    }

    load();
  }, [router]);

  const feedbackUrl = useMemo(() => {
    if (!link?.slug) return '';
    return buildFeedbackUrl(link.slug, origin);
  }, [link?.slug, origin]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setError('');
    setSaved('');

    const { error } = await supabase
      .from('profiles')
      .update({ company_name: companyName, average_quote_value: Number(averageQuoteValue || 0) })
      .eq('id', profile.id);

    if (error) return setError(error.message);
    setSaved('Saved');
  }

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

  return (
    <main className="mobile-wrap">
      <nav className="nav">
        <div className="logo">ClearQuote</div>
        <Link className="btn" href="/dashboard">Dashboard</Link>
      </nav>

      <header className="header">
        <div className="eyebrow">Settings</div>
        <h1>Your quote feedback setup</h1>
      </header>

      <form className="card form" onSubmit={saveSettings}>
        <label>
          <div className="label">Company name</div>
          <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </label>

        <label>
          <div className="label">Average quote value (£)</div>
          <input className="input" type="number" value={averageQuoteValue} onChange={(e) => setAverageQuoteValue(e.target.value)} />
        </label>

        {error && <p className="error">{error}</p>}
        {saved && <p className="success">{saved}</p>}

        <button className="btn primary">Save settings</button>
      </form>

      <section className="card">
        <div className="section-title">Your customer feedback link</div>
        <p className="body-text" style={{ marginBottom: 10 }}>Send this after quotes that don’t go ahead.</p>

        <div className="copy-row">
          <input
            className="copy-input"
            value={feedbackUrl || 'Loading...'}
            readOnly
            onClick={(e) => e.currentTarget.select()}
            aria-label="Customer feedback link"
          />
          <button className="btn primary copy-btn" type="button" onClick={copyFeedbackLink} disabled={!feedbackUrl}>
            {copyStatus}
          </button>
        </div>

        <p className="helper-text">Tip: customers do not need an account and feedback stays anonymous.</p>
      </section>
    </main>
  );
}
