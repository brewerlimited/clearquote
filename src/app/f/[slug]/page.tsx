'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type LinkRow = { id: string; user_id: string; slug: string; profiles?: { company_name: string } };

const q1 = ["Price was too high", "Someone else responded faster", "I trusted someone else more", "Quote wasn’t clear", "Job didn’t go ahead"];
const q2 = ["Price", "Speed", "Trust / confidence", "Communication", "Reviews", "Availability"];
const q3 = ["Lower price", "Faster response", "Clearer explanation", "More confidence / reassurance", "Nothing — it was fine"];

export default function FeedbackPage({ params }: { params: { slug: string } }) {
  const [link, setLink] = useState<LinkRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ q1_reason: '', q2_priority: '', q3_improve: '', q4_other: '' });

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('feedback_links')
        .select('id,user_id,slug')
        .eq('slug', params.slug)
        .single();
      if (error) setError('This feedback link could not be found.');
      setLink(data);
      setLoading(false);
    }
    load();
  }, [params.slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!link) return;
    setError('');
    const { error } = await supabase.from('feedback_responses').insert({
      user_id: link.user_id,
      link_id: link.id,
      ...form
    });
    if (error) return setError(error.message);
    setSubmitted(true);
  }

  if (loading) return <main className="mobile-wrap"><p className="body-text">Loading...</p></main>;

  if (submitted) {
    return (
      <main className="mobile-wrap">
        <section className="card hero" style={{ marginTop: 26 }}>
          <div className="eyebrow">Thank you</div>
          <h1>Feedback submitted</h1>
          <p className="sub">Your response was anonymous and helps improve future quotes.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mobile-wrap">
      <header className="header">
        <div className="eyebrow">No personal details required</div>
        <h1>Quick anonymous feedback</h1>
        <p className="sub">This takes about 20 seconds and helps improve future quotes.</p>
      </header>

      {error && <section className="card"><p className="error">{error}</p></section>}

      {link && <form className="card form" onSubmit={submit}>
        <label>
          <div className="label">Why didn’t you go ahead with this quote?</div>
          <select className="select" required value={form.q1_reason} onChange={(e) => setForm({ ...form, q1_reason: e.target.value })}>
            <option value="">Choose one</option>{q1.map(x => <option key={x}>{x}</option>)}
          </select>
        </label>
        <label>
          <div className="label">What mattered most when choosing?</div>
          <select className="select" required value={form.q2_priority} onChange={(e) => setForm({ ...form, q2_priority: e.target.value })}>
            <option value="">Choose one</option>{q2.map(x => <option key={x}>{x}</option>)}
          </select>
        </label>
        <label>
          <div className="label">What could have improved this quote the most?</div>
          <select className="select" required value={form.q3_improve} onChange={(e) => setForm({ ...form, q3_improve: e.target.value })}>
            <option value="">Choose one</option>{q3.map(x => <option key={x}>{x}</option>)}
          </select>
        </label>
        <label>
          <div className="label">Anything else you’d like to add? (optional)</div>
          <textarea className="textarea" value={form.q4_other} onChange={(e) => setForm({ ...form, q4_other: e.target.value })} />
        </label>
        <button className="btn primary">Submit anonymous feedback</button>
      </form>}
    </main>
  );
}
