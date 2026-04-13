# Deployment Guide

## Pre-Deployment Checklist

- [x] Build test passed (`npm run build` in frontend)
- [x] CORS configured for production domains
- [x] Environment variables documented
- [x] .gitignore files created
- [ ] Update `frontend/.env.production` with actual backend URL
- [ ] Test API endpoints work in production

## Quick Deploy (Recommended)

### 1. Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ghp-index-backend` (or your choice)
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click "Create Web Service"
6. **Copy the deployed URL** (e.g., `https://ghp-index-backend.onrender.com`)

### 2. Update Frontend Environment

1. Edit `frontend/.env.production`:
   ```bash
   API_URL=https://your-backend-url.onrender.com
   ```
   Replace with your actual Render URL from step 1.6

### 3. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: (leave default)
5. Add Environment Variable:
   - **Name**: `API_URL`
   - **Value**: Your Render backend URL
6. Click "Deploy"
7. Visit your deployed site!

### 4. Update Backend CORS (if needed)

If you use a custom domain, update `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
        "https://your-custom-domain.com",  # Add your domain here
    ],
    # ...
)
```

Then redeploy the backend on Render (it will auto-deploy if connected to GitHub).

## Environment Variables

### Frontend (.env.production)
- `API_URL` - Backend API URL (e.g., `https://ghp-index-backend.onrender.com`)

### Backend
No environment variables required currently.

## Monitoring & Maintenance

### Vercel (Frontend)
- Dashboard: [vercel.com/dashboard](https://vercel.com/dashboard)
- View logs, analytics, and deployment history
- Auto-deploys on every git push to main branch

### Render (Backend)
- Dashboard: [dashboard.render.com](https://dashboard.render.com)
- View logs and service health
- Auto-deploys on every git push to main branch
- **Note**: Free tier services may spin down after inactivity (takes ~30s to wake up)

## Troubleshooting

### Frontend can't connect to Backend
1. Check `API_URL` in Vercel environment variables
2. Verify backend is running on Render
3. Check CORS settings in `backend/main.py`
4. Check browser console for CORS errors

### Backend 404 errors
1. Verify the API endpoint exists in `backend/main.py`
2. Check Render logs for errors
3. Ensure `uvicorn` is starting correctly

### Slow initial load
- Render free tier services sleep after inactivity
- First request may take ~30 seconds
- Subsequent requests will be fast
- Consider upgrading to paid tier for always-on service

## Cost Estimate

**Free Tier (Both platforms):**
- Vercel: Unlimited personal projects, 100 GB bandwidth/month
- Render: 750 hours/month (one service 24/7), sleeps after inactivity

**Total: $0/month** with free tiers!

## Alternative Deployment Options

See main README for Docker, Railway, and other deployment methods.
