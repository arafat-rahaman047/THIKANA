# THIKANA — Smart Real Estate & Rental Management Platform

Thikana is a smart real estate and rental management platform customized for the Bangladesh market. It connects tenants, buyers, property owners, real estate agencies, and system administrators. 

This repository contains both the Node.js/Express backend service and the React/Vite/Tailwind frontend client.

---

## 🏗️ Integrated Architecture

```text
               +-------------------------------------------------+
               |             React Frontend Client               |
               |                (Port 3000)                      |
               +-----------------------+-------------------------+
                                       |
                                       | Requests to /api/v1/*
                                       | and /uploads/*
                                       v
               +-------------------------------------------------+
               |             Vite Development Proxy              |
               |       (Redirects to http://localhost:5000)      |
               +-----------------------+-------------------------+
                                       |
                                       v
               +-------------------------------------------------+
               |             Node.js / Express Backend           |
               |                (Port 5000)                      |
               +-----------------------+-------------------------+
                                       |
                                       v
               +-------------------------------------------------+
               |                 MySQL Database                  |
               |                (Port 3306)                      |
               +-------------------------------------------------+
```

- **Backend**: Repository-Service-Controller pattern, JWT-based authentication (access + refresh tokens), Joi schema validations, Winston logging, and Role-Based Access Control (RBAC).
- **Frontend**: Component-driven architecture using TanStack Query (React Query) for server state caching, React Router for client-side routing, Context API for global session states (Auth, Toast Notifications), and Tailwind CSS for custom premium styles (glassmorphism, smooth animations).

---

## 📁 Repository Structure
```text
THIKANA/
├── thikana-backend/          # Express.js Backend Server
│   ├── migrations/           # Database migration files (001 to 020)
│   ├── seeders/              # SQL seed scripts
│   ├── src/                  # Backend source files
│   │   ├── configs/          # Database & configuration constants
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Auth & role middlewares
│   │   ├── repositories/     # Data access layer
│   │   ├── routes/           # API routes definitions
│   │   ├── services/         # Business logic layer
│   │   ├── utils/            # Winston logger, AppError helpers
│   │   └── validators/       # Joi schemas
│   ├── server.js             # Express app startup file
│   └── .env.example
├── thikana-frontend/         # React Frontend Client (Vite)
│   ├── src/                  # React source files
│   │   ├── components/       # Common elements & layout components
│   │   ├── context/          # Auth & notification states
│   │   ├── hooks/            # useAuth, useDebounce hooks
│   │   ├── pages/            # View pages and dashboards
│   │   └── services/         # API Axios client integrations
│   ├── vite.config.js        # Development server & proxy configuration
│   └── .env.example
└── README.md                 # Project root documentation
```

---

## 🔑 Demo Credentials
The database seeds contain default active users with the following credentials (all have the password corresponding to their role, see seed data):
| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@thikana.com` | `Admin@123` | Platform moderation, verifications, reports |
| **Tenant** | `tenant@thikana.com` | `Tenant@123` | Property searching, messaging, renting, paying |
| **Owner** | `owner@thikana.com` | `Owner@123` | Property listing, agreements, billing |
| **Agency** | `agency@thikana.com` | `Agency@123` | Multiple property management, trade verification |

---

## ⚙️ Environment Configurations

### Backend Environment Variables (`thikana-backend/.env`)
| Key | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for Express Server |
| `NODE_ENV` | `development` | Server run mode |
| `DB_HOST` | `localhost` | MySQL Server Hostname |
| `DB_PORT` | `3306` | MySQL Port |
| `DB_USER` | `root` | Database User |
| `DB_PASSWORD` | *(empty)* | Database Password |
| `DB_NAME` | `thikana_db` | Database Name |
| `JWT_SECRET` | *(32+ chars)* | Access Token Secret Key |
| `JWT_REFRESH_SECRET` | *(32+ chars)* | Refresh Token Secret Key |

### Frontend Environment Variables (`thikana-frontend/.env`)
| Key | Default | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `/api/v1` | Base URL namespace for API calls |

---

## 🚀 Setup & Startup Guide

### Prerequisite
1. Install [Node.js](https://nodejs.org) (v16.0.0 or later)
2. Install and start [MySQL Server](https://dev.mysql.com/downloads/installer/)

---

### Step 1: Database Initialization
1. Log into your MySQL client and create the database:
   ```sql
   CREATE DATABASE thikana_db;
   ```
2. Import the migration files in order (found in `thikana-backend/migrations/`):
   - `001_create_roles.sql`
   - `002_create_users.sql`
   - `003_create_user_profiles.sql`
   - ... *(up to 020_create_analytics_events.sql)*
3. Run the seed data script to populate roles, mock users, and choices:
   - `thikana-backend/seeders/seed.sql`

---

### Step 2: Configure Environment Variables
1. Copy `.env.example` to `.env` in both folders and fill in your details:
   ```bash
   # In thikana-backend
   cp .env.example .env
   
   # In thikana-frontend
   cp .env.example .env
   ```

---

### Step 3: Run the Backend Server
Navigate to the backend directory, install packages, and launch:
```bash
cd thikana-backend
npm install
npm run dev
```
*(The backend binds to `http://localhost:5000`)*

---

### Step 4: Run the Frontend Client
In a new terminal window, navigate to the frontend directory, install dependencies, and start the development server:
```bash
cd thikana-frontend
npm install
npm run dev
```
*(Vite development client runs on `http://localhost:3000`)*

---

## 📡 API Documentation Reference

All requests must conform to the base namespace `/api/v1`. Authenticated requests require a `Authorization: Bearer <accessToken>` header.

### 1. Authentication Endpoints (`/api/v1/auth`)
*   `POST /register`: Registers a new Tenant, Owner, or Agency user.
*   `POST /login`: authenticates email/password and returns JWT Access & Refresh tokens.
*   `POST /refresh`: Uses a valid Refresh Token to rotate Access & Refresh tokens.
*   `POST /logout` *(Auth required)*: Invalidates token session.
*   `POST /forgot-password` / `POST /reset-password`: Password recovery flow mocks.

### 2. Property Listings (`/api/v1/properties`)
*   `GET /`: Queries all active listings. Supports pagination (`page`, `limit`), sorting (`created_at`, `price_asc`, `price_desc`, `views`), search text keywords, and filters (city, zone, type, beds, baths, price range, amenities).
*   `GET /:id`: Retrieves complete details of a single property listing (adds views to analytics).
*   `POST /` *(Auth required; Owner/Agency/Admin only)*: Creates a property listing (supports `multipart/form-data` uploads).
*   `PATCH /:id` *(Auth required; Listing Owner/Admin only)*: Updates listing details.
*   `DELETE /:id` *(Auth required; Listing Owner/Admin only)*: Deletes a listing.

### 3. Favorites (`/api/v1/favorites`)
*   `GET /` *(Auth required)*: Lists logged-in user's bookmark list.
*   `POST /:propertyId` *(Auth required)*: Bookmarks a property.
*   `DELETE /:propertyId` *(Auth required)*: Removes property from bookmarks.

### 4. Conversations & Messaging (`/api/v1/conversations`)
*   `GET /` *(Auth required)*: Lists user conversations (including partner name, avatar, last message, and unread counts).
*   `POST /` *(Auth required)*: Starts a conversation mapping to a property.
*   `GET /:id/messages` *(Auth required)*: Retrieves conversation message history.
*   `POST /:id/messages` *(Auth required)*: Sends a message.

### 5. Reviews (`/api/v1/properties/:propertyId/reviews`)
*   `GET /`: Retrieves rating reviews list and summary average rating for a property.
*   `POST /` *(Auth required; Non-owners only)*: Submits a rating (1-5 stars) and comments.
*   `PATCH /reviews/:id` *(Auth required; Author/Admin only)*: Updates review comments or score.
*   `DELETE /reviews/:id` *(Auth required; Author/Admin only)*: Deletes a review.

### 6. Verification (`/api/v1/verification`)
*   `GET /me` *(Auth required)*: Checks verification status (`pending`, `approved`, `rejected`).
*   `POST /submit` *(Auth required)*: Submits NID or Trade License documents (`multipart/form-data`).

### 7. Agreements (`/api/v1/agreements`)
*   `GET /` *(Auth required)*: Lists rental agreements related to the user.
*   `POST /` *(Auth required; Owner/Agency only)*: Drafts a rental agreement for a tenant.
*   `GET /:id` *(Auth required)*: Fetches detailed terms of an agreement.
*   `PATCH /:id/status` *(Auth required; Tenant only)*: Accept or reject a pending agreement terms.

### 8. Payments (`/api/v1/payments`)
*   `GET /` *(Auth required)*: Fetches user's billing invoice ledger.
*   `POST /mock` *(Auth required)*: Generates a mock billing invoice.
*   `PATCH /:id/status` *(Auth required)*: Completes mock invoice payment transaction (Nagad/bKash).

### 9. Moderation Reports (`/api/v1/reports`)
*   `POST /`: Submits a moderation report ticket for fraud, spam, or fake listings.

### 10. Admin Endpoints (`/api/v1/admin`) *(Admin only)*
*   `GET /dashboard`: Fetches platform statistics (total users, properties, tickets).
*   `GET /verifications`: Lists pending identity verifications.
*   `PATCH /verifications/:id/approve` / `PATCH /verifications/:id/reject`: Moderates verification requests.
*   `GET /users`: Lists all system accounts.
*   `PATCH /users/:id/status`: Suspends/activates user accounts.
*   `PATCH /properties/:id/status`: Approves pending listings or deactivates active ones.
*   `GET /reports`: Lists user report tickets.
*   `PATCH /reports/:id`: Resolves/dismisses report tickets.
*   `GET /audit-logs`: Retrieves system administrative audit trail.
