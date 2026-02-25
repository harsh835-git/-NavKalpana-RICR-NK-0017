# FitAI — Main Backend

The Express API server that powers the user-facing FitAI application. Handles authentication, user profiles, personalised fitness plan generation, progress tracking, measurements, check-ins, AI coach chat, and habit scoring.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Setup and Running](#setup-and-running)
- [Routes](#routes)
- [Models](#models)
- [Middleware](#middleware)
- [Utilities](#utilities)

---

## Overview

- **Framework:** Express 4
- **Port:** 5050
- **Database:** MongoDB via Mongoose 7
- **Auth:** JWT (`jsonwebtoken`) with `bcryptjs` for password hashing
- **Email:** Nodemailer with Gmail SMTP
- **AI:** Google Gemini via `@google/generative-ai`

All routes under `/api/*` (except auth endpoints) require a valid JWT Bearer token passed in the `Authorization` header.

---

## Tech Stack

| Package                  | Version   | Purpose                              |
|--------------------------|-----------|--------------------------------------|
| express                  | ^4.18.2   | Web framework                        |
| mongoose                 | ^7.3.1    | MongoDB ODM                          |
| jsonwebtoken             | ^9.0.0    | JWT creation and verification        |
| bcryptjs                 | ^2.4.3    | Password hashing                     |
| cors                     | ^2.8.5    | Cross-origin resource sharing        |
| dotenv                   | ^16.0.3   | Environment variable loading         |
| nodemailer               | ^6.9.3    | Email sending via SMTP               |
| @google/generative-ai    | ^0.24.1   | Google Gemini AI SDK                 |
| nodemon                  | ^3.0.1    | Dev server with auto-restart         |

---

## Project Structure

```
backend/
├── server.js               # Express app entry point, middleware setup, route mounting
├── middleware/
│   └── auth.js             # JWT authentication middleware (protect)
├── models/
│   ├── User.js             # User schema (auth + profile + fitness data)
│   ├── Progress.js         # Progress log schema
│   ├── Measurement.js      # Body measurement schema
│   ├── CheckIn.js          # Daily check-in schema
│   └── Chat.js             # AI chat message history schema
├── routes/
│   ├── auth.js             # Registration, OTP, login, password reset
│   ├── profile.js          # Profile read/write
│   ├── workout.js          # Workout plan generation
│   ├── diet.js             # Diet plan generation
│   ├── progress.js         # Progress logging and stats
│   ├── measurements.js     # Body measurement logging
│   ├── checkin.js          # Daily check-in
│   ├── chat.js             # AI coach chat
│   └── habit.js            # Habit score calculation
├── utils/
│   ├── fitness.js          # Calorie, BMI, plan generation logic
│   └── email.js            # OTP and password reset email senders
├── .env                    # Environment variables (not committed)
└── package.json
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```
PORT=5050
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<a_strong_random_secret>
EMAIL_USER=<your_gmail_address>
EMAIL_PASS=<your_gmail_app_password>
GEMINI_API_KEY=<your_google_gemini_api_key>
CLIENT_URL=http://localhost:3000
```

**Notes:**
- `EMAIL_PASS` must be a Gmail App Password (not your Gmail login password). Enable 2FA and generate an app password at Google Account settings.
- `GEMINI_API_KEY` is obtained from [Google AI Studio](https://aistudio.google.com).

---

## Setup and Running

### Prerequisites

- Node.js v16 or higher
- Running MongoDB instance (local or Atlas)

### Install dependencies

```bash
cd backend
npm install
```

### Start development server

```bash
npm run dev
```

Uses nodemon for automatic restarts on file changes. Server starts on port 5050.

### Start production server

```bash
npm start
```

---

## Routes

All routes are prefixed with `/api`.

### Auth — `/api/auth`

Handles user registration, email verification, login, and password reset.

| Method | Path                        | Auth Required | Description                                       |
|--------|-----------------------------|---------------|---------------------------------------------------|
| POST   | /register                   | No            | Register new user, send OTP to email              |
| POST   | /verify-otp                 | No            | Verify 6-digit OTP, activate account             |
| POST   | /resend-otp                 | No            | Resend OTP to email                               |
| POST   | /login                      | No            | Login with email and password, receive JWT        |
| POST   | /forgot-password            | No            | Send password reset link to email                 |
| POST   | /reset-password/:token      | No            | Reset password using one-time token               |

**Registration flow:**
1. `POST /register` — creates unverified user, sends 6-digit OTP via email
2. `POST /verify-otp` — validates OTP, marks account as verified
3. `POST /login` — validates credentials, returns signed JWT

**Password reset flow:**
1. `POST /forgot-password` — generates a reset token, emails a link
2. `POST /reset-password/:token` — validates token (15-minute expiry), updates password

---

### Profile — `/api/profile`

| Method | Path       | Auth Required | Description                               |
|--------|------------|---------------|-------------------------------------------|
| GET    | /          | Yes           | Retrieve current user's full profile      |
| POST   | /setup     | Yes           | Create or update complete profile         |
| PATCH  | /goal      | Yes           | Update fitness goal field only            |

**Profile fields set during setup:**
- Age, sex, height (cm), weight (kg)
- Fitness goal (`weight_loss`, `muscle_gain`, `maintenance`, `endurance`)
- Activity level (`sedentary`, `lightly_active`, `moderately_active`, `very_active`, `extra_active`)
- Workout type (`gym`, `home`)
- Experience level (`beginner`, `intermediate`, `advanced`)
- Diet preference (`standard`, `vegetarian`, `vegan`, `keto`, `paleo`, `mediterranean`)

The backend calculates and stores BMI, maintenance calories, and target calories on profile save.

---

### Workout — `/api/workout`

| Method | Path   | Auth Required | Description                                     |
|--------|--------|---------------|-------------------------------------------------|
| GET    | /plan  | Yes           | Get personalised workout plan for current user  |

The plan is generated by `utils/fitness.js` based on the user's goal, experience level, and workout type. Returns a structured weekly schedule.

---

### Diet — `/api/diet`

| Method | Path   | Auth Required | Description                                 |
|--------|--------|---------------|---------------------------------------------|
| GET    | /plan  | Yes           | Get personalised diet plan for current user |

The plan is generated by `utils/fitness.js` based on the user's goal, target calorie intake, and diet preference. Returns daily meal breakdown with macros.

---

### Progress — `/api/progress`

| Method | Path    | Auth Required | Description                                         |
|--------|---------|---------------|-----------------------------------------------------|
| POST   | /log    | Yes           | Log a progress entry (weight, workout, diet, notes) |
| GET    | /       | Yes           | Retrieve all progress entries for current user      |
| GET    | /stats  | Yes           | Aggregated statistics (trends, averages)            |

**Progress log fields:**
- `weight` (kg)
- `workoutCompleted` (boolean)
- `dietAdherence` (percentage, 0–100)
- `notes` (string)

---

### Measurements — `/api/measurements`

| Method | Path   | Auth Required | Description                                     |
|--------|--------|---------------|-------------------------------------------------|
| POST   | /log   | Yes           | Log a body measurement snapshot                 |
| GET    | /      | Yes           | Retrieve full measurement history               |

**Measurement fields:**
- `waist` (cm)
- `chest` (cm)
- `hips` (cm)
- `arms` (cm)
- `thighs` (cm)

---

### Check-In — `/api/checkin`

| Method | Path | Auth Required | Description                        |
|--------|------|---------------|------------------------------------|
| POST   | /    | Yes           | Submit daily energy level check-in |
| GET    | /    | Yes           | Retrieve check-in history          |

**Check-in fields:**
- `energyLevel` (1–10)

The backend applies fatigue detection logic: if energy level is consistently low across recent check-ins, the AI coach context is informed.

---

### Chat — `/api/chat`

| Method | Path      | Auth Required | Description                                |
|--------|-----------|---------------|--------------------------------------------|
| POST   | /message  | Yes           | Send a message to the AI coach             |
| GET    | /history  | Yes           | Retrieve full conversation history         |

Messages are stored in the `Chat` collection. The full conversation history is sent with each request to the Gemini API to maintain context. The system prompt includes the user's profile data (goal, BMI, calories, preferences) for personalised responses.

---

### Habit Score — `/api/habit`

| Method | Path    | Auth Required | Description                                     |
|--------|---------|---------------|-------------------------------------------------|
| GET    | /score  | Yes           | Calculate and return current habit score (0–100)|

The score is calculated from recent check-ins, progress logs, and measurement entries using the logic in `utils/fitness.js`.

---

## Models

### `User.js`

Core user document storing both authentication and profile data.

| Field                | Type    | Description                                    |
|----------------------|---------|------------------------------------------------|
| name                 | String  | Full name                                      |
| email                | String  | Unique email address                           |
| password             | String  | Bcrypt-hashed password                         |
| isVerified           | Boolean | Email OTP verification status                  |
| otp                  | String  | Current OTP (cleared after verification)       |
| otpExpires           | Date    | OTP expiry timestamp                           |
| resetPasswordToken   | String  | Password reset token (hashed)                  |
| resetPasswordExpires | Date    | Reset token expiry (15 minutes)                |
| age                  | Number  | User age                                       |
| sex                  | String  | `male` or `female`                             |
| height               | Number  | Height in cm                                   |
| weight               | Number  | Current weight in kg                           |
| goal                 | String  | Fitness goal enum                              |
| activityLevel        | String  | Activity level enum                            |
| workoutType          | String  | `gym` or `home`                                |
| experienceLevel      | String  | Experience level enum                          |
| dietPreference       | String  | Diet preference enum                           |
| bmi                  | Number  | Calculated BMI                                 |
| maintenanceCalories  | Number  | Calculated TDEE (Mifflin-St Jeor formula)      |
| targetCalories       | Number  | Goal-adjusted daily calorie target             |
| profileComplete      | Boolean | Whether onboarding profile setup is done       |
| createdAt            | Date    | Account creation timestamp                     |

### `Progress.js`

| Field              | Type    | Description                 |
|--------------------|---------|-----------------------------|
| user               | ObjectId| Reference to User           |
| weight             | Number  | Logged weight in kg         |
| workoutCompleted   | Boolean | Whether workout was done    |
| dietAdherence      | Number  | Percentage adherence to diet|
| notes              | String  | Optional free-text notes    |
| createdAt          | Date    | Log entry timestamp         |

### `Measurement.js`

| Field     | Type    | Description                      |
|-----------|---------|----------------------------------|
| user      | ObjectId| Reference to User                |
| waist     | Number  | Waist circumference in cm        |
| chest     | Number  | Chest circumference in cm        |
| hips      | Number  | Hip circumference in cm          |
| arms      | Number  | Arm circumference in cm          |
| thighs    | Number  | Thigh circumference in cm        |
| createdAt | Date    | Measurement entry timestamp      |

### `CheckIn.js`

| Field       | Type    | Description                   |
|-------------|---------|-------------------------------|
| user        | ObjectId| Reference to User             |
| energyLevel | Number  | Energy level score (1–10)     |
| createdAt   | Date    | Check-in timestamp            |

### `Chat.js`

| Field     | Type    | Description                                     |
|-----------|---------|-------------------------------------------------|
| user      | ObjectId| Reference to User                               |
| messages  | Array   | Array of `{ role: 'user'|'model', content: String }` |
| updatedAt | Date    | Last message timestamp                          |

---

## Middleware

### `auth.js` — `protect`

JWT authentication middleware applied to all protected routes.

- Reads the `Authorization` header, expects format `Bearer <token>`
- Verifies the token against `JWT_SECRET`
- Attaches the decoded user object to `req.user`
- Returns `401 Unauthorized` if token is missing, expired, or invalid

**Usage:**
```js
const { protect } = require('../middleware/auth');
router.get('/profile', protect, getProfile);
```

---

## Utilities

### `utils/fitness.js`

Contains all fitness calculation and plan generation logic. No external API calls — all logic is rule-based.

| Function                    | Description                                                      |
|-----------------------------|------------------------------------------------------------------|
| `calculateBMI(weight, height)` | Returns BMI value rounded to one decimal                     |
| `calculateMaintenanceCalories(user)` | Mifflin-St Jeor BMR multiplied by activity multiplier  |
| `calculateTargetCalories(maintenance, goal)` | Adjusts calories based on goal (surplus/deficit) |
| `generateWorkoutPlan(user)` | Returns a weekly workout schedule based on goal, experience, type |
| `generateDietPlan(user)`    | Returns daily meal plan based on goal, calories, diet preference |
| `calculateHabitScore(checkins, progress, measurements)` | Computes 0–100 score from recent activity data |

**Workout plan logic:**
- Gym vs home workouts have different exercise sets
- Beginner, intermediate, and advanced have different volume and intensity
- Goals (weight loss, muscle gain, maintenance, endurance) shape the split

**Diet plan logic:**
- Calorie target split across meals (breakfast, lunch, dinner, snacks)
- Macronutrient ratios adjusted per diet preference (standard, keto, vegan, etc.)

### `utils/email.js`

Email sending utilities using Nodemailer with Gmail SMTP transport.

| Function                    | Description                                                   |
|-----------------------------|---------------------------------------------------------------|
| `sendOTP(email, otp)`       | Sends a formatted OTP email to the given address             |
| `sendPasswordResetEmail(email, resetUrl)` | Sends password reset link email                |

Both functions use `EMAIL_USER` and `EMAIL_PASS` from environment variables to authenticate with Gmail.
