# ResIQ 📄✨
A full-stack AI-powered resume analyzer that scores your resume against a job description, highlights matched/missing keywords, and offers an AI chatbot to help you rewrite and improve it.

---

## 🔗 Live Demo

| | Link |
|--|--|
| 🚀 Live App | [res-iq.vercel.app](https://res-iq.vercel.app) |

---

## Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![AWS EC2](https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white)
![nginx](https://img.shields.io/badge/nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## Project Structure

```
AI Resume/
├── frontend/     # React SPA (Vite + Tailwind CSS v4)
└── backend/      # Express REST API (Dockerized, deployed on AWS EC2)
```

---

## Features

- **Resume Analysis** - Upload a resume PDF + paste a job description, and Gemini AI returns an ATS score, matched/missing keywords, section scores, quick wins, and strengths
- **ResAI Chatbot** - Built-in AI chat assistant for rewriting and improving resume content on the fly
- **Auth with Email OTP** - Full JWT authentication flow with 6-digit email OTP verification (10-minute expiry) via Nodemailer + Gmail App Password
- **Analysis History** - Revisit past resume analyses tied to your account
- **Marketing Landing Page** - Dark theme with gold/metallic accents matching the ResIQ logo
- **Protected Routes** - Client-side route protection tied to auth state
- **Production-Grade Backend Infra** - Dockerized Express API behind nginx with free Let's Encrypt SSL, running on AWS EC2

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster
- Google Gemini API key
- Gmail account + App Password (for OTP emails)
- Docker (optional, for containerized local testing)

### Backend `.env`
```env
PORT=5000
MONGO_URI=
JWT_SECRET=
GEMINI_API_KEY=
EMAIL_USER=
EMAIL_PASS=
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000
```

### Run Locally
```bash
# Backend
cd "AI Resume/backend" && npm install && node server.js

# Frontend
cd "AI Resume/frontend" && npm install && npm run dev
```
Frontend runs at `http://localhost:5173`. Confirm the backend logs show `Server running on port 5000`, `MongoDB connected successfully`, and `Mailer ready`.

### Run Backend via Docker (mirrors production)
```bash
cd "AI Resume/backend"
docker build -t resiq-backend .
docker run -d -p 5000:5000 --env-file .env resiq-backend
```

---

## Deployment

- **Frontend** — Deployed on **Vercel**, auto-deploys on every push to `main`
- **Backend** — Dockerized Express API on **AWS EC2** (t3.micro, Ubuntu 24.04, ap-south-1), reverse-proxied through **nginx** with a free Let's Encrypt SSL cert on a `sslip.io` domain
- **Database** — Hosted on **MongoDB Atlas**
- **Why EC2 over Render** — Render's free tier blocks outbound SMTP (ports 465/587), which broke email OTP delivery in production. Migrating the backend to AWS EC2 resolved this, since EC2 does not block outbound SMTP.

### Deploying Backend Changes
```bash
git push origin main
ssh -i resiq-key.pem ubuntu@3.108.77.223
cd ~/ResIQ/backend
git pull origin main
docker stop resiq-backend && docker rm resiq-backend
docker build -t resiq-backend .
docker run -d -p 5000:5000 --env-file .env --name resiq-backend --restart unless-stopped resiq-backend
```
