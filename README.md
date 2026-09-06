# Dynamic Cooling System - AMC Management

MERN stack app for an AC/appliance AMC (Annual Maintenance Contract) business
in Vapi, Gujarat. Role-based (Admin / Technician / Customer), with automated
dual-side (customer + company/technician) Email + SMS alerts for every key
event.

## Stack
MongoDB (Mongoose) · Express.js · React (Vite) · Node.js · node-cron · Nodemailer

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env   # edit MONGO_URI / AWS_* / CORS_ORIGIN
npm run seed            # creates admin + 2 technicians + spare parts
npm run dev              # http://localhost:5000
```
Seeded logins: `admin@dynamiccooling.in` / `admin123`,
`ramesh.tech@dynamiccooling.in` / `tech123`.

Email is unconfigured by default — it auto-uses a free Ethereal test inbox
and prints a preview link in the console for every email sent. To send real
emails, set `EMAIL_USER`/`EMAIL_PASS` in `.env`. SMS is a console-log stub
(`utils/sendSMS.js`) — swap in a real MSG91/Fast2SMS call when going live.

Photos, signatures and invoice PDFs are uploaded directly to an **AWS S3
bucket** (`backend/config/s3.js`, `backend/middleware/upload.js`,
`backend/utils/generateInvoice.js`) — nothing is written to local disk, so
this works correctly on ephemeral hosts like Render. Create a bucket, an IAM
user with `s3:PutObject`/`s3:GetObject` on it, and set `AWS_REGION`,
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` in `.env`. The
bucket needs public read (or a CloudFront/public bucket policy on the
subfolders `photos/`, `signatures/`, `invoices/`) since the app stores and
serves back plain S3 URLs.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173 (proxies /api to :5000)
```

### 3. MongoDB
Use a free MongoDB Atlas cluster in production — point `MONGO_URI` in
`backend/.env` at it (a local `mongod` also works for local-only dev).

## Deploying (Render + Vercel)

**Backend on Render:**
1. New Web Service → point at this repo, root directory `backend`.
2. Build command `npm install`, start command `npm start`.
3. Add all vars from `backend/.env.example` in Render's Environment tab —
   `MONGO_URI` (Atlas), `JWT_SECRET`, `AWS_*`, and `CORS_ORIGIN` /
   `CLIENT_URL` set to your Vercel frontend URL (e.g.
   `https://your-app.vercel.app`).
4. Note the Render URL it gives you (e.g. `https://your-app.onrender.com`).

**Frontend on Vercel:**
1. New Project → point at this repo, root directory `frontend`.
2. Build command `npm run build`, output directory `dist` (Vercel
   auto-detects Vite).
3. Set env var `VITE_API_URL` to `https://your-app.onrender.com/api` (either
   in Vercel's dashboard, or edit `frontend/.env.production` before pushing).
4. Redeploy Render once you know the final Vercel URL, so `CORS_ORIGIN`
   matches exactly (including `https://`, no trailing slash).

## What's implemented
- JWT auth, 3 roles (admin/technician/customer)
- Client + Product + AMC contract creation (auto-calculates next service
  date & renewal reminders)
- Technician mobile-style panel: today's visits, complete-service form
  (before/after photo upload, canvas signature capture, parts-used entry
  that auto-deducts inventory)
- Complaint/breakdown tickets, auto-assigned to the nearest available
  technician by zone, with SLA deadlines
- Dual-side Email+SMS alerts (`backend/services/alertEvents.js`) for AMC
  purchase, service due (7/3/1 day), overdue, service completed, renewal
  (30/15 day), payment pending, daily task list, new job/complaint
  assignment, overdue escalation, low stock — logged to `AlertLog` for audit
- Daily cron scheduler (`backend/services/alertScheduler.js`, 08:00) running
  all the above checks automatically; also triggerable manually via
  `POST /api/alert-logs/run-daily-checks` (admin) for testing
- PDF invoice generation (pdfkit)
- Admin dashboard with charts (recharts): revenue trend, AMC growth,
  complaint status breakdown

Spare parts / payments / feedback / detailed reports / alert logs are fully
functional via the API (see `backend/routes/`) even though this build's
frontend only ships dedicated screens for the core demo flows (AMC,
complaints, technician service completion, customer portal) to keep the UI
scope tight for a training-project demo.
