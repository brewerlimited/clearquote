import Link from 'next/link';

type SeededBar = { label: string; count: number; pct: number };

const seededStats = {
  total: 18,
  fixableCount: 11,
  fixablePct: 62,
  low: 1800,
  high: 3200,
  last: '20 Jan',
  topReason: 'Response speed',
  priority: 'Speed',
  biggestMissedWin: 'Faster response',
  competitiveStrength: 'Trust / confidence',
  quotesLogged: 22,
  quotesWon: 10,
  quotesLost: 7,
  quotesNoResponse: 5,
  quotesOpen: 7,
  conversionRate: 45,
  wonValue: 6400,
  openValue: 3850,
  reasons: [
    { label: 'Response speed', count: 8, pct: 42 },
    { label: 'Price', count: 6, pct: 31 },
    { label: 'Trust / clarity', count: 3, pct: 18 },
    { label: 'Job didn’t go ahead', count: 1, pct: 9 }
  ],
  priorities: [
    { label: 'Speed', count: 7, pct: 39 },
    { label: 'Price', count: 5, pct: 28 },
    { label: 'Trust / confidence', count: 4, pct: 22 },
    { label: 'Communication', count: 2, pct: 11 }
  ],
  improvements: [
    { label: 'Faster response', count: 8, pct: 44 },
    { label: 'Clearer explanation', count: 5, pct: 28 },
    { label: 'More reassurance', count: 3, pct: 17 },
    { label: 'Lower price', count: 2, pct: 11 }
  ]
};

function Bars({ data }: { data: SeededBar[] }) {
  return (
    <div className="bars">
      {data.map((item) => (
        <div className="bar-row" key={item.label}>
          <div className="bar-meta">
            <span>{item.label}</span>
            <span>{item.pct}%</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${item.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SeededDashboardExample() {
  const stats = seededStats;
  const feedbackUrl = 'https://clearquote.uk/f/abc123';

  return (
    <section className="card wide dashboard-example-card">
      <div className="example-header">
        <div>
          <div className="eyebrow">Dashboard example</div>
          <h2>This is what your dashboard looks like</h2>
          <p className="sub">Seeded example data showing the same ClearQuote dashboard users get after collecting feedback.</p>
        </div>
        <span className="example-pill">Seeded data</span>
      </div>

      <div className="example-frame">
        <nav className="nav">
          <div className="logo">ClearQuote</div>
          <div className="nav-links">
            <span className="btn">Quotes</span>
            <span className="btn">Settings</span>
            <span className="btn">Sign out</span>
          </div>
        </nav>

        <header className="header">
          <div className="eyebrow">ABC Plumbing Ltd</div>
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

        <section className="card wide feedback-loop-card">
          <div className="section-title">Start collecting feedback</div>
          <p className="body-text" style={{ marginBottom: 12 }}>Send this after quotes that don’t go ahead. The more this link is used, the clearer your quote-winning insight becomes.</p>
          <div className="copy-row">
            <input
              className="copy-input"
              value={feedbackUrl}
              readOnly
              aria-label="Customer feedback link example"
            />
            <button className="btn primary copy-btn" type="button">
              Copy link
            </button>
          </div>
          <div className="feedback-actions">
            <span className="btn whatsapp-btn">Share via WhatsApp</span>
            <span className="feedback-count">{stats.total} feedback responses this month</span>
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
            <span className="btn primary" style={{ marginTop: 14 }}>Add or update quotes</span>
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
          <div className="card">
            <div className="section-title">Why you’re losing quotes</div>
            <Bars data={stats.reasons} />
            <p className="chart-takeaway">Most lost quotes are currently linked to {stats.topReason.toLowerCase()}.</p>
          </div>
          <div className="card">
            <div className="section-title">What customers care about</div>
            <Bars data={stats.priorities} />
            <p className="chart-takeaway">Customers are mainly choosing based on {stats.priority.toLowerCase()}.</p>
          </div>
          <div className="card">
            <div className="section-title">What could have improved the quote</div>
            <Bars data={stats.improvements} />
            <p className="chart-takeaway">The strongest improvement signal is {stats.biggestMissedWin.toLowerCase()}.</p>
          </div>
          <div className="card">
            <div className="section-title">Quote tracking link</div>
            <p className="body-text">Log sent, won, lost and no-response quotes so ClearQuote can compare feedback against actual conversion.</p>
            <span className="btn primary" style={{ marginTop: 14 }}>Open quote tracker</span>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="card">
            <div className="section-title">Anonymous customer comments</div>
            <div className="comment">Good price, but another company replied quicker.<div className="comment-date">20 Jan</div></div>
            <div className="comment">I wasn’t sure what was included in the quote.<div className="comment-date">19 Jan</div></div>
            <div className="comment">Went with someone who could start sooner.<div className="comment-date">18 Jan</div></div>
          </div>
          <div className="card">
            <div className="section-title">This month’s summary</div>
            <p className="body-text">You received {stats.total} feedback responses and logged {stats.quotesLogged} quotes this month. {stats.fixableCount} feedback responses were potentially fixable. Conversion is currently {stats.conversionRate}%, with £{stats.openValue.toLocaleString()} still open or unanswered.</p>
          </div>
        </section>
      </div>
    </section>
  );
}
