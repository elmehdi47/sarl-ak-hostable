# SARL AK — Hostable Version

Full-stack furniture catalogue application with:
- **Public website** (React + Vite + Tailwind) — Arabic/French/English
- **Admin dashboard** (React + Vite + Tailwind) — at `/admin`
- **Backend API** (Express + Node.js + PostgreSQL via Drizzle ORM)

---

## Project Structure

```
sarl-ak-hostable/
├── backend/          Express API server
│   └── src/
│       ├── db/schema.ts      Database schema + Drizzle client
│       ├── routes/           API route handlers
│       ├── middleware/
│       └── auto-seed.ts      Seeds admin + sample data on first run
├── frontend/         Public website (React)
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── lib/api.ts        API client hooks
├── admin/            Admin dashboard (React)
│   └── src/
│       ├── components/
│       ├── pages/dashboard/
│       └── lib/api.ts        API client hooks
└── .env.example      Environment variables template
```

---

## Requirements

- **Node.js** 20+
- **npm** 9+
- **PostgreSQL** 14+ (local or cloud — Supabase, Neon, Railway, etc.)

---

## 1. Setup

### Clone / download the project

```bash
cd sarl-ak-hostable
```

### Install all dependencies

```bash
npm install
```

### Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `DATABASE_URL` — your PostgreSQL connection string
- `SESSION_SECRET` — a long random string (`openssl rand -hex 32`)
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — credentials for the admin panel

---

## 2. Database Setup

Push the schema to your database:

```bash
cd backend
npx drizzle-kit push
cd ..
```

The admin user and sample products/categories are seeded **automatically on first startup**.

---

## 3. Development

Run all three services in parallel:

```bash
npm run dev
```

Or run them separately:

```bash
# Backend API — port 3000
npm run dev --workspace=backend

# Public website — port 5173
npm run dev --workspace=frontend

# Admin dashboard — port 5174
npm run dev --workspace=admin
```

Open:
- Public site: http://localhost:5173
- Admin panel: http://localhost:5174
- API: http://localhost:3000/api

---

## 4. Production Build

```bash
npm run build
```

This builds:
- `backend/dist/` — compiled backend
- `frontend/dist/` — static public site
- `admin/dist/` — static admin dashboard

In production, the backend serves all static files:
- `/` → `frontend/dist/`
- `/admin` → `admin/dist/`

Start the production server:

```bash
npm run start
```

Or directly: `node backend/dist/index.js`

---

## 5. Deployment Options

### Option A — Railway (easiest)

1. Push this repo to GitHub
2. Create a new Railway project → Add PostgreSQL service
3. Add a new service from your GitHub repo
4. Set environment variables in Railway dashboard
5. Set the start command: `npm run build && npm start`

### Option B — Render

1. Create a PostgreSQL database on Render
2. Create a new Web Service from GitHub
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables

### Option C — VPS (DigitalOcean, Contabo, etc.)

```bash
# On your server
git clone YOUR_REPO
cd sarl-ak-hostable
cp .env.example .env && nano .env   # fill in values
npm install
npm run build
cd backend && npx drizzle-kit push && cd ..

# Use PM2 to keep it running
npm install -g pm2
pm2 start backend/dist/index.js --name sarl-ak
pm2 save

# Optional: Nginx reverse proxy
# proxy_pass http://localhost:3000;
```

---

## 6. File Uploads

Uploaded images are stored locally in `backend/uploads/` by default.

To persist uploads on hosting platforms, set `UPLOADS_DIR` to a persistent volume path, or use an external CDN (upload the files elsewhere and paste URLs manually in the admin).

---

## 7. Admin Panel

- URL: `http://your-domain.com/admin` (production) or `http://localhost:5174` (dev)
- Login with the credentials set in `ADMIN_USERNAME` / `ADMIN_PASSWORD`
- Manage products, categories, orders, inquiries, and site images

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/categories | — | List categories |
| POST | /api/categories | Admin | Create category |
| PATCH | /api/categories/:id | Admin | Update category |
| DELETE | /api/categories/:id | Admin | Delete category |
| GET | /api/products | — | List products |
| POST | /api/products | Admin | Create product |
| PATCH | /api/products/:id | Admin | Update product |
| DELETE | /api/products/:id | Admin | Delete product |
| POST | /api/contact | — | Submit contact form |
| GET | /api/inquiries | Admin | List inquiries |
| POST | /api/orders | — | Submit order |
| GET | /api/orders | Admin | List orders |
| PATCH | /api/orders/:id | Admin | Update order status |
| GET | /api/site-settings | — | Get site settings |
| PATCH | /api/site-settings/:key | Admin | Update site setting |
| POST | /api/auth/login | — | Admin login |
| POST | /api/auth/logout | — | Admin logout |
| GET | /api/auth/me | — | Check session |
