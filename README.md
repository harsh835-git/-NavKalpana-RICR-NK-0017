# NavKalpana RICR NK-0017 — FitAI

An AI-powered fitness platform that delivers personalized workout plans, diet plans, progress tracking, body measurements, daily check-ins, and an AI coaching chat. A separate admin panel provides full platform management and analytics.

---

## Team Members

- Harsh Soni
- Divyanshi Chaurasiya
- Roofi Khan
- Sakshi Bhargava

---

## Table of Contents

- [Project Overview](#project-overview)
- [Repository Structure](#repository-structure)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Summary](#api-summary)
- [Database Collections](#database-collections)
- [Sub-Module Documentation](#sub-module-documentation)

---

## Project Overview

FitAI is a full-stack web application that provides users with a personalised fitness experience. After registration and email OTP verification, users complete a profile setup (age, sex, height, weight, fitness goal, activity level, workout type, experience level, diet preference). The system then generates personalised workout and diet plans, tracks progress over time, and enables real-time conversation with an AI coach powered by Google Gemini.

An admin panel (completely separate React + Express pair) allows administrators to monitor platform-wide statistics, manage users, view analytics, and maintain static content such as tips, announcements, and FAQs.

---

## Repository Structure

```
NavKalpana-RICR-NK-0017/
├── frontend/              # Main user-facing React application (port 3000)
│   ├── public/
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── context/       # React context providers
│       ├── hooks/         # Custom React hooks
│       └── pages/         # Route-level page components
│
├── backend/               # Main Express API server (port 5050)
│   ├── middleware/        # Express middleware
│   ├── models/            # Mongoose data models
│   ├── routes/            # Express route handlers
│   └── utils/             # Helper utilities
│
├── admin/                 # Admin panel (self-contained)
│   ├── frontend/          # Admin React application (port 3001)
│   │   └── src/
│   │       ├── components/
│   │       ├── context/
│   │       └── pages/
│   └── backend/           # Admin Express API server (port 5051)
│       ├── middleware/
│       ├── models/
│       └── routes/
│
└── README.md
```

---

## Architecture

```
Browser (User App)          Browser (Admin App)
      |                            |
  port 3000                   port 3001
  React SPA                   React SPA
      |                            |
  port 5050                   port 5051
  Express API                 Express API
      |                            |
      +---------->  MongoDB  <------+
                  (shared DB)
```

- The main frontend communicates exclusively with the main backend.
- The admin frontend communicates exclusively with the admin backend.
- Both backends connect to the same MongoDB database, but maintain separate JWT secrets and authentication flows.

---

## Tech Stack

| Layer           | Technology                                      |
|-----------------|------------------------------------------------|
| Frontend        | React 18, React Router v6, Axios, Chart.js, Lucide React |
| Backend         | Node.js, Express 4, Mongoose 7, JWT, Bcrypt     |
| Database        | MongoDB                                         |
| AI Integration  | Google Gemini API (`@google/generative-ai`)     |
| Email           | Nodemailer (Gmail SMTP)                         |
| Auth            | JWT (separate secrets for user and admin)       |
| Dev Tools       | Nodemon, Create React App                       |

---

## Features

### User Application

| Feature | Description |
|---|---|
| Registration & OTP Verification | Email-based OTP verification on signup |
| Forgot / Reset Password | Token-based password reset via email |
| Profile Setup | Captures fitness goals, activity level, body metrics |
| Personalised Workout Plan | Generated based on goal, experience, workout type |
| Personalised Diet Plan | Generated based on goal, calorie target, diet preference |
| Progress Tracking | Log weight, workout completion, diet adherence with charts |
| Body Measurements | Track waist, chest, hips, arms, thighs over time |
| Daily Check-Ins | Energy level logging with fatigue detection |
| Habit Score | Calculated from recent check-in, progress, and measurement consistency |
| AI Coach Chat | Conversational AI powered by Google Gemini with persistent history |

### Admin Panel

| Feature | Description |
|---|---|
| Overview Dashboard | Total users, registrations, recent users, goal and health metric distributions |
| User Management | Search, paginate, filter users; view full profile and activity stats; toggle email verification; delete users |
| Analytics | 30-day registration trend, activity level, goal breakdown, experience levels, workout types, gender split, diet preferences, BMI distribution |
| Static Data Management | Full CRUD for tips, announcements, FAQs, goal descriptions, platform config with active/inactive toggle |

---

## Getting Started

### Prerequisites

- Node.js v16 or higher
- npm v8 or higher
- MongoDB instance (local or Atlas)
- Gmail account with App Password enabled (for Nodemailer)
- Google Gemini API key

### Installation

Clone the repository and install dependencies for each service:

```bash
# Main backend
cd backend
npm install

# Main frontend
cd ../frontend
npm install

# Admin backend
cd ../admin/backend
npm install

# Admin frontend
cd ../admin/frontend
npm install
```

---

## Environment Variables

### Main Backend (`backend/.env`)

```
PORT=5050
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
EMAIL_USER=<your_gmail_address>
EMAIL_PASS=<your_gmail_app_password>
GEMINI_API_KEY=<your_gemini_api_key>
CLIENT_URL=http://localhost:3000
```

### Admin Backend (`admin/backend/.env`)

```
PORT=5051
MONGODB_URI=<your_mongodb_connection_string>
ADMIN_JWT_SECRET=<your_admin_jwt_secret>
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<bcrypt_hash_of_admin_password>
CLIENT_URL=http://localhost:3001
```

Default admin credentials: username `admin`, password `Admin@FitAI2025`

---

## Running the Application

Start all four services (each in a separate terminal):

```bash
# Terminal 1 — Main backend
cd backend
npm run dev

# Terminal 2 — Main frontend
cd frontend
npm start

# Terminal 3 — Admin backend
cd admin/backend
npm run dev

# Terminal 4 — Admin frontend
cd admin/frontend
npm start
```

| Service         | URL                      |
|-----------------|--------------------------|
| User App        | http://localhost:3000    |
| Main API        | http://localhost:5050    |
| Admin App       | http://localhost:3001    |
| Admin API       | http://localhost:5051    |

---

## API Summary

### Main Backend (port 5050)

| Method | Endpoint                             | Description                    |
|--------|--------------------------------------|-------------------------------- |
| POST   | /api/auth/register                   | Register new user               |
| POST   | /api/auth/verify-otp                 | Verify email OTP                |
| POST   | /api/auth/resend-otp                 | Resend OTP                      |
| POST   | /api/auth/login                      | User login                      |
| POST   | /api/auth/forgot-password            | Request password reset email    |
| POST   | /api/auth/reset-password/:token      | Reset password with token       |
| GET    | /api/profile                         | Get user profile                |
| POST   | /api/profile/setup                   | Create or update profile        |
| PATCH  | /api/profile/goal                    | Update fitness goal only        |
| GET    | /api/workout/plan                    | Get personalised workout plan   |
| GET    | /api/diet/plan                       | Get personalised diet plan      |
| POST   | /api/progress/log                    | Log a progress entry            |
| GET    | /api/progress                        | Get all progress logs           |
| GET    | /api/progress/stats                  | Get progress statistics         |
| POST   | /api/measurements/log                | Log body measurements           |
| GET    | /api/measurements                    | Get measurement history         |
| POST   | /api/checkin                         | Create a daily check-in         |
| GET    | /api/checkin                         | Get check-in history            |
| POST   | /api/chat/message                    | Send message to AI coach        |
| GET    | /api/chat/history                    | Get AI chat history             |
| GET    | /api/habit/score                     | Get habit score                 |

### Admin Backend (port 5051)

| Method | Endpoint                               | Description                        |
|--------|----------------------------------------|------------------------------------|
| POST   | /api/admin/auth/login                  | Admin login                        |
| GET    | /api/admin/auth/verify                 | Verify admin token                 |
| GET    | /api/admin/users                       | List users (paginated/searchable)  |
| GET    | /api/admin/users/:id                   | Get single user details            |
| GET    | /api/admin/users/:id/stats             | Get user activity statistics       |
| DELETE | /api/admin/users/:id                   | Delete a user                      |
| PATCH  | /api/admin/users/:id/verify            | Toggle email verification          |
| GET    | /api/admin/analytics/overview          | Platform overview statistics       |
| GET    | /api/admin/analytics/registrations     | 30-day registration trend          |
| GET    | /api/admin/analytics/distributions     | User distribution data             |
| GET    | /api/admin/analytics/bmi-stats         | BMI distribution                   |
| GET    | /api/admin/analytics/recent-activity   | Recent user activity               |
| GET    | /api/admin/static-data                 | List static data entries           |
| POST   | /api/admin/static-data                 | Create static data entry           |
| PUT    | /api/admin/static-data/:id             | Update static data entry           |
| DELETE | /api/admin/static-data/:id             | Delete static data entry           |
| PATCH  | /api/admin/static-data/:id/toggle      | Toggle active status               |

---

## Database Collections

All collections reside in the same MongoDB database shared by both backends.

| Collection    | Description                                              |
|---------------|----------------------------------------------------------|
| users         | User accounts, profile data, authentication tokens       |
| progresses    | Weight, workout completion, diet adherence log entries   |
| measurements  | Body measurement snapshots (waist, chest, hips, etc.)   |
| checkins      | Daily energy level check-in records                     |
| chats         | AI coach message history per user                       |
| staticdatas   | Admin-managed tips, announcements, FAQs, config entries |

---

## Sub-Module Documentation

Detailed documentation for each service is available in its own README:

- [Main Frontend](./frontend/README.md) — React app structure, pages, components, context, routing, and setup
- [Main Backend](./backend/README.md) — Express API structure, routes, models, utilities, middleware, and setup
- [Admin Panel](./admin/README.md) — Admin frontend and backend structure, routes, models, pages, and setup
