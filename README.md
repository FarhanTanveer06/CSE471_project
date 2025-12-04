# Men's Clothing Store with Smart Dress Guide

A clean, production-ready full-stack MERN application following strict MVC, featuring:
- User authentication (JWT, roles: user and admin)
- Admin and user routes
- Product categories (shirts, pants, blazers), CRUD APIs
- Sample product seed data
- React + Vite frontend with auth, protected routes, and page examples

---

## 📁 Folder Structure

```
backend/
  controllers/
  models/
  routes/
  middlewares/
  config/
  services/
  utils/
  index.js
frontend/
  src/
    components/
    pages/
    context/
    services/
    App.jsx
    main.jsx
  package.json
```

---

## 🚀 Quick Start

### 1. Clone and Install

```sh
# Root level:
git clone <repo_url>
cd CSE471_project

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 2. Env Setup

Create a `.env` file in `backend/`:

```
MONGO_URI=mongodb://localhost:27017/mens-clothing-store
JWT_SECRET=supersecurejwtkey
PORT=5000
```

---

### 3. Seed Sample Products

```sh
cd backend
node services/seedProducts.js
```

---

### 4. Run the App

#### Backend (API)
```
cd backend
# Dev mode with nodemon:
npm run dev
# Or production mode:
npm start
```

#### Frontend (Client)
```
cd frontend
npm run dev
```
Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛣️ API Endpoints

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Users
- `GET /api/users/me` (auth required)

### Products
- `GET /api/products` (all products)
- `GET /api/products/category/:category`
- `GET /api/products/:id`

#### Admin Only
- `POST /api/products`  (add product)
- `PUT /api/products/:id`  (update product)
- `DELETE /api/products/:id` (delete product)

---

## 🧑‍💻 Frontend Pages
- `/` — Home, links to categories
- `/products/category/:category` — List products by category
- `/products/:id` — Product details
- `/login`, `/signup`
- `/admin` — Protected route example

---

## 🔐 Auth & Roles
- Passwords are hashed (bcryptjs) in the database
- JWT is used for API auth, sent via `Authorization: Bearer <token>` header
- Role-based: admin/users
- Attach token/user in localStorage (frontend context)

---

## 🪄 Customize Further
- Expand style/UX in frontend (`src/components`)
- Implement smart dress guide logic/UI on Home or new page
- Add email validation, rate limiting, etc. for production

---

## 🧼 Code Quality:
- ES6 modules, async/await, Express middleware, controller/services separation
- Use try/catch in controllers, input validation with express-validator
- Clean, modular folder structure

---

## 🚀 Deployment

This application is configured for deployment:
- **Backend**: Render
- **Frontend**: Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Environment Variables

#### Backend (Render)
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_random_secret_key
PORT=5000
FRONTEND_URL=https://your-vercel-app.vercel.app
```

#### Frontend (Vercel)
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

**Enjoy building!**
