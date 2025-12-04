# Deployment Guide

This guide will help you deploy the Men's Clothing Store application:
- **Backend**: Render
- **Frontend**: Vercel

---

## Prerequisites

1. **MongoDB Database**: 
   - Sign up for [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
   - Create a cluster and get your connection string
   - Whitelist IP addresses (0.0.0.0/0 for Render)

2. **GitHub Account**: 
   - Push your code to a GitHub repository

3. **Render Account**: 
   - Sign up at [render.com](https://render.com)

4. **Vercel Account**: 
   - Sign up at [vercel.com](https://vercel.com)

---

## Step 1: Deploy Backend to Render

### 1.1 Prepare Backend

1. Make sure your backend code is pushed to GitHub

2. The backend is already configured with:
   - `package.json` with start script
   - Environment variables support via `dotenv`
   - CORS configured for frontend

### 1.2 Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `mens-clothing-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

5. Add Environment Variables:
   ```
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_strong_random_secret_key_here
   PORT=5000
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
   > **Note**: You'll update `FRONTEND_URL` after deploying the frontend

6. Click **"Create Web Service"**

7. Wait for deployment to complete. Note your backend URL (e.g., `https://mens-clothing-backend.onrender.com`)

### 1.3 Test Backend

Test your backend API:
```bash
curl https://your-backend-url.onrender.com/api/products
```

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Prepare Frontend

1. Make sure your frontend code is pushed to GitHub

2. The frontend is already configured with:
   - `vercel.json` configuration file
   - Environment variable support for API URL

### 2.2 Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
   > Replace `your-backend-url.onrender.com` with your actual Render backend URL

6. Click **"Deploy"**

7. Wait for deployment to complete. Note your frontend URL (e.g., `https://mens-clothing-store.vercel.app`)

### 2.3 Update Backend CORS

1. Go back to Render dashboard
2. Edit your backend service
3. Update the `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
4. Save and redeploy

---

## Step 3: Seed Database (Optional)

After deployment, you may want to seed your database with sample products.

### Option 1: Using Render Shell

1. Go to your Render service
2. Click on **"Shell"** tab
3. Run:
   ```bash
   cd backend
   node services/seedProducts.js
   ```

### Option 2: Using MongoDB Atlas

1. Connect to your MongoDB Atlas cluster
2. Use MongoDB Compass or Atlas UI to insert the sample products

---

## Environment Variables Summary

### Backend (Render)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_strong_random_secret_key
PORT=5000
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## Troubleshooting

### Backend Issues

1. **MongoDB Connection Failed**
   - Check your `MONGO_URI` is correct
   - Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0` (all IPs)
   - Verify database user credentials

2. **CORS Errors**
   - Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly
   - Check for trailing slashes

3. **Build Fails**
   - Check Render logs for specific errors
   - Ensure `package.json` has correct start script

### Frontend Issues

1. **API Connection Failed**
   - Verify `VITE_API_URL` is set correctly in Vercel
   - Check browser console for CORS errors
   - Ensure backend is running and accessible

2. **Build Fails**
   - Check Vercel build logs
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

3. **404 Errors on Routes**
   - This is handled by `vercel.json` rewrites
   - Ensure `vercel.json` is in the `frontend` directory

---

## Updating Deployments

### Backend Updates
1. Push changes to GitHub
2. Render will automatically redeploy (if auto-deploy is enabled)
3. Or manually trigger redeploy from Render dashboard

### Frontend Updates
1. Push changes to GitHub
2. Vercel will automatically redeploy
3. Or manually trigger redeploy from Vercel dashboard

---

## Custom Domains (Optional)

### Render Custom Domain
1. Go to Render service settings
2. Add your custom domain
3. Update DNS records as instructed

### Vercel Custom Domain
1. Go to Vercel project settings
2. Add your custom domain
3. Update DNS records as instructed
4. Update `FRONTEND_URL` in Render backend

---

## Security Notes

1. **JWT_SECRET**: Use a strong, random string (at least 32 characters)
2. **MongoDB**: Use strong passwords and enable authentication
3. **Environment Variables**: Never commit `.env` files to Git
4. **CORS**: Only allow your frontend domain in production

---

## Support

If you encounter issues:
1. Check deployment logs in Render/Vercel
2. Verify all environment variables are set correctly
3. Test API endpoints directly using curl or Postman
4. Check browser console for frontend errors

---

**Happy Deploying! 🚀**

