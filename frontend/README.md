# FitAI — Main Frontend

The user-facing React single-page application for the FitAI platform. Handles authentication, profile setup, workout and diet plan display, progress tracking, body measurements, daily check-ins, and the AI coach chat interface.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages](#pages)
- [Components](#components)
- [Context Providers](#context-providers)
- [Custom Hooks](#custom-hooks)
- [Routing](#routing)
- [Proxy Configuration](#proxy-configuration)
- [Setup and Running](#setup-and-running)
- [Environment](#environment)

---

## Overview

- **Framework:** React 18 (Create React App)
- **Port:** 3000
- **API target:** `http://localhost:5050` (main backend)

The app is a client-side SPA. All navigation is handled by React Router v6. Authentication state is persisted via `localStorage` and managed through `AuthContext`. The theme (light/dark) is managed through `ThemeContext`.

---

## Tech Stack

| Package              | Version   | Purpose                            |
|----------------------|-----------|------------------------------------|
| react                | ^18.2.0   | UI library                         |
| react-dom            | ^18.2.0   | DOM rendering                      |
| react-router-dom     | ^6.14.1   | Client-side routing                |
| axios                | ^1.4.0    | HTTP client for API calls          |
| chart.js             | ^4.3.0    | Chart rendering engine             |
| react-chartjs-2      | ^5.2.0    | React wrapper for Chart.js         |
| lucide-react         | ^0.575.0  | Icon library                       |
| react-markdown       | ^10.1.0   | Markdown rendering for AI messages |
| react-scripts        | 5.0.1     | CRA build tooling                  |

---

## Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML shell
├── src/
│   ├── index.js                # React entry point
│   ├── index.css               # Global base styles
│   ├── App.js                  # Root component with all route definitions
│   ├── components/
│   │   ├── Icons.js            # Custom SVG icon components
│   │   └── Sidebar.js          # Authenticated app navigation sidebar
│   ├── context/
│   │   ├── AuthContext.js      # Auth state (user, token, login, logout)
│   │   └── ThemeContext.js     # Light/dark theme state
│   ├── hooks/
│   │   └── useToast.js         # Toast notification hook
│   └── pages/
│       ├── Landing.js          # Public landing page
│       ├── Landing.css         # Landing page styles
│       ├── Login.js            # User login form
│       ├── Register.js         # User registration form
│       ├── VerifyOTP.js        # Email OTP verification
│       ├── ForgotPassword.js   # Forgot password request
│       ├── ResetPassword.js    # Password reset with token
│       ├── ProfileSetup.js     # Onboarding profile setup form
│       ├── Dashboard.js        # Main authenticated dashboard
│       ├── WorkoutPlan.js      # Personalised workout plan view
│       ├── DietPlan.js         # Personalised diet plan view
│       ├── Progress.js         # Progress log and chart view
│       ├── Measurements.js     # Body measurements log and chart
│       ├── CheckIn.js          # Daily energy check-in
│       └── AICoach.js          # AI coach conversational chat
└── package.json
```

---

## Pages

### Public Pages (no auth required)

| Page             | Path                     | Description |
|------------------|--------------------------|-------------|
| Landing          | `/`                      | Marketing landing page with app overview and CTA |
| Login            | `/login`                 | Email and password login form |
| Register         | `/register`              | New user registration form |
| VerifyOTP        | `/verify-otp`            | 6-digit OTP input sent to registered email |
| ForgotPassword   | `/forgot-password`       | Submit email to receive password reset link |
| ResetPassword    | `/reset-password/:token` | New password form validated against reset token |

### Protected Pages (JWT required)

| Page          | Path           | Description |
|---------------|----------------|-------------|
| ProfileSetup  | `/setup`       | First-time profile configuration (goals, body metrics, preferences) |
| Dashboard     | `/dashboard`   | Summary of stats, recent progress, habit score, quick links |
| WorkoutPlan   | `/workout`     | Full personalised workout schedule generated from profile |
| DietPlan      | `/diet`        | Full personalised meal plan generated from profile |
| Progress      | `/progress`    | Log weight and adherence; view line charts over time |
| Measurements  | `/measurements`| Log body measurements; view trend charts |
| CheckIn       | `/checkin`     | Daily energy level input; view history |
| AICoach       | `/coach`       | Chat interface with Google Gemini AI coach |

---

## Components

### `Sidebar.js`
Persistent navigation sidebar rendered on all authenticated pages. Contains links to all protected routes, displays the current user's name, and includes a logout button. Adapts to light and dark themes.

### `Icons.js`
A collection of custom SVG icon components used across the application for a consistent icon style without relying on external icon fonts.

---

## Context Providers

### `AuthContext.js`

Provides global authentication state to the entire component tree.

**State:**
- `user` — decoded JWT payload (user id, email, name)
- `token` — raw JWT string stored in `localStorage`
- `loading` — boolean indicating initial auth check in progress

**Methods:**
- `login(token)` — store token, decode user, update state
- `logout()` — clear token and user from state and `localStorage`

**Usage:**
```jsx
import { useAuth } from '../context/AuthContext';
const { user, token, login, logout } = useAuth();
```

### `ThemeContext.js`

Manages light/dark theme preference persisted in `localStorage`.

**State:**
- `theme` — `'light'` or `'dark'`

**Methods:**
- `toggleTheme()` — switch between light and dark

**Usage:**
```jsx
import { useTheme } from '../context/ThemeContext';
const { theme, toggleTheme } = useTheme();
```

---

## Custom Hooks

### `useToast.js`

Provides a lightweight toast notification system.

**Returns:**
- `toasts` — array of active toast objects `{ id, message, type }`
- `showToast(message, type)` — trigger a new toast (`'success'`, `'error'`, `'info'`)
- `removeToast(id)` — manually dismiss a toast

Toasts auto-dismiss after a set timeout.

---

## Routing

All routes are defined in `App.js`. Protected routes check `AuthContext` for a valid token and redirect to `/login` if not authenticated. The route `/setup` redirects to `/dashboard` if profile is already complete.

```
/                       → Landing
/login                  → Login
/register               → Register
/verify-otp             → VerifyOTP
/forgot-password        → ForgotPassword
/reset-password/:token  → ResetPassword
/setup                  → ProfileSetup       [protected]
/dashboard              → Dashboard          [protected]
/workout                → WorkoutPlan        [protected]
/diet                   → DietPlan           [protected]
/progress               → Progress           [protected]
/measurements           → Measurements       [protected]
/checkin                → CheckIn            [protected]
/coach                  → AICoach            [protected]
```

---

## Proxy Configuration

`package.json` sets a proxy to forward API requests during development:

```json
"proxy": "http://localhost:5050"
```

All `axios` calls to relative paths (e.g. `/api/auth/login`) are automatically forwarded to the main backend at port 5050 in development. In production, configure the web server (nginx, etc.) to route `/api` to the backend service.

---

## Setup and Running

### Prerequisites

- Node.js v16 or higher
- Main backend running on port 5050

### Install dependencies

```bash
cd frontend
npm install
```

### Start development server

```bash
npm start
```

The app opens at `http://localhost:3000`.

### Build for production

```bash
npm run build
```

The optimised static build is output to `frontend/build/`.

---

## Environment

The frontend itself does not use a `.env` file for API URLs — the proxy in `package.json` handles development routing. For production deployments, update the API base URL in the axios configuration or use `REACT_APP_API_URL` environment variable as needed.
