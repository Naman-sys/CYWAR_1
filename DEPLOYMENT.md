# Deploy to Render

## ✅ Pre-Deployment Checklist

Your app is **READY FOR DEPLOYMENT** on Render! 

### What's Working:
- ✅ Production build compiles successfully
- ✅ Database connection using Neon PostgreSQL (HTTP driver)
- ✅ Environment variables configured
- ✅ Build and start scripts ready
- ✅ Static assets served correctly

## 🚀 Deployment Steps

### Option 1: Deploy via render.yaml (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml` and deploy

3. **Set Environment Variables**
   In Render Dashboard, add:
   ```
   DATABASE_URL=your_neon_database_connection_string
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   SESSION_SECRET=auto_generated_by_render
   NODE_ENV=production
   PORT=5000
   ```

### Option 2: Manual Deployment

1. **Create New Web Service**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repo

2. **Configure Service**
   - **Name**: cywar-app (or your choice)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

3. **Add Environment Variables** (same as above)

4. **Deploy**: Click "Create Web Service"

## 📋 Environment Variables Required

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ Yes |
| `HUGGINGFACE_API_KEY` | HuggingFace API key for AI analysis | ✅ Yes |
| `SESSION_SECRET` | Secret for session encryption | ✅ Yes |
| `NODE_ENV` | Set to `production` | ✅ Yes |
| `PORT` | Port number (auto-set by Render) | ✅ Yes |

## 🔧 Configuration Files

### render.yaml
```yaml
services:
  - type: web
    name: cywar-app
    runtime: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: SESSION_SECRET
        generateValue: true
      - key: HUGGINGFACE_API_KEY
        sync: false
      - key: PORT
        value: 5000
```

## ✨ Features

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Database**: Neon PostgreSQL (serverless)
- **AI**: HuggingFace Llama 3.3-70B for fake news detection
- **Session**: In-memory session store
- **Build**: Optimized production bundle

## 🎯 Post-Deployment

After deployment:
1. Your app will be available at: `https://cywar-app.onrender.com` (or your custom domain)
2. Test the registration/login flow
3. Test the fake news analysis
4. Monitor logs in Render Dashboard

## 🐛 Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node version (20.x recommended)

### Database Connection Issues
- Verify `DATABASE_URL` is correctly set
- Check Neon database is active
- Ensure connection string uses `postgresql://` protocol

### 502 Bad Gateway
- Check application logs
- Verify `PORT` environment variable is set
- Ensure start command is correct: `npm start`

## 📊 Performance

- **Cold Start**: ~5-10 seconds
- **Response Time**: ~100-500ms
- **Database**: Neon serverless (auto-scales)
- **Free Tier**: 750 hours/month

## 🔒 Security Notes

1. **Never commit .env** to git
2. Use environment variables in Render Dashboard
3. Regenerate `SESSION_SECRET` for production
4. Enable HTTPS (automatic on Render)

---

✅ **Your app is deployment-ready!** Follow the steps above to deploy to Render.
