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

      {/* Dashboard Preview */}
      <section className="w-full px-6 pb-20">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-10">
            <p className="text-purple-400 text-sm tracking-[0.25em] uppercase mb-3">
              Dashboard Preview
            </p>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              See exactly why you’re losing work
            </h2>

            <p className="text-slate-300 max-w-2xl mx-auto text-lg">
              Anonymous customer feedback transformed into clear commercial insights.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>

            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1020]/90 shadow-2xl">

              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4 bg-black/20">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>

                <div className="ml-4 text-sm text-slate-400">
                  clearquote.uk/dashboard
                </div>
              </div>

              <div className="p-5 md:p-8">

                <div className="grid md:grid-cols-3 gap-4 mb-5">

                  <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
                    <p className="text-slate-400 text-sm mb-2">
                      Recoverable Work
                    </p>

                    <p className="text-3xl font-bold text-white">
                      £2,340
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
                    <p className="text-slate-400 text-sm mb-2">
                      Fixable Quotes
                    </p>

                    <p className="text-3xl font-bold text-white">
                      62%
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
                    <p className="text-slate-400 text-sm mb-2">
                      Responses This Month
                    </p>

                    <p className="text-3xl font-bold text-white">
                      18
                    </p>
                  </div>

                </div>

                <div className="grid md:grid-cols-2 gap-5">

                  <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
                    <p className="text-white font-semibold mb-5">
                      Why quotes were lost
                    </p>

                    <div className="space-y-4">

                      <div>
                        <div className="flex justify-between text-sm text-slate-300 mb-2">
                          <span>Response speed</span>
                          <span>42%</span>
                        </div>

                        <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full w-[42%] bg-purple-500 rounded-full"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-slate-300 mb-2">
                          <span>Price</span>
                          <span>31%</span>
                        </div>

                        <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full w-[31%] bg-purple-500 rounded-full"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-slate-300 mb-2">
                          <span>Trust / clarity</span>
                          <span>18%</span>
                        </div>

                        <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full w-[18%] bg-purple-500 rounded-full"></div>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
                    <p className="text-white font-semibold mb-4">
                      Feedback Link
                    </p>

                    <div className="rounded-xl border border-white/10 bg-black/30 p-4 flex items-center justify-between gap-4">
                      <span className="text-slate-300 text-sm truncate">
                        clearquote.uk/f/abc123
                      </span>

                      <button className="rounded-lg bg-purple-600 px-4 py-2 text-white text-sm">
                        Copy
                      </button>
                    </div>

                    <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-slate-400 text-sm mb-2">
                        Latest insight
                      </p>

                      <p className="text-white">
                        Customers mentioned slow response times more than price this week.
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

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
