'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push('/dashboard');
  }

  return (
    <main className="mobile-wrap">
      <header className="header">
        <div className="eyebrow">Welcome back</div>
        <h1>Log in to ClearQuote</h1>
      </header>

      <form className="card form" onSubmit={handleLogin}>
        <label>
          <div className="label">Email</div>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          <div className="label">Password</div>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn primary" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
        <p className="body-text">New here? <Link className="accent" href="/signup">Create an account</Link></p>
      </form>
    </main>
  );
}
