# SpeakSmart — AI English Communication Partner

A production-grade, full-stack AI voice conversation app built with React + Node.js + MongoDB.

## 🚀 Quick Start (Local Dev)

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)

### Backend
```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev            # starts on :5001
```

### Frontend
```bash
cd frontend
cp .env.example .env   # optional for local (proxy handles it)
npm install
npm run dev            # starts on :5173
```

---

## ☁️ Deployment

### Backend → Render
1. Go to [render.com](https://render.com) → New → Web Service
2. Connect this GitHub repo, set **Root Directory** to `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add these **Environment Variables** in the Render dashboard:
   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | Your Atlas connection string |
   | `JWT_SECRET` | A strong random secret |
   | `JWT_EXPIRE` | `7d` |
   | `FRONTEND_URL` | Your Vercel URL (after deploying frontend) |
   | `NODE_ENV` | `production` |

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set **Root Directory** to `frontend`
3. Framework: **Vite**
4. Add this **Environment Variable** in Vercel settings:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | Your Render backend URL (e.g. `https://speaksmart-backend.onrender.com`) |
5. Deploy!

> **Important:** After both are deployed, go back to Render and update `FRONTEND_URL` to your actual Vercel URL, then redeploy the backend.

---

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite 5, React Router 6, Recharts |
| Backend | Node.js, Express 4, Mongoose 8 |
| Database | MongoDB Atlas |
| Auth | JWT |
| Voice | Web Speech API (STT + TTS) |
| AI | Mock AI Service (Alex the Friend) |

## 📁 Structure
```
speaksmart/
├── frontend/       → React app (deploy to Vercel)
├── backend/        → Express API (deploy to Render)
└── extension/      → Chrome Extension (load unpacked)
```
