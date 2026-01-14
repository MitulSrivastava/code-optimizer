# Deployment Guide - Code Sanitizer

This guide covers deploying the Code Sanitizer with a split architecture:
- **Frontend**: Vercel (Next.js)
- **Backend**: Render (Express API)

---

## 🚀 Part 1: Deploy Backend to Render

### Step 1: Prepare Backend Repository

Since Render needs the backend code separately, you have two options:

**Option A: Monorepo (Recommended)**
1. Push your entire project to GitHub
2. Render will build only the `/server` directory

**Option B: Separate Repo**
1. Create a new GitHub repo for backend
2. Copy `/server` contents to it
3. Push to GitHub

### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 3: Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your repository
3. Configure:
   ```
   Name: code-sanitizer-api
   Root Directory: server
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

4. Add Environment Variables:
   - `FRONTEND_URL` = `https://your-vercel-app.vercel.app` (fill this in Part 2)

5. Click "Create Web Service"
6. Wait for deployment (~5 minutes)
7. **Copy your Render URL**: `https://code-sanitizer-api.onrender.com`

---

## 🌐 Part 2: Deploy Frontend to Vercel

### Step 1: Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### Step 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "Add New Project"
4. Import your repository
5. Configure:
   ```
   Framework Preset: Next.js
   Root Directory: client
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

6. **Add Environment Variable**:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://code-sanitizer-api.onrender.com` (your Render URL from Part 1)

7. Click "Deploy"
8. Wait for deployment (~3 minutes)
9. **Copy your Vercel URL**: `https://code-sanitizer.vercel.app`

### Step 3: Update Render Backend

1. Go back to Render dashboard
2. Open your backend service
3. Go to "Environment"
4. Update `FRONTEND_URL` to your Vercel URL: `https://code-sanitizer.vercel.app`
5. Click "Save Changes"
6. Wait for automatic redeploy

---

## 🔧 Local Development

1. Create `/client/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

2. Start backend:
   ```bash
   cd server
   npm install
   npm start
   ```

3. Start frontend (in new terminal):
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. Open `http://localhost:3000`

---

## ✅ Verify Deployment

1. Visit your Vercel URL
2. Upload a test ZIP file
3. Verify optimization works
4. Check download works

---

## 📝 Important Notes

### Render Free Tier Limitations:
- ⏰ **Spins down after 15 minutes of inactivity**
- 🐌 **First request after sleep takes ~30 seconds**
- 💾 **File storage is ephemeral** (tracking database resets on each deploy)

### Upgrade Considerations:
If you need persistent storage and faster performance:
- Upgrade to **Render Paid Plan** ($7/month)
- Or use **Railway** (also has free tier with better specs)

---

## 🆘 Troubleshooting

### CORS Errors:
- Make sure `FRONTEND_URL` on Render matches your Vercel URL exactly
- Redeploy backend after changing environment variables

### API Not Responding:
- Wait 30 seconds (cold start)
- Check Render logs for errors
- Verify environment variables are set

### Build Failures:
- Ensure Node version is 18+ (set in package.json engines)
- Check build logs in Render/Vercel dashboard

---

## 🔄 Future Deployments

### Update Frontend:
- Just push to GitHub
- Vercel auto-deploys on every push to main branch

### Update Backend:
- Push to GitHub
- Render auto-deploys on every push to main branch

---

**Your app is now live! 🎉**
