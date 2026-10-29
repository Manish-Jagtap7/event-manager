# EventHub - College Event Management System

Centralized full-stack college event management system with online registrations, live venue QR check-ins, automated digital certificates, and instant campus broadcasts.

---


## 1. Frontend Start Command

Run this in your frontend terminal to launch the Vite development server on `http://localhost:5173`:

```bash
cd frontend && npm install && npm run dev
```

---

## 2. Backend Start Command

Run this in your backend terminal to launch the Express REST API & SQLite database on `http://localhost:5000`:

```bash
cd backend && npm install && npm start
```

---

## 3. Database Wipeout Command (Completely Clean)

Run this command inside the backend folder to completely wipe the SQLite database clean and leave no data behind (resets all tables to 0 records):

```bash
cd backend && npm run wipe
```

*(Alternatively, from the project root you can run `npm run wipe`)*

> **Note (Optional Dummy Data):** If you ever need to populate the database with collegiate demo dummy data for testing, run `cd backend && npm run seed`.

---

## 🚀 Production Deployment (VPS / Cloud)

When deploying on a VPS or cloud PaaS (Render, Railway, etc.), run this single command from the project root. It automatically installs dependencies, builds the frontend, and launches the unified full-stack server:

```bash
node start.js
```

*(Alternatively, you can also run `npm start` from the root directory).*

---

## ⚙️ Environment Variables Reference

When deploying, configure these environment variables in your hosting dashboard or in a `.env` file:

| Variable | Required? | Recommended Production Value | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Optional | `production` | Sets runtime environment to production. |
| `PORT` | Optional | `5000` (or auto-assigned) | Listening port for the unified Express server. Most cloud platforms (Render, Railway, Heroku) inject this automatically. |
| `JWT_SECRET` | Recommended | `your_custom_secure_jwt_random_string` | Secret key used to sign and verify student/organizer authentication tokens. |
| `VITE_API_BASE_URL` | Optional | `/api` | Relative API path for frontend requests. Defaults to `/api` in production unified builds. |
| `NODE_VERSION` | Optional | `22` | Specifies Node.js version on cloud platforms (e.g. Render). |
