# 🚀 Real-Time Notification System - Multi-Platform Deployment Guide

This guide covers deploying your full-stack real-time notification system to various free hosting platforms.

## 🎯 Quick Deploy Options

### Option 1: Railway (Recommended) 🚂
**Best for**: Full-stack apps with databases and real-time features
**Free tier**: 512MB RAM, $5 credit/month

#### Steps:
1. **Create Railway account**: https://railway.app
2. **Deploy via GitHub**:
   ```bash
   # Push to GitHub first
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```
3. **In Railway Dashboard**:
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect and deploy both services

4. **Add Database Services**:
   - Add PostgreSQL: Click "+ Add Service" → "PostgreSQL"
   - Add Redis: Click "+ Add Service" → "Redis"

5. **Configure Environment Variables**:
   **Backend Service**:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   FRONTEND_URL=${{frontend.url}}
   ```
   
   **Frontend Service**:
   ```
   NEXT_PUBLIC_API_URL=${{backend.url}}
   ```

6. **Access your app**: Railway provides URLs for both services

---

### Option 2: Render.com 🎨
**Best for**: Full-stack apps with good database support
**Free tier**: 512MB RAM, shared CPU, sleeps after 15min inactivity

#### Steps:
1. **Create Render account**: https://render.com
2. **Use the included render.yaml**:
   - Push to GitHub with the `render.yaml` file
   - In Render dashboard: "New" → "Blueprint"
   - Connect your repository
   - Render will deploy everything automatically

3. **Manual Setup Alternative**:
   - **Backend**: New Web Service → Connect repo → Build: `cd backend && npm install && npx prisma generate && npm run build`
   - **Frontend**: New Static Site → Connect repo → Build: `cd frontend && npm install && npm run build`
   - **Database**: New PostgreSQL instance
   - **Redis**: New Redis instance

---

### Option 3: Vercel + Railway/Supabase 🔥
**Best for**: Optimal frontend performance with separate backend

#### Steps:
1. **Deploy Frontend to Vercel**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # From your project root
   cd frontend
   vercel
   
   # Set environment variable
   vercel env add NEXT_PUBLIC_API_URL
   # Enter your backend URL when prompted
   ```

2. **Deploy Backend to Railway** (see Option 1 backend steps)

3. **Configure Environment**:
   - Vercel: `NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app`
   - Railway: `FRONTEND_URL=https://your-frontend.vercel.app`

---

### Option 4: Heroku (If you have access) 🟪
**Note**: Heroku removed free tier but still worth mentioning

#### Setup:
```bash
# Install Heroku CLI
# Create separate apps for frontend and backend
heroku create your-app-backend
heroku create your-app-frontend

# Add services
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini

# Deploy backend
git subtree push --prefix=backend heroku main

# Deploy frontend (build as static)
cd frontend && npm run build && npm run export
# Use heroku-buildpack-static
```

---

## 🔧 Pre-Deployment Checklist

### 1. Environment Variables Setup
Create production environment files:

**Backend (.env.production)**:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=your_postgres_url
REDIS_URL=your_redis_url
FRONTEND_URL=your_frontend_url
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=your_backend_url
```

### 2. Database Setup
Your app will automatically:
- Run Prisma migrations: `npx prisma db push`
- Seed the database: `npm run db:seed`
- Create sample users: Alice, Bob, Charlie, Diana

### 3. Build Scripts Verification
Ensure your package.json files have correct scripts:

**Backend**:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "db:seed": "ts-node src/seed.ts"
  }
}
```

**Frontend**:
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "export": "EXPORT_MODE=static next build"
  }
}
```

---

## 🚀 Deployment Commands

### Railway Quick Deploy:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### Manual Deployment Steps:
```bash
# 1. Prepare the application
git add .
git commit -m "Production deployment ready"
git push

# 2. Set environment variables in your platform
# 3. Platform will auto-build and deploy
# 4. Verify health endpoint: https://your-app.com/health
```

---

## 🔍 Verification Steps

After deployment, test these endpoints:

1. **Health Check**: `GET /health`
2. **Users**: `GET /api/users`
3. **Frontend**: Open your deployed URL
4. **WebSocket**: Check real-time notifications work
5. **Database**: Verify sample data exists

### Test Commands:
```bash
# Health check
curl https://your-backend-url.com/health

# Get users
curl https://your-backend-url.com/api/users

# Create content (triggers notifications)
curl -X POST https://your-backend-url.com/api/content \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "type": "BLOG", "title": "Test", "body": "Hello World!"}'
```

---

## 🐛 Common Issues & Solutions

### 1. CORS Errors
**Solution**: Ensure `FRONTEND_URL` environment variable is set correctly in backend

### 2. Database Connection Issues
**Solution**: Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/dbname`

### 3. WebSocket Connection Failed
**Solution**: Most platforms support WebSockets by default. Check if HTTPS is required.

### 4. Build Failures
**Solution**: Check logs, ensure all dependencies are in `dependencies` not `devDependencies`

### 5. Static Export Issues (Vercel)
**Solution**: Use `EXPORT_MODE=static npm run build` for static deployment

---

## 💰 Cost Comparison

| Platform | Free Tier | Databases | WebSocket | Sleep Policy |
|----------|-----------|-----------|-----------|--------------|
| **Railway** | $5 credit/month | ✅ Postgres, Redis | ✅ Yes | No sleep |
| **Render** | 512MB RAM | ✅ Postgres, Redis | ✅ Yes | 15min sleep |
| **Vercel** | Unlimited sites | ❌ Separate needed | ✅ Yes | No sleep |
| **Supabase** | 500MB DB | ✅ Postgres only | ✅ Yes | 1 week pause |

---

## 🎉 Success!

Once deployed, your real-time notification system will be live with:

✅ **Real-time WebSocket notifications**  
✅ **PostgreSQL database with sample data**  
✅ **Redis for message queuing**  
✅ **REST API with 20+ endpoints**  
✅ **Responsive React frontend**  
✅ **Multi-user simulation capability**  

**Need help?** Check the logs in your deployment platform's dashboard!
