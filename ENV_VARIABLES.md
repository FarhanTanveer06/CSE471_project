# Environment Variables Reference

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# MongoDB Connection String
# For local: mongodb://localhost:27017/mens-clothing-store
# For production (MongoDB Atlas): mongodb+srv://username:password@cluster.mongodb.net/dbname
MONGO_URI=mongodb://localhost:27017/mens-clothing-store

# JWT Secret Key (use a strong random string in production)
# Generate a secure key: openssl rand -base64 32
JWT_SECRET=supersecurejwtkey

# Server Port (default: 5000)
PORT=5000

# Frontend URL (for CORS)
# For local: http://localhost:5173
# For production: https://your-vercel-app.vercel.app
FRONTEND_URL=http://localhost:5173
```

## Frontend Environment Variables

Create a `.env` file in the `frontend/` directory with the following variables:

```env
# Backend API URL
# For local development: http://localhost:5000/api
# For production: https://your-render-backend-url.onrender.com/api
VITE_API_URL=http://localhost:5000/api
```

## Notes

- **Never commit `.env` files to Git** - they contain sensitive information
- Use `.env.example` files as templates (if created)
- In production (Render/Vercel), set these variables in the platform's environment variable settings
- The `VITE_` prefix is required for Vite to expose the variable to the frontend code

