'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { company_name: companyName || 'Your company' } }
    });

    setLoading(false);
    if (error) return setError(error.message);
    router.push('/dashboard');
  }

  return (
    <main className="mobile-wrap">
      <header className="header">
        <div className="eyebrow">Create account</div>
        <h1>Start your ClearQuote dashboard</h1>
      </header>

      <form className="card form" onSubmit={handleSignup}>
        <label>
          <div className="label">Company name</div>
          <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ABC Plumbing" />
        </label>
        <label>
          <div className="label">Email</div>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          <div className="label">Password</div>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn primary" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        <p className="body-text">Already got an account? <Link className="accent" href="/login">Log in</Link></p>
      </form>
    </main>
  );
}
