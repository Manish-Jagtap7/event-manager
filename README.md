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

## 🚀 VPS Single Start Command (Production Deployment)

When deploying on a VPS, run this single command from the project root. It automatically installs dependencies, builds the frontend, and launches the unified full-stack server on port `5000`:

```bash
node start.js
```

*(Alternatively, you can also run `npm start` from the root directory).*
