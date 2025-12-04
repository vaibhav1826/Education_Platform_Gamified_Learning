# Gamified Learning Platform

A production-ready MERN stack platform featuring gamified learning, role-based dashboards, real-time leaderboards, certificates, and a rich React hooks architecture.

## Tech Stack
- **Frontend:** React + Vite, Tailwind CSS, Framer Motion, Axios, Socket.io-client
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Socket.io, Nodemailer

## Getting Started
### Backend
```bash
cd backend
cp env.example .env
npm install
# Set CLIENT_URL or CLIENT_URLS in .env to match your frontend
npm run seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` and ensure the backend runs on `http://localhost:5000`.

Set the following variables in `backend/.env` and `frontend/.env` (create if missing):

```
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<server-secret>
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=<same as GOOGLE_CLIENT_ID>
```

## Docker Backend
```bash
cd backend
docker build -t gamified-learning-backend .
docker run -p 5000:5000 --env-file .env gamified-learning-backend
```

## Testing
Use the HTTP collection under `backend/tests/api.http` with VS Code REST client or Insomnia to hit major endpoints (auth, courses, quizzes, leaderboard).

## Scripts
- `npm run seed` (backend): Populate MongoDB with base users, course, quiz
- `npm run dev` (backend): Nodemon-powered API server
- `npm run dev` (frontend): Vite dev server

## Features
- JWT auth with refresh tokens stored as HTTP-only cookies
- Dual-role signup (student/teacher) plus Google OAuth onboarding
- Role-based dashboards with teacher analytics, course builder, and student progress insights
- Courses, modules, lessons, quizzes CRUD with MCQ/True-False/Short Answer support and timers
- Gamification engine (XP, level formula, streak badges, achievements)
- Real-time leaderboard powered by Socket.io
- In-app announcements + notification center with real-time quiz result broadcasts
- Certificate PDF generator for course completion
- Custom React hooks: auth, API, gamification, quiz, streak, debounce, socket
- Professional Tailwind UI with Framer Motion micro-interactions
```