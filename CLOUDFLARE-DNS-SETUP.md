# 🌐 CLOUDFLARE DNS SETUP FOR 407.TENNIS

## WHAT YOU NEED TO DO

Your domain is registered at Cloudflare. Perfect! Here's how to connect it to your deployed app.

---

## STEP 1: BEFORE YOU START

You need:
- ✅ Backend deployed (Railway/Heroku) → Get URL like `backend-xyz.railway.app`
- ✅ Frontend deployed (Vercel) → Vercel will auto-configure
- ✅ Access to Cloudflare dashboard

---

## STEP 2: LOGIN TO CLOUDFLARE

1. Go to: **https://dash.cloudflare.com**
2. Login with your account
3. Click your domain: **407.tennis**

---

## STEP 3: SET UP DNS RECORDS

Click **DNS** in the left sidebar.

### Record 1: Frontend (Main Domain)
```
Type: CNAME
Name: @ (root domain)
Target: cname.vercel-dns.com
TTL: Auto
Proxy: Proxied (orange cloud)
```
Click Save ✅

### Record 2: API Subdomain  
```
Type: CNAME
Name: api
Target: [your-backend-url.railway.app]
TTL: Auto
Proxy: Proxied (orange cloud)
```
Click Save ✅

### Record 3: Email (Optional)
```
Type: MX
Name: @
Priority: 10
Mail Server: aspmx.l.google.com
TTL: Auto
Proxy: Not Proxied (gray cloud)
```
Click Save ✅

---

## STEP 4: CONNECT VERCEL TO DOMAIN

1. Go to: **https://vercel.com/dashboard**
2. Click your project
3. Click: **Settings**
4. Click: **Domains**
5. Click: **Add Domain**
6. Enter: **407.tennis**
7. Click: **Add**

Vercel will verify instantly ✅

---

## STEP 5: TEST YOUR DOMAIN

| Test | URL | Expected Result |
|------|-----|-----------------|
| Frontend | https://407.tennis | Tennis app loads |
| Backend | https://api.407.tennis/api/health | Shows JSON response |
| DNS | https://dnschecker.org | All green ✅ |

---

## STEP 6: SSL/HTTPS

Cloudflare provides FREE SSL certificate automatically!

Check:
1. In Cloudflare, click: **SSL/TLS**
2. Verify: **Full (Strict)** mode is enabled
3. Universal SSL should be **Active ✅**

---

## TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Domain shows error | Wait 10 mins for DNS to propagate |
| Backend API not working | Check backend URL in DNS is correct |
| Frontend won't load | Verify Vercel domain is added |
| SSL warning | Wait 30 mins for certificate to activate |

---

## FINAL DNS RECORDS (What You Should See)

```
@ CNAME cname.vercel-dns.com ✓ OK Proxied
api CNAME your-backend.railway.app ✓ OK Proxied
@ MX aspmx.l.google.com ✓ OK Not Proxied
```

---

## YOU'RE DONE! 🎉

✅ Frontend: https://407.tennis
✅ Backend: https://api.407.tennis
✅ SSL/HTTPS: Enabled
✅ Domain: Configured

Your app is now live at your custom domain!
