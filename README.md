# Acadex — Smart Academic Achievement Portal

A full-stack MERN web app for managing academic achievements, performance tracking, and placement readiness at the department level.

## Features
- **4 Role-Based Dashboards**: Student, Faculty, Admin, Placement Officer
- **Achievement Management**: Upload (with Cloudinary), verify, reject with reasons
- **Dynamic Scoring Engine**: Configurable point rules per department/category/level/position
- **Attendance Relaxation Workflow**: Student → Faculty → Admin 3-step approval
- **Analytics Dashboard**: Charts for category, level, monthly trends, score distribution
- **Leaderboard**: Department + global rankings with placement-ready badges
- **Placement Readiness**: Auto-calculated from score ≥ 100 pts; placement officer view

## Tech Stack
**Frontend**: React 18 + Vite, Tailwind CSS, Recharts, React Router v6, Framer Motion, Axios  
**Backend**: Node.js, Express, MongoDB + Mongoose, JWT, Cloudinary, Multer, bcryptjs

## Quick Start

### 1. Clone and configure

```bash
git clone <repo>
cd acadex
```

**Backend `.env`** (`backend/.env`):
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/acadex
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`** (`frontend/.env`):
```
VITE_API_URL=http://localhost:5000/api
```

### 2. Run the backend

```bash
cd backend
npm install
npm run dev
```

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:5173

## First-time Setup

1. Register an **Admin** account
2. Log in as Admin → Go to **Scoring Rules** → Click **Seed Defaults** for each department
3. Register a **Faculty** account for the same department
4. Register **Student** accounts
5. Students upload achievements → Faculty verifies → Scores update automatically

## Role Permissions

| Feature | Student | Faculty | Admin | Placement |
|---------|---------|---------|-------|-----------|
| Upload achievements | ✅ | | | |
| Verify achievements | | ✅ | ✅ | |
| View department analytics | | ✅ | ✅ | ✅ |
| Manage scoring rules | | | ✅ | |
| Approve relaxations | | Recommend | ✅ | |
| View placement-ready students | | | ✅ | ✅ |
| Manage users | | | ✅ | |

## Deployment

**Backend → Render**
1. New Web Service → connect repo → root: `backend/`
2. Build: `npm install` · Start: `npm start`
3. Add all env vars

**Frontend → Vercel**
1. Import repo → root: `frontend/`
2. Build: `npm run build` · Output: `dist`
3. Add `VITE_API_URL=https://your-backend.onrender.com/api`

## License
MIT
