# ClearQuote V1

A mobile-first Next.js + Supabase app for anonymous quote feedback.

## Project structure

The main editable code now lives inside `src/`:

```text
src/app        Next.js pages, routes and global CSS
src/lib        Supabase client/helper code
supabase       SQL schema
```

`node_modules` and `.next` are generated locally and should **not** be zipped or sent back for amendments.

## Includes

- Landing page
- Signup/login using Supabase Auth
- Logged-in dashboard
- Public anonymous feedback form at `/f/[slug]`
- Settings page with company name, average quote value and copyable feedback link
- Supabase SQL schema with RLS policies
- Dark blue/purple ClearQuote theme

## Setup

1. Create a Supabase project.
2. Open Supabase SQL Editor and run `supabase/schema.sql`.
3. Copy `.env.example` to `.env.local`.
4. Add your Supabase URL and anon key.
5. Install and run:

```bash
npm install
npm run dev
```

6. Go to `http://localhost:3000/signup` and create an account.
7. Open `/settings` to copy your feedback link.
8. Submit test feedback through that link.
9. Return to `/dashboard` to see live stats.

## Future amendment zip

When sending the project back for amendments, zip only the source/config files, not dependencies:

```bash
zip -r clearquote-source.zip src supabase package.json package-lock.json tsconfig.json README.md .env.example .gitignore
```

## Deploy

Deploy to Vercel and add these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Notes

This is intentionally lean. Billing, team accounts, AI summaries and benchmarks are not included in V1.
