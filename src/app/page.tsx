import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="page">
      <nav className="nav">
        <div className="logo">ClearQuote</div>
        <div className="nav-links">
          <Link className="btn" href="/login">Log in</Link>
          <Link className="btn primary" href="/signup">Start free</Link>
        </div>
      </nav>

      <section className="card hero">
        <div className="eyebrow">For plumbers and trades</div>
        <h1>Find out why quotes don’t convert.</h1>
        <p className="sub">ClearQuote gives trades a simple feedback link customers can answer anonymously in 20 seconds, then turns the replies into clear actions.</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          <Link className="btn primary" href="/signup">Create your dashboard</Link>
          <Link className="btn" href="/login">I already have an account</Link>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="card">
          <div className="section-title">What it shows</div>
          <div className="actions">
            <div className="action"><span className="check">✓</span><span>Why customers chose someone else.</span></div>
            <div className="action"><span className="check">✓</span><span>What could have improved the quote.</span></div>
            <div className="action"><span className="check">✓</span><span>How much work may be recoverable.</span></div>
          </div>
        </div>
        <div className="card">
          <div className="section-title">How it works</div>
          <div className="actions">
            <div className="action"><span className="check">1</span><span>Send your feedback link after a lost quote.</span></div>
            <div className="action"><span className="check">2</span><span>Customer answers 4 anonymous questions.</span></div>
            <div className="action"><span className="check">3</span><span>You see the pattern in your dashboard.</span></div>
          </div>
        </div>
      </section>
    </main>
  );
}
