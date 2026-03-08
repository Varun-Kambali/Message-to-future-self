# Future Self Messenger — Deployment Guide

Everything you need to go from zero to live in about 30 minutes.

---

## What you'll end up with

- A live app at `https://your-app.vercel.app`
- Email + Google authentication
- Text / audio / video capsules stored in Supabase
- Hourly cron that automatically delivers due capsules
- Beautiful delivery email via Resend

---

## 1. Supabase setup (5 min)

1. Go to https://supabase.com → **New project**
2. Give it a name, choose a region close to you, set a strong DB password → **Create project**
3. Wait ~2 minutes for it to provision

### Run the schema

4. In the Supabase dashboard → **SQL Editor** → paste the entire contents of `supabase/schema.sql` → **Run**

   This creates:
   - `profiles` table (extends auth.users)
   - `capsules` table with RLS
   - Trigger that auto-creates a profile on sign-up
   - Storage buckets: `capsule-media`, `seal-art`, `cover-images`

### Get your keys

5. Dashboard → **Settings** → **API**
   - Copy **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon / public key** → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy **service_role key** → this is `SUPABASE_SERVICE_KEY` (never expose to browser)

### Enable Google OAuth (optional but recommended)

6. Dashboard → **Authentication** → **Providers** → **Google**
7. Toggle **Enable Google provider**
8. You need a Google OAuth Client ID and Secret from https://console.cloud.google.com
   - Create a project → APIs & Services → Credentials → Create OAuth 2.0 Client ID
   - Authorised redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
9. Paste Client ID and Secret into Supabase → **Save**

---

## 2. Resend setup for emails (3 min)

1. Go to https://resend.com → create a free account (3,000 emails/month free)
2. **API Keys** → **Create API Key** → copy it → this is `RESEND_API_KEY`
3. **Domains** → add your domain and verify DNS (or use Resend's shared domain for testing)
4. Set `FROM_EMAIL` to `noreply@yourdomain.com`

> **Skip email entirely?** That's fine — the app works without it. Just leave `RESEND_API_KEY` empty. Capsules will still be delivered in-app.

---

## 3. Local development (5 min)

```bash
# Clone / copy this project, then:
cd future-self-messenger

npm install

cp .env.example .env.local
# Fill in the values from steps 1 and 2
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=re_xxxx          # optional
FROM_EMAIL=noreply@yourdomain.com
CRON_SECRET=any-random-string-here
```

```bash
npm run dev
# Open http://localhost:3000
```

---

## 4. GitHub setup (2 min)

```bash
git init
git add .
git commit -m "initial commit"
```

Create a new repo on https://github.com → push to it:
```bash
git remote add origin https://github.com/YOUR_USERNAME/future-self-messenger.git
git branch -M main
git push -u origin main
```

---

## 5. Vercel deployment (5 min)

1. Go to https://vercel.com → **Add New Project**
2. Import your GitHub repo
3. Framework preset: **Next.js** (auto-detected)
4. Click **Environment Variables** and add all 6 variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |
| `SUPABASE_SERVICE_KEY` | Your service role key |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `RESEND_API_KEY` | Your Resend key (or leave blank) |
| `FROM_EMAIL` | noreply@yourdomain.com |
| `CRON_SECRET` | A random 32-char string (`openssl rand -hex 32`) |

5. Click **Deploy** → wait ~90 seconds

---

## 6. Post-deployment wiring

### Add your Vercel URL to Supabase Auth

1. Supabase dashboard → **Authentication** → **URL Configuration**
2. **Site URL**: `https://your-app.vercel.app`
3. **Redirect URLs**: add `https://your-app.vercel.app/auth/callback`
4. Save

### Verify the cron job

The `vercel.json` file already schedules the cron to run hourly. To test it manually:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://your-app.vercel.app/api/cron/deliver
```

Expected response:
```json
{"ok":true,"delivered":0,"message":"No capsules due."}
```

---

## 7. Test end-to-end

1. Sign up at your live URL
2. Create a text capsule with delivery 1 month away
3. To test delivery immediately, run this SQL in Supabase SQL Editor:
   ```sql
   -- Force a capsule to be due now (for testing)
   UPDATE capsules SET delivery_at = NOW() - interval '1 minute' WHERE status = 'sealed' LIMIT 1;
   ```
4. Hit the cron endpoint manually (see above)
5. Refresh your journal — the capsule should show as delivered ✓

---

## Free tier limits to be aware of

| Service | Limit | Notes |
|---------|-------|-------|
| Supabase DB | 500 MB | Plenty for thousands of capsules |
| Supabase Storage | 1 GB | ~200 audio clips or ~50 videos |
| Supabase Auth | 50,000 MAU | More than enough |
| Vercel Hobby | 100 GB bandwidth/month | Very generous |
| Vercel Cron | Hourly | Delivery accuracy: ±1 hour |
| Resend | 3,000 emails/month | Falls back to in-app only if exceeded |

---

## Custom domain (optional)

1. Vercel dashboard → your project → **Settings** → **Domains**
2. Add your domain → follow DNS instructions
3. Update `NEXT_PUBLIC_APP_URL` env var to your custom domain
4. Update Supabase redirect URLs to include your custom domain

---

## That's it

Your app is live. Every hour, Vercel checks for due capsules and delivers them.
Users get a beautiful email + can read in-app. New entries seal instantly.
