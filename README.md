# Job Portal Backend API

A secure, role-based REST API for a Job Portal built with **Node.js, Express.js, and MongoDB**.
Job Seekers can browse and apply for jobs, Employers can create and manage job postings and
review applications, and Admins manage users and postings platform-wide.

This is a **backend-only** project: no frontend, payment system, or email service is included.

---

## Tech Stack

| Layer                  | Technology            |
|-------------------------|------------------------|
| Runtime                 | Node.js                |
| Framework                | Express.js              |
| Database                 | MongoDB                 |
| ODM                       | Mongoose                |
| Authentication            | JWT                       |
| Password security          | bcrypt                     |
| Auth storage               | httpOnly cookies             |
| API testing                 | Postman                        |
| Configuration                | Environment variables (.env)     |

---

## Project Structure

```
job-portal-backend/
├── server.js                   # App entry point
├── package.json
├── .env.example                 # Copy to .env and fill in values
├── src/
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── models/
│   │   ├── User.js              # Account, role, embedded profile (skills/education)
│   │   ├── Job.js               # Job posting, references Employer
│   │   └── Application.js       # Links Job Seeker <-> Job, embedded applicant snapshot
│   ├── middleware/
│   │   ├── auth.js              # JWT verification (protect)
│   │   ├── role.js              # Role-based authorization (authorize)
│   │   └── errorHandler.js      # asyncHandler, 404, central error handler
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   └── adminRoutes.js
│   └── utils/
│       ├── generateToken.js     # Signs JWT + sets httpOnly cookie
│       └── seedAdmin.js         # Creates the first Admin account
└── postman/
    └── JobPortal.postman_collection.json
```

---

## Getting Started

### 1. Prerequisites
- Node.js 18+
- A running MongoDB instance (local or Atlas)

### 2. Install dependencies
```bash
cd job-portal-backend
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and set at minimum `MONGO_URI` and `JWT_SECRET`.

### 4. Create the first Admin account
Public registration only allows `jobseeker` or `employer` roles (by design — admins
should not be self-registered). Seed the first admin instead:
```bash
npm run seed:admin
```
This uses `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env` (defaults are provided).

### 5. Run the server
```bash
npm run dev     # with nodemon
# or
npm start
```
The API will be available at `http://localhost:5000/api`.

### 6. Import the Postman collection
Import `postman/JobPortal.postman_collection.json` into Postman. Because auth uses
httpOnly cookies, **enable Postman's cookie jar** (it's on by default in the desktop app) so
the `token` cookie set on login/register is automatically sent on subsequent requests.

---

## Roles & Responsibilities

| Role       | Responsibility                                                                 |
|------------|----------------------------------------------------------------------------------|
| Job Seeker | Creates an account, maintains a profile, browses jobs, applies for jobs.          |
| Employer   | Creates and manages job postings, reviews applications for their own jobs.         |
| Admin      | Manages users and jobs; platform-level access via protected routes.                  |

---

## API Overview

All routes are prefixed with `/api`.

### Auth (`/auth`)
| Method | Route          | Access           | Description                          |
|--------|----------------|------------------|----------------------------------------|
| POST   | `/register`    | Public           | Register as `jobseeker` or `employer`. |
| POST   | `/login`       | Public           | Login, sets httpOnly `token` cookie.    |
| POST   | `/logout`      | Private          | Clears the auth cookie.                  |
| GET    | `/me`          | Private          | Get own profile.                          |
| PUT    | `/me`          | Private          | Update own profile (name/skills/experience/education). |

### Jobs (`/jobs`)
| Method | Route         | Access                  | Description                       |
|--------|---------------|-------------------------|--------------------------------------|
| GET    | `/`           | Public                  | List all open jobs (filter by `search`, `location`, `employmentType`). |
| GET    | `/my-jobs`    | Private (Employer)      | List jobs created by the logged-in employer. |
| POST   | `/`           | Private (Employer)      | Create a job posting.                  |
| GET    | `/:id`        | Public                  | Get a single job by ID.                 |
| PUT    | `/:id`        | Private (Employer, owner)| Update own job posting.                  |
| DELETE | `/:id`        | Private (Employer, owner)| Delete own job posting.                   |

### Applications (`/applications`)
| Method | Route                       | Access                       | Description                          |
|--------|-----------------------------|-------------------------------|-----------------------------------------|
| POST   | `/:jobId`                   | Private (Job Seeker)          | Apply for a job (once per job).          |
| GET    | `/my-applications`          | Private (Job Seeker)          | List own applications.                    |
| GET    | `/my-applications/:id`      | Private (Job Seeker, owner)   | View status of a specific application.     |
| GET    | `/job/:jobId`               | Private (Employer, job owner) | List applications received for a job.       |
| PUT    | `/:id/status`               | Private (Employer, job owner) | Update an application's status.              |

### Admin (`/admin`) — all routes require Admin role
| Method | Route                  | Description                          |
|--------|-------------------------|-----------------------------------------|
| GET    | `/users`                | List all registered users.               |
| GET    | `/users/:id`            | Get a user by ID.                          |
| PUT    | `/users/:id/status`     | Update a user's status (`active`/`suspended`). |
| DELETE | `/users/:id`            | Delete a user.                               |
| GET    | `/jobs`                 | List all job postings.                        |
| GET    | `/jobs/:id`             | Get a job posting by ID.                       |
| DELETE | `/jobs/:id`             | Remove an inappropriate/invalid job posting.    |

---

## Database Design

- **User** — account, authentication, role, and profile info. Embeds `skills` (string
  array) and `education` (sub-document array) because that data belongs to and is always
  read/updated together with the profile.
- **Job** — job posting details. References the **Employer** (`User`) who created it,
  since a user has its own identity/lifecycle independent of any one job.
- **Application** — links a **Job Seeker** to a **Job** by reference (`job`, `applicant`),
  plus an embedded `applicantSnapshot` (name/email/skills/experience at the time of
  applying) so the application record stays meaningful even if the seeker later edits
  their profile. A unique compound index on `(job, applicant)` prevents duplicate
  applications.

## Security

- Passwords are hashed with bcrypt before storage; never stored or returned in plain text.
- JWTs are signed with `JWT_SECRET` and stored in an **httpOnly** cookie (not accessible
  to client-side JS), mitigating XSS token theft.
- `protect` middleware verifies the JWT and loads the current user; `authorize(...roles)`
  middleware enforces role-based access on top of that.
- Ownership checks (e.g., an Employer can only edit their own jobs) are enforced in
  controllers, independent of role checks.
- All secrets (JWT key, Mongo connection string) are read from environment variables via
  `.env`, which is git-ignored.

## Testing

Import the Postman collection in `postman/JobPortal.postman_collection.json`. It includes:
- Registration & login (success and failure cases)
- Unauthenticated and invalid-token requests
- Job Seeker, Employer, and Admin protected-route access
- Full CRUD flows for jobs and applications
- Invalid input / validation error cases
- Cross-user ownership violations (e.g. editing another employer's job)
- Logout and cookie clearing

---

## Pushing to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Job Portal Backend API"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

*(`.env` is excluded via `.gitignore` — never commit real secrets.)*

---

## Next Stage
AI Integration to Backend.
