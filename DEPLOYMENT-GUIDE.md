# 🚀 COMPLETE DEPLOYMENT GUIDE - 407.TENNIS

Your code is ready. Here's how to deploy everything in 3 steps.

---

## OVERVIEW

```
YOUR CODE FILES
    ↓
Step 1: Deploy Backend (Railway)
Step 2: Deploy Frontend (Vercel)
Step 3: Connect Domain (Cloudflare)
    ↓
LIVE AT: https://407.tennis ✅
```

---

## STEP 1: DEPLOY BACKEND (Railway)

### 1A: Create Railway Account
1. Go to: **https://railway.app**
2. Click: **Login**
3. Sign up with GitHub (easiest)
4. Authorize Railway

### 1B: Create New Project
1. Click: **New Project**
2. Click: **Deploy from GitHub**
3. Search for: your GitHub repo with code
4. Select: Your repository
5. Click: **Deploy**

### 1C: Set Environment Variables
1. In Railway, go to: **Variables**
2. Add these (copy from STEP1-env-template.txt):
   ```
   PORT=5000
   DATABASE_URL=postgresql://...  (see below)
   JWT_SECRET=your_secret_key_here
   STRIPE_SECRET_KEY=sk_test_xxx
   FRONTEND_URL=https://407.tennis
   NODE_ENV=production
   ```

### 1D: Set Up PostgreSQL Database
1. In Railway: Click **+ Add**
2. Select: **PostgreSQL**
3. Click: **Create**
4. Wait for it to start
5. Go to: **Data** tab
6. Copy connection string to `DATABASE_URL` above

### 1E: Run Database Schema
1. In PostgreSQL tab, click: **Connect**
2. Copy all SQL from STEP2-database-schema.sql
3. Paste into the SQL editor
4. Click: **Run**
5. Wait for tables to create ✅

### 1F: Get Your Backend URL
1. In Railway, go to: **Deployments**
2. Copy your Railway URL (looks like: `your-app-xyz.railway.app`)
3. **Save this** - you need it later!

✅ **Backend is now LIVE at: https://your-app-xyz.railway.app/api/health**

---

## STEP 2: DEPLOY FRONTEND (Vercel)

### 2A: Create Vercel Account
1. Go to: **https://vercel.com**
2. Click: **Sign Up**
3. Sign up with GitHub (easiest)
4. Authorize Vercel

### 2B: Import Project
1. Click: **Add New Project**
2. Select: **Import Git Repository**
3. Find your GitHub repo
4. Click: **Import**

### 2C: Set Environment Variables
1. In Vercel, go to: **Settings** → **Environment Variables**
2. Add these (copy from STEP3-env-template.txt):
   ```
   REACT_APP_API_URL=https://your-app-xyz.railway.app/api
   REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxx
   ```
3. Click: **Save**

### 2D: Deploy
1. Vercel will automatically start building
2. Wait 2-3 minutes for deployment
3. Click: **Visit** to see your live site

✅ **Frontend is now LIVE at: https://your-project.vercel.app**

---

## STEP 3: CONNECT YOUR DOMAIN (Cloudflare)

See: **CLOUDFLARE-DNS-SETUP.md** (detailed instructions)

Quick version:

### 3A: Add DNS Records in Cloudflare
1. Go to: **https://dash.cloudflare.com**
2. Click: **407.tennis**
3. Click: **DNS**
4. Add these records:

```
@ CNAME cname.vercel-dns.com (proxied)
api CNAME your-app-xyz.railway.app (proxied)
```

### 3B: Verify in Vercel
1. Go to: **https://vercel.com/dashboard**
2. Click your project
3. Click: **Settings** → **Domains**
4. Add: **407.tennis**
5. Vercel verifies automatically ✅

### 3C: Test
- https://407.tennis → Should load your app ✅
- https://api.407.tennis/api/health → Should show JSON ✅

---

## COMPLETE CHECKLIST

Backend:
- [ ] Railway account created
- [ ] GitHub repo connected
- [ ] PostgreSQL database created
- [ ] STEP2 schema imported
- [ ] Environment variables set
- [ ] Backend URL copied (like: backend-xyz.railway.app)

Frontend:
- [ ] Vercel account created
- [ ] GitHub repo connected
- [ ] Environment variables set
- [ ] Deploy successful
- [ ] Temporary URL works (your-project.vercel.app)

Domain:
- [ ] Cloudflare DNS records added
- [ ] Vercel domain verified
- [ ] https://407.tennis loads
- [ ] https://api.407.tennis/api/health returns JSON
- [ ] SSL certificate active (check URL bar 🔒)

---

## TEST YOUR APP

Once deployed:

1. **Sign Up**
   - Go to: https://407.tennis
   - Create account
   - Should work! ✅

2. **Search Players**
   - Click: Discover Players
   - Should load player list ✅

3. **Test Backend API**
   - Go to: https://api.407.tennis/api/health
   - Should show: `{"status":"ok","message":"407.Tennis backend is running"}` ✅

4. **Test Mobile**
   - Open on phone
   - Should be responsive ✅

---

## TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Backend won't deploy | Check Railway logs, verify env vars |
| Frontend shows error | Check REACT_APP_API_URL is correct |
| Domain won't work | Wait 10 mins, check DNS in Cloudflare |
| Can't login | Check backend is running, API URL correct |
| CSS not loading | Clear browser cache |
| Mobile broken | Make sure responsive CSS loaded |

---

## NEXT: GET STRIPE KEYS

For payments to work:

1. Go to: **https://stripe.com**
2. Click: **Sign Up**
3. Create account
4. Go to: **Developers** → **API Keys**
5. Copy:
   - Publishable Key: `pk_test_xxx`
   - Secret Key: `sk_test_xxx`
6. Add to your environment variables:
   - Railway: Backend environment
   - Vercel: Frontend environment

---

## FINAL CHECKLIST BEFORE LAUNCH

- [ ] App loads at https://407.tennis
- [ ] Backend API responds at https://api.407.tennis/api/health
- [ ] Login/signup works
- [ ] Can search players
- [ ] Can challenge someone
- [ ] Mobile responsive
- [ ] Payment flow works (test mode)
- [ ] SSL certificate shows (🔒 in URL bar)
- [ ] All environment variables set

---

## YOU'RE LIVE! 🎉

Your app is now:
✅ Online at https://407.tennis
✅ Running on your custom domain
✅ With secure HTTPS
✅ Ready for users!

Next: Start marketing! 🚀

---

## COST SO FAR

- Railway: Free first month (then ~$7/month)
- Vercel: Free
- Cloudflare: Already paid
- Stripe: Free (2.9% when you earn)
- **TOTAL: ~$7/month**

---

## NEED HELP?

If something breaks:
1. Check Railway logs
2. Check Vercel logs
3. Check Cloudflare DNS settings
4. Clear browser cache
5. Try incognito mode
6. Contact Railway/Vercel support
