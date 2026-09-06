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
cp .env.example .env   # edit MONGO_URI if not using local Mongo
npm run seed            # creates admin + 2 technicians + spare parts
npm run dev              # http://localhost:5000
```
Seeded logins: `admin@dynamiccooling.in` / `admin123`,
`ramesh.tech@dynamiccooling.in` / `tech123`.

Email is unconfigured by default — it auto-uses a free Ethereal test inbox
and prints a preview link in the console for every email sent. To send real
emails, set `EMAIL_USER`/`EMAIL_PASS` in `.env`. SMS is a console-log stub
(`utils/sendSMS.js`) — swap in a real MSG91/Fast2SMS call when going live.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173 (proxies /api to :5000)
```

### 3. MongoDB
Use a local `mongod` or a free MongoDB Atlas cluster — just point
`MONGO_URI` in `backend/.env` at it.

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
