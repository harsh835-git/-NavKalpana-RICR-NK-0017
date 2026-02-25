# FitAI — Admin Panel

The admin panel is a self-contained pair of applications — a React frontend and an Express backend — that gives administrators full visibility and control over the FitAI platform. It runs independently from the main user application and connects to the same MongoDB database.

---

## Table of Contents

- [Overview](#overview)
- [Structure](#structure)
- [Admin Credentials](#admin-credentials)
- [Setup and Running](#setup-and-running)
- [Admin Frontend](#admin-frontend)
- [Admin Backend](#admin-backend)

---

## Overview

- **Admin Frontend:** React 18 SPA on port 3001
- **Admin Backend:** Express 4 API on port 5051
- **Database:** Shared MongoDB instance (same as main backend)
- **Auth:** Separate JWT flow using `ADMIN_JWT_SECRET` — completely isolated from user auth

The admin panel provides four core capability areas:
1. **Overview** — platform-wide statistics at a glance
2. **User Management** — full CRUD and account control for all registered users
3. **Analytics** — charts and distributions for platform health
4. **Static Data** — manage content (tips, FAQs, announcements, etc.) shown in the user app

---

## Structure

```
admin/
├── frontend/                  # React admin application (port 3001)
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js           # React entry point
│       ├── index.css          # Global styles
│       ├── App.js             # Root component with route definitions
│       ├── components/
│       │   └── Sidebar.js     # Admin navigation sidebar
│       ├── context/
│       │   ├── AdminAuthContext.js  # Admin auth state management
│       │   └── ThemeContext.js      # Light/dark theme state
│       └── pages/
│           ├── Login.js       # Admin login page
│           ├── Overview.js    # Dashboard overview page
│           ├── Users.js       # User management page
│           ├── Analytics.js   # Analytics and charts page
│           └── StaticData.js  # Static content management page
│
└── backend/                   # Express admin API server (port 5051)
    ├── server.js              # Entry point, middleware, route mounting
    ├── middleware/
    │   └── adminAuth.js       # Admin JWT authentication middleware
    ├── models/
    │   ├── User.js            # Shared user model (read + modify)
    │   └── StaticData.js      # Static content model
    └── routes/
        ├── adminAuth.js       # Admin login and token verification
        ├── users.js           # User management endpoints
        ├── analytics.js       # Analytics data endpoints
        └── staticData.js      # Static content CRUD endpoints
```

---

## Admin Credentials

| Field    | Value             |
|----------|-------------------|
| Username | `admin`           |
| Password | `Admin@FitAI2025` |

These are set via environment variables in `admin/backend/.env`. The password is stored as a bcrypt hash in `ADMIN_PASSWORD_HASH`.

---

## Setup and Running

### Prerequisites

- Node.js v16 or higher
- MongoDB running (shared with main backend)
- Main backend does not need to be running for admin panel to work

### Install dependencies

```bash
# Admin backend
cd admin/backend
npm install

# Admin frontend
cd admin/frontend
npm install
```

### Environment variables

Create `admin/backend/.env`:

```
PORT=5051
MONGODB_URI=<your_mongodb_connection_string>
ADMIN_JWT_SECRET=<a_strong_random_secret_different_from_main>
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<bcrypt_hash_of_Admin@FitAI2025>
CLIENT_URL=http://localhost:3001
```

### Start the admin panel

```bash
# Terminal 1 — Admin backend
cd admin/backend
npm run dev

# Terminal 2 — Admin frontend
cd admin/frontend
npm start
```

| Service        | URL                   |
|----------------|-----------------------|
| Admin App      | http://localhost:3001 |
| Admin API      | http://localhost:5051 |

---

## Admin Frontend

### Tech Stack

| Package          | Version  | Purpose                        |
|------------------|----------|--------------------------------|
| react            | ^18.2.0  | UI library                     |
| react-dom        | ^18.2.0  | DOM rendering                  |
| react-router-dom | ^6.14.1  | Client-side routing            |
| axios            | ^1.4.0   | HTTP client                    |
| chart.js         | ^4.3.0   | Chart rendering engine         |
| react-chartjs-2  | ^5.2.0   | React wrapper for Chart.js     |
| lucide-react     | ^0.575.0 | Icon library                   |
| react-scripts    | 5.0.1    | CRA build tooling              |

- **Port:** 3001 (set via `PORT=3001` in `admin/frontend/.env`)
- **Proxy:** `http://localhost:5051` (admin backend)

### Pages

#### Login (`/login`)
Admin login form. Submits to `POST /api/admin/auth/login`. On success, stores the admin JWT and redirects to the Overview page. Unauthenticated users are redirected here from all protected routes.

#### Overview (`/overview`)
Dashboard landing page. Displays:
- Total registered users
- Verified vs unverified user counts
- New registrations in the last 30 days
- A 30-day registration trend mini-chart
- Recent user signups list
- Goal distribution summary
- Key health metric averages

#### Users (`/users`)
Full user management interface. Features:
- Paginated user table with columns: name, email, goal, verified status, registration date
- Search by name or email
- Filter by verification status and fitness goal
- Click a user row to view their complete profile, body metrics, and activity stats (check-ins, progress logs, measurements)
- Toggle email verification status
- Delete user with confirmation

#### Analytics (`/analytics`)
Data visualisation dashboard. Charts include:
- 30-day daily registration line chart
- Activity level distribution (bar or pie chart)
- Fitness goal breakdown
- Experience level distribution
- Workout type split (gym vs home)
- Gender distribution
- Diet preference breakdown
- BMI category distribution (Underweight, Normal, Overweight, Obese)

#### StaticData (`/static-data`)
Content management for static entries served to the user app. Features:
- Filter entries by category
- Create a new entry (key, title, content, category, order)
- Edit existing entries in-place
- Toggle active/inactive status without deleting
- Delete entries

**Categories available:**
- `tips` — Daily tips shown to users
- `announcements` — Platform-wide announcements
- `faq` — Frequently asked questions
- `goal_info` — Descriptions shown per fitness goal
- `platform_config` — Key-value configuration entries

### Context Providers

#### `AdminAuthContext.js`
Manages admin authentication state.

- `adminUser` — decoded admin JWT payload
- `adminToken` — raw JWT string (stored in `localStorage`)
- `adminLogin(token)` — store token, decode payload, update state
- `adminLogout()` — clear token and user state

#### `ThemeContext.js`
Light/dark theme toggle, persisted in `localStorage`.

### Routing

```
/login          → Login          (public)
/overview       → Overview       (protected)
/users          → Users          (protected)
/analytics      → Analytics      (protected)
/static-data    → StaticData     (protected)
/               → redirects to /overview
```

---

## Admin Backend

### Tech Stack

| Package       | Version  | Purpose                           |
|---------------|----------|-----------------------------------|
| express       | ^4.18.2  | Web framework                     |
| mongoose      | ^7.4.0   | MongoDB ODM                       |
| jsonwebtoken  | ^9.0.0   | JWT creation and verification     |
| bcryptjs      | ^2.4.3   | Password hash verification        |
| cors          | ^2.8.5   | CORS configuration                |
| dotenv        | ^16.0.3  | Environment variable loading      |
| nodemon       | ^3.0.1   | Dev server auto-restart           |

- **Port:** 5051
- **CORS:** Allows requests from `http://localhost:3001` only

### Routes

All routes are prefixed with `/api/admin`.

#### Admin Auth — `/api/admin/auth`

| Method | Path     | Auth Required | Description                                  |
|--------|----------|---------------|----------------------------------------------|
| POST   | /login   | No            | Validate username and password, return JWT   |
| GET    | /verify  | Yes           | Verify token validity (used on app load)     |

Login validates the submitted username against `ADMIN_USERNAME` and the submitted password against the bcrypt hash in `ADMIN_PASSWORD_HASH`. On success, returns a signed JWT using `ADMIN_JWT_SECRET`.

---

#### Users — `/api/admin/users`

| Method | Path             | Auth Required | Description                                  |
|--------|------------------|---------------|----------------------------------------------|
| GET    | /                | Yes           | List users with pagination, search, filters  |
| GET    | /:id             | Yes           | Get full profile data for a specific user    |
| GET    | /:id/stats       | Yes           | Get activity counts for a specific user      |
| DELETE | /:id             | Yes           | Permanently delete a user and their data     |
| PATCH  | /:id/verify      | Yes           | Toggle `isVerified` flag on user account     |

**Query parameters for `GET /`:**
- `page` — page number (default `1`)
- `limit` — results per page (default `20`)
- `search` — substring search on name and email
- `verified` — filter by `true` or `false`
- `goal` — filter by fitness goal value

**Stats response (`GET /:id/stats`) includes:**
- Total check-in count
- Total progress log entries
- Total measurement entries
- Last activity timestamp

---

#### Analytics — `/api/admin/analytics`

| Method | Path               | Auth Required | Description                                       |
|--------|--------------------|---------------|---------------------------------------------------|
| GET    | /overview          | Yes           | Summary counts and averages for the platform      |
| GET    | /registrations     | Yes           | Day-by-day registration counts for last 30 days   |
| GET    | /distributions     | Yes           | Breakdowns by goal, activity, experience, gender, diet, workout type |
| GET    | /bmi-stats         | Yes           | User counts per BMI category                      |
| GET    | /recent-activity   | Yes           | Most recently active users                        |

**Overview response includes:**
- `totalUsers` — total registered user count
- `verifiedUsers` — count of email-verified users
- `newUsersLast30Days` — registrations in the past 30 days
- `profileComplete` — users who have completed profile setup
- `averageBMI` — mean BMI across all users with profiles
- `averageAge` — mean age across all profiled users

**Distributions response includes breakdowns for:**
- `goals` — count per fitness goal
- `activityLevels` — count per activity level
- `experienceLevels` — count per experience level
- `workoutTypes` — count per workout type (gym/home)
- `genders` — count per sex
- `dietPreferences` — count per diet preference

---

#### Static Data — `/api/admin/static-data`

| Method | Path            | Auth Required | Description                          |
|--------|-----------------|---------------|--------------------------------------|
| GET    | /               | Yes           | List static data entries             |
| POST   | /               | Yes           | Create a new static data entry       |
| PUT    | /:id            | Yes           | Update an existing entry             |
| DELETE | /:id            | Yes           | Delete an entry                      |
| PATCH  | /:id/toggle     | Yes           | Toggle `isActive` status             |

**Query parameters for `GET /`:**
- `category` — filter by category (`tips`, `announcements`, `faq`, `goal_info`, `platform_config`)

---

### Models

#### `User.js`
Shared model — identical schema to the main backend's `User.js`. The admin backend uses it in read-mostly mode (profile reads, verification toggle, deletion). Connects to the same `users` collection.

#### `StaticData.js`

| Field     | Type    | Description                                              |
|-----------|---------|----------------------------------------------------------|
| key       | String  | Unique identifier key for the entry                      |
| title     | String  | Display title                                            |
| content   | String  | Main text content                                        |
| category  | String  | One of: `tips`, `announcements`, `faq`, `goal_info`, `platform_config` |
| isActive  | Boolean | Whether the entry is currently active (default `true`)   |
| order     | Number  | Sort order within category (default `0`)                 |
| createdAt | Date    | Creation timestamp                                       |
| updatedAt | Date    | Last update timestamp                                    |

---

### Middleware

#### `adminAuth.js`

Admin-specific JWT authentication middleware. Applied to all protected admin routes.

- Reads the `Authorization` header, expects `Bearer <token>`
- Verifies the token against `ADMIN_JWT_SECRET` (separate from the main `JWT_SECRET`)
- Returns `401 Unauthorized` if token is missing, invalid, or expired
- Does not share any auth state or secrets with the main backend

**Usage:**
```js
const { adminProtect } = require('../middleware/adminAuth');
router.get('/users', adminProtect, listUsers);
```
