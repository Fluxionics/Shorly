# 🔗 Shorly — Smart Link Shortener
### Built by Fluxionics

> Shorten links. Track everything. Earn with ads.

---

## 📦 What's included

- **Landing page** with link shortener, features, and pricing
- **Auth system** (email + Google login via Supabase)
- **Dashboard** to manage all your links
- **Analytics** — clicks over time, devices, countries, referrers
- **Ad redirect page** — 5-second countdown with ad slot (free plan)
- **Free vs Pro plan** enforcement
- **API routes** for creating links and tracking clicks

---

## 🚀 Step-by-Step Setup

### Step 1 — Download & push to GitHub

1. Extract this project folder
2. Open terminal inside the folder
3. Run:
```bash
git init
git add .
git commit -m "Initial Shorly setup"
```
4. Go to **github.com** → New repository → name it `shorly`
5. Run:
```bash
git remote add origin https://github.com/YOUR_USERNAME/shorly.git
git push -u origin main
```

---

### Step 2 — Set up Supabase

1. Go to **supabase.com** → New project
2. Name it `shorly`, choose a password, pick a region
3. Once created, go to **SQL Editor** (left sidebar)
4. Open `schema.sql` from this project and **paste it all** → click Run
5. Go to **Settings → API** and copy:
   - `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

**Enable Google Auth (optional but recommended):**
1. In Supabase → Authentication → Providers → Google
2. Follow instructions to create Google OAuth credentials
3. Paste Client ID and Secret

---

### Step 3 — Deploy to Vercel

1. Go to **vercel.com** → New Project → Import from GitHub
2. Select your `shorly` repository
3. In **Environment Variables**, add ALL these:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase Settings → API (keep secret!) |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL (e.g. `https://shorly.vercel.app`) |

4. Click **Deploy** → wait ~2 minutes
5. Your site is LIVE! 🎉

---

### Step 4 — Enable Google Ads (start earning 💰)

1. Go to **google.com/adsense** → Create account
2. Submit your Vercel URL for review (takes 1-7 days for approval)
3. Once approved, get your **Publisher ID** (looks like `ca-pub-XXXXXXXXXXXXXXXX`)
4. Open `pages/[slug].tsx` and find the comment `INSERT GOOGLE ADSENSE CODE HERE`
5. Replace the placeholder div with your AdSense code:
```html
<ins className="adsbygoogle"
  style={{ display: 'block' }}
  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
  data-ad-slot="YOUR_AD_SLOT_ID"
  data-ad-format="auto"
  data-full-width-responsive="true" />
```
6. Also add to `pages/_document.tsx` inside `<Head>`:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous"></script>
```

---

### Step 5 — Set up Stripe for Pro plans (optional)

1. Go to **dashboard.stripe.com** → Create account
2. Products → Add product → "Shorly Pro" → $7/month recurring
3. Copy the Price ID → `STRIPE_PRO_PRICE_ID`
4. Developers → API Keys → copy Secret Key → `STRIPE_SECRET_KEY`
5. Add all to Vercel environment variables
6. Redeploy

---

## 💰 How you earn money

### From ads (FREE plan users):
- Every time a FREE user shares a link, the visitor sees a 5-second ad before redirecting
- You earn ~$0.001 to $0.01 per click depending on geography and topic
- **Example:** 10,000 clicks/month = ~$10-100/month from ads alone

### From Pro subscriptions:
- Pro: $7/month → you keep ~$6.65 after Stripe fees (2.9% + $0.30)
- Business: $24/month → you keep ~$23.00
- **Example:** 100 Pro users = ~$665/month recurring

### Growth strategy:
1. Share on Reddit (r/SideProject, r/entrepreneur)
2. Post on Twitter/X with #buildinpublic hashtag
3. Write a blog post about building it
4. Submit to ProductHunt
5. Create YouTube tutorial showing how to use it

---

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env.local
# Fill in your values from Supabase

# Run dev server
npm run dev
# Open http://localhost:3000
```

---

## 📁 File Structure

```
shorly/
├── pages/
│   ├── index.tsx          # Landing page
│   ├── auth.tsx           # Login/signup
│   ├── dashboard.tsx      # User dashboard
│   ├── [slug].tsx         # Link redirect + ads
│   ├── analytics/[id].tsx # Link analytics
│   └── api/
│       └── links/
│           ├── create.ts  # Create short link
│           └── track.ts   # Track clicks
├── lib/
│   ├── supabase.ts        # Database client
│   └── utils.ts           # Helpers
├── styles/
│   └── globals.css        # Global styles
├── schema.sql             # Database schema (run in Supabase)
└── .env.example           # Environment variables template
```

---

## 🛠 Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| Frontend | Next.js 14 | Fast, SEO-friendly, great DX |
| Auth | Supabase Auth | Free, supports Google login |
| Database | Supabase (PostgreSQL) | Free up to 500MB |
| Hosting | Vercel | Free, instant deploys |
| Ads | Google AdSense | Most widely used ad platform |
| Payments | Stripe | Industry standard |

---

## ⚡ Features by Plan

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| Links/month | 50 | Unlimited | Unlimited |
| Analytics history | 7 days | 1 year | 1 year |
| Custom slugs | ❌ | ✅ | ✅ |
| Password protection | ❌ | ✅ | ✅ |
| Link expiration | ❌ | ✅ | ✅ |
| QR codes | ✅ | ✅ | ✅ |
| No ads | ❌ | ✅ | ✅ |
| API access | ❌ | ❌ | ✅ |
| Team members | ❌ | ❌ | 5 |
| Export CSV | ❌ | ✅ | ✅ |

---

Built with ❤️ by **Fluxionics**
