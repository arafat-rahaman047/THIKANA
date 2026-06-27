# THIKANA — Smart Real Estate & Rental Management Platform (Phase 1 Backend)

Thikana is a smart real estate and rental management platform customized for the Bangladesh market. It connects tenants, buyers, property owners, real estate agencies, and system administrators. 

This repository contains the Node.js/Express backend (Phase 1), which implements the database schema, Repository-Service-Controller pattern, JWT-based authentication (access + refresh tokens), and Role-Based Access Control (RBAC).

---

## 🛠️ Tech Stack & Features
- **Core**: Node.js & Express.js
- **Database**: MySQL (with pool connections and standard transactions)
- **Security**: 
  - Password hashing using `bcryptjs`
  - Token-based authentication using short-lived Access Tokens (JWT) & long-lived Refresh Tokens (stored in DB)
  - Security headers using `helmet`
  - Cross-Origin Resource Sharing (`cors`)
  - Rate Limiting on authentication endpoints
- **Validation**: Joi schema validator
- **Logging**: Winston Logger

---

## 📁 Folder Structure
```text
thikana-backend/
├── migrations/
│   ├── 001_create_roles.sql
│   ├── 002_create_users.sql
│   └── 003_create_user_profiles.sql
├── seeders/
│   └── seed.sql
├── src/
│   ├── configs/
│   │   ├── db.js
│   │   └── constants.js
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   ├── role.middleware.js
│   │   └── validate.middleware.js
│   ├── repositories/
│   │   ├── base.repository.js
│   │   └── user.repository.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── index.js
│   ├── services/
│   │   └── auth.service.js
│   ├── utils/
│   │   ├── appError.js
│   │   ├── jwt.util.js
│   │   ├── logger.util.js
│   │   └── response.util.js
│   └── validators/
│       └── auth.validator.js
├── .env.example
├── package.json
├── README.md
└── server.js
```

---

## 🔑 Demo Credentials
The database seeds contain default active users with the following credentials (all have the password `Password@123` or corresponding variations, see SQL seeds. Specifically, we seeded:
- **Admin**: `admin@thikana.com` / `Admin@123`
- **Tenant**: `tenant@thikana.com` / `Tenant@123`
- **Owner**: `owner@thikana.com` / `Owner@123`
- **Agency**: `agency@thikana.com` / `Agency@123`

---

## 🚀 Setup & Installation

### Prerequisite
1. Install [Node.js](https://nodejs.org) (v16.0.0 or later)
2. Install and run [MySQL Server](https://dev.mysql.com/downloads/installer/)

### Step 1: Clone and Navigate
```bash
cd thikana-backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env` and fill in your MySQL details:
```bash
cp .env.example .env
```
Ensure database configurations match your local setup:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=thikana_db
JWT_SECRET=your_jwt_access_secret_key_32_chars_or_more_long
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_32_chars_or_more_long
```

### Step 4: Setup Database & Run Migrations
1. Log into your MySQL CLI or manager:
   ```sql
   CREATE DATABASE thikana_db;
   ```
2. Run the migration SQL files against the database in order:
   - `migrations/001_create_roles.sql`
   - `migrations/002_create_users.sql`
   - `migrations/003_create_user_profiles.sql`
3. Run the seed data SQL to populate roles, demo users, and profiles:
   - `seeders/seed.sql`

*(Alternatively, you can copy-paste the SQL contents into a tool like phpMyAdmin, DBeaver, or MySQL Workbench).*

### Step 5: Start the Server
For development with auto-reloads (requires `nodemon` globally, or runs via package dev scripts):
```bash
npm run dev
```
For production:
```bash
npm start
```

---

## 📡 API Documentation

### Standard Response Format
All endpoints return a standardized JSON format:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### Endpoints List

#### 1. Service Health Check
- **URL**: `GET /api/v1/health`
- **Auth required**: No
- **Response**:
  ```json
  {
    "success": true,
    "message": "THIKANA Backend API Service is active.",
    "data": {
      "uptime": 12,
      "timestamp": "2026-06-21T00:00:00.000Z"
    }
  }
  ```

#### 2. User Registration
- **URL**: `POST /api/v1/auth/register`
- **Auth required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "phone": "01700000000",
    "password": "Password123",
    "role": "tenant",
    "fullName": "Karim Rahman",
    "nidNumber": "1234567890",
    "address": "Dhanmondi, Dhaka",
    "bio": "Searching for a house"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully. Please log in.",
    "data": {
      "id": 5,
      "email": "user@example.com",
      "phone": "01700000000",
      "is_active": 1,
      "is_verified": 0,
      "role": "tenant",
      "full_name": "Karim Rahman",
      "avatar_url": "...",
      "nid_number": "1234567890",
      "address": "Dhanmondi, Dhaka",
      "bio": "Searching for a house",
      "created_at": "...",
      "updated_at": "..."
    }
  }
  ```

#### 3. User Login
- **URL**: `POST /api/v1/auth/login`
- **Auth required**: No
- **Request Body**:
  ```json
  {
    "email": "tenant@thikana.com",
    "password": "Tenant@123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "tokens": {
        "accessToken": "eyJhbGciOi...",
        "refreshToken": "eyJhbGciOi..."
      },
      "user": {
        "id": 2,
        "email": "tenant@thikana.com",
        "phone": "01722222222",
        "is_active": 1,
        "is_verified": 1,
        "role": "tenant",
        "full_name": "Rahim Tenant",
        "avatar_url": "...",
        "nid_number": "2345678901",
        "address": "Gulshan, Dhaka",
        "bio": "Looking for a bachelor apartment in Dhaka",
        "created_at": "...",
        "updated_at": "..."
      }
    }
  }
  ```

#### 4. Token Refresh
- **URL**: `POST /api/v1/auth/refresh`
- **Auth required**: No
- **Request Body**:
  ```json
  {
    "refreshToken": "eyJhbGciOi..."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Access token refreshed successfully.",
    "data": {
      "accessToken": "new_eyJhbGciOi...",
      "refreshToken": "new_eyJhbGciOi..."
    }
  }
  ```

#### 5. User Logout
- **URL**: `POST /api/v1/auth/logout`
- **Auth required**: Yes (Bearer Token in Authorization header)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logout successful. Refresh token invalidated.",
    "data": null
  }
  ```

#### 6. Password Reset Placeholders
- **URL**: `POST /api/v1/auth/forgot-password` (Body: `{ "email": "..." }`)
- **URL**: `POST /api/v1/auth/reset-password` (Body: `{ "token": "...", "password": "..." }`)
- **Response (200 OK)**: Mock success messages.

---

### 🏡 Property Management Endpoints

#### 7. Create Property Listing
- **URL**: `POST /api/v1/properties`
- **Auth required**: Yes (Bearer Token in Authorization header)
- **Role required**: `owner`, `agency`, or `admin`
- **Request Type**: `multipart/form-data`
- **Request Fields**:
  - `typeId` (Number, required)
  - `zoneId` (Number, required)
  - `title` (String, required, min 5)
  - `description` (String, required, min 10)
  - `price` (Number, required, positive)
  - `bedrooms` (Number, required)
  - `bathrooms` (Number, required)
  - `areaSqft` (Number, required)
  - `address` (String, required)
  - `city` (String, required)
  - `latitude` (Number, optional)
  - `longitude` (Number, optional)
  - `listingType` (String, required: `rent`/`sale`/`sublet`/`office`/`bachelor`)
  - `isFurnished` (Number, optional: `0` or `1`)
  - `status` (String, optional: defaults to `pending`)
  - `amenities` (Array of Numbers or comma-separated string, optional: e.g. `[1, 2]`)
  - `images` (Files, optional: up to 10 image files uploaded matching key `images`)
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Property listing created successfully.",
    "data": {
      "id": 1,
      "owner_id": 3,
      "type_id": 1,
      "zone_id": 1,
      "title": "3 BHK Premium Flat in Gulshan",
      "description": "Luxurious flat near the lake...",
      "price": 85000.00,
      "bedrooms": 3,
      "bathrooms": 3,
      "area_sqft": 1800,
      "address": "Road 5, Gulshan 1",
      "city": "Dhaka",
      "listing_type": "rent",
      "status": "pending",
      "is_furnished": 0,
      "created_at": "...",
      "media": [
        { "id": 1, "url": "/uploads/170000-123.png", "is_thumbnail": 1 }
      ],
      "amenities": [
        { "id": 1, "name": "Lift", "description": "..." },
        { "id": 2, "name": "Generator", "description": "..." }
      ]
    }
  }
  ```

#### 8. Update Property Listing
- **URL**: `PATCH /api/v1/properties/:id`
- **Auth required**: Yes
- **Role required**: Listing Owner or `admin`
- **Request Type**: `multipart/form-data`
- **Request Fields**: All fields from creation are optional. You can also append new files via key `images`.
- **Response (200 OK)**: Returns updated property details.

#### 9. Get Property Details by ID
- **URL**: `GET /api/v1/properties/:id`
- **Auth required**: No (If listing is inactive/pending, only owner and admin can fetch it)
- **Behavior**: Retrieves detailed property information, joining amenities and media, and logs a view event in analytics.
- **Response (200 OK)**: Returns detailed property object.

#### 10. List & Search Properties (with paging, filtering, sorting)
- **URL**: `GET /api/v1/properties`
- **Auth required**: No
- **Query Parameters**:
  - `page` (Number, optional, defaults to 1)
  - `limit` (Number, optional, defaults to 10)
  - `sortBy` (String, optional: `created_at` (default), `price_asc`, `price_desc`, `views`)
  - `search` (String, optional: keyword search on title/description/address)
  - `city` (String, optional: exact city name e.g. `Dhaka`)
  - `zoneId` (Number, optional: zone filter)
  - `typeId` (Number, optional: property type filter)
  - `listingType` (String, optional: `rent`/`sale`/`sublet`/`office`/`bachelor`)
  - `priceMin` / `priceMax` (Number, optional: price range filter)
  - `bedrooms` / `bathrooms` (Number, optional: minimum count filter)
  - `isFurnished` (Number, optional: `0` or `1`)
  - `amenities` (Comma-separated numbers or array, optional: e.g. `1,2` - returns listings containing ALL specified amenities)
  - `status` (String, optional, defaults to `active`. Filter by non-active statuses is only authorized for owner/admin)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Properties retrieved successfully.",
    "data": [
      {
        "id": 1,
        "title": "3 BHK Premium Flat in Gulshan",
        "price": 85000.00,
        "bedrooms": 3,
        "bathrooms": 3,
        "area_sqft": 1800,
        "address": "Road 5, Gulshan 1",
        "city": "Dhaka",
        "listing_type": "rent",
        "status": "active",
        "thumbnail_url": "/uploads/170000-123.png",
        "owner_name": "Karim Owner",
        "views_count": 12
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

#### 11. Delete Property Listing
- **URL**: `DELETE /api/v1/properties/:id`
- **Auth required**: Yes
- **Role required**: Listing Owner or `admin`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Property listing deleted successfully.",
    "data": null
  }
  ```

---

### 💖 Favorites Endpoints

#### 12. Add Property to Favorites
- **URL**: `POST /api/v1/favorites/:propertyId`
- **Auth required**: Yes
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Property added to favorites.",
    "data": {
      "favoriteId": 1,
      "userId": 2,
      "propertyId": 1
    }
  }
  ```

#### 13. Fetch User Favorites
- **URL**: `GET /api/v1/favorites`
- **Auth required**: Yes
- **Response (200 OK)**: Returns list of user's favorited properties with types and thumbnails.

#### 14. Remove Property from Favorites
- **URL**: `DELETE /api/v1/favorites/:propertyId`
- **Auth required**: Yes
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Property removed from favorites.",
    "data": null
  }
  ```

---

### 💬 Conversations & Messaging Endpoints

#### 15. Start Conversation
- **URL**: `POST /api/v1/conversations`
- **Auth required**: Yes
- **Request Body**:
  ```json
  {
    "propertyId": 1,
    "messageText": "Hi, is this apartment still available?"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Conversation started successfully.",
    "data": {
      "conversationId": 3,
      "isNew": true
    }
  }
  ```

#### 16. List User Conversations
- **URL**: `GET /api/v1/conversations`
- **Auth required**: Yes
- **Response (200 OK)**: Lists all active chats for user (tenant or owner) with property details, last message, unread count, and partner contact info.

#### 17. Fetch Conversation Message History
- **URL**: `GET /api/v1/conversations/:id/messages`
- **Auth required**: Yes
- **Behavior**: Retrieves messages in chronological order and marks all messages sent by the other participant as read.
- **Response (200 OK)**: Lists messages array.

#### 18. Send Message
- **URL**: `POST /api/v1/conversations/:id/messages`
- **Auth required**: Yes
- **Request Body**:
  ```json
  {
    "messageText": "Yes, it is still open for booking."
  }
  ```
- **Response (201 Created)**: Returns the newly posted message details.

---

### ⭐ Reviews & Ratings Endpoints

#### 19. Submit Property Review
- **URL**: `POST /api/v1/properties/:propertyId/reviews`
- **Auth required**: Yes (Restricted: property owners cannot review their own property)
- **Request Body**:
  ```json
  {
    "rating": 5,
    "comment": "Outstanding place, highly recommended!"
  }
  ```
- **Response (201 Created)**: Returns the review record.

#### 20. Fetch Property Reviews
- **URL**: `GET /api/v1/properties/:propertyId/reviews`
- **Auth required**: No
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Property reviews retrieved successfully.",
    "data": [
      {
        "review_id": 1,
        "rating": 5,
        "comment": "Outstanding place...",
        "reviewer_name": "Rahim Tenant",
        "reviewer_avatar": "..."
      }
    ],
    "meta": {
      "averageRating": "5.0",
      "reviewsCount": 1
    }
  }
  ```

#### 21. Update Review
- **URL**: `PATCH /api/v1/reviews/:id`
- **Auth required**: Yes (Only review author or admin)
- **Request Body**:
  ```json
  {
    "rating": 4,
    "comment": "Actually, updating to 4 stars due to noise issues."
  }
  ```
- **Response (200 OK)**: Returns the updated review record.

#### 22. Delete Review
- **URL**: `DELETE /api/v1/reviews/:id`
- **Auth required**: Yes (Only review author or admin)
- **Response (200 OK)**: Success message.


---

### 🛡️ User Verification Endpoints

#### 23. Submit Verification Request
- **URL**: `POST /api/v1/verification/submit`
- **Auth required**: Yes
- **Request Type**: `multipart/form-data`
- **Request Fields**:
  - `documentType` (String, required: `nid`/`student_id`/`trade_license`)
  - `document` (File, required: document image/PDF matching key `document`)
- **Response (201 Created)**: Success message.

#### 24. Fetch My Verification Status
- **URL**: `GET /api/v1/verification/me`
- **Auth required**: Yes
- **Response (200 OK)**: Returns status details (`pending`/`approved`/`rejected`).

---

### 📜 Rental Agreement Endpoints

#### 25. Draft Rental Agreement
- **URL**: `POST /api/v1/agreements`
- **Auth required**: Yes (Restricted: Landlord/Agency only)
- **Request Body**:
  ```json
  {
    "propertyId": 1,
    "tenantId": 2,
    "rentAmount": 25000,
    "securityDeposit": 50000,
    "startDate": "2026-07-01",
    "endDate": "2027-06-30",
    "terms": "Rent due on 5th of each month..."
  }
  ```
- **Response (201 Created)**: Returns the drafted agreement.

#### 26. List My Agreements
- **URL**: `GET /api/v1/agreements`
- **Auth required**: Yes
- **Response (200 OK)**: Lists all agreements involving user.

#### 27. Fetch Agreement Details
- **URL**: `GET /api/v1/agreements/:id`
- **Auth required**: Yes (Restricted: Tenant, Landlord, or Admin only)
- **Response (200 OK)**: Detailed agreement metadata.

#### 28. Accept / Reject Rental Agreement
- **URL**: `PATCH /api/v1/agreements/:id/status`
- **Auth required**: Yes (Restricted: Tenant only)
- **Request Body**:
  ```json
  {
    "status": "accepted" // Or "rejected"
  }
  ```
- **Response (200 OK)**: Updated agreement details.

---

### 💳 Mock Payment Endpoints

#### 29. Generate Payment Invoice (Mock)
- **URL**: `POST /api/v1/payments/mock`
- **Auth required**: Yes (Restricted: Tenant, Landlord, or Admin only)
- **Request Body**:
  ```json
  {
    "agreementId": 1,
    "amount": 25000,
    "dueDate": "2026-07-05"
  }
  ```
- **Response (201 Created)**: Returns invoice details.

#### 30. Process Payment / Complete Transaction (Mock)
- **URL**: `PATCH /api/v1/payments/:id/status`
- **Auth required**: Yes
- **Request Body**:
  ```json
  {
    "status": "paid",
    "paymentMethod": "Nagad",
    "transactionId": "MOCK-TXN-12345"
  }
  ```
- **Response (200 OK)**: Completed payment details.

#### 31. Fetch Payment Ledger
- **URL**: `GET /api/v1/payments`
- **Auth required**: Yes
- **Response (200 OK)**: Lists all user's payment records.

---

### 🚨 Moderation Reports Endpoints

#### 32. Submit Report
- **URL**: `POST /api/v1/reports`
- **Auth required**: Yes
- **Request Body**: (Must provide exactly one reported target)
  ```json
  {
    "reportedPropertyId": 1,
    "reason": "fake_listing",
    "description": "This property does not exist at the listed address."
  }
  ```
- **Response (201 Created)**: Report log details.

---

### 🔑 Admin Dashboard & Moderation Endpoints (Admin only)
All endpoints require authentication and **Admin** role (JWT token with `role: admin`).

#### 33. Fetch Dashboard Stats
- **URL**: `GET /api/v1/admin/dashboard`
- **Response (200 OK)**: Returns totals of users, properties, active properties, pending verifications, reports, and conversations.

#### 34. List/Update Verification Requests
- **URL**: `GET /api/v1/admin/verifications`
- **URL**: `PATCH /api/v1/admin/verifications/:id/approve` (Approve request)
- **URL**: `PATCH /api/v1/admin/verifications/:id/reject` (Body: `{ "rejectionReason": "..." }`)

#### 35. Moderate User Accounts (Suspend/Activate)
- **URL**: `GET /api/v1/admin/users` (Fetch all users)
- **URL**: `PATCH /api/v1/admin/users/:id/status` (Body: `{ "isActive": 0 }` (suspend) or `1` (activate))

#### 36. Moderate Listings (Approve/Deactivate)
- **URL**: `PATCH /api/v1/admin/properties/:id/status` (Body: `{ "status": "active" }` or `inactive`, `rejected`, etc.)

#### 37. List/Resolve Moderation Reports
- **URL**: `GET /api/v1/admin/reports` (Fetch all reports)
- **URL**: `PATCH /api/v1/admin/reports/:id` (Resolve report. Body: `{ "status": "resolved", "resolutionNotes": "..." }` or `dismissed`, etc.)

#### 38. Moderate Reviews
- **URL**: `GET /api/v1/admin/reviews` (Fetch all reviews)
- **URL**: `DELETE /api/v1/admin/reviews/:id` (Remove review)

#### 39. Fetch Administrative Audit Logs
- **URL**: `GET /api/v1/admin/audit-logs`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Audit logs retrieved successfully.",
    "data": [
      {
        "id": 1,
        "admin_id": 1,
        "action": "VERIFICATION_APPROVE",
        "target_id": 2,
        "details": "{\"targetUserId\":2}",
        "created_at": "2026-06-21T07:23:00.000Z",
        "admin_email": "admin@thikana.com",
        "admin_name": "System Admin"
      }
    ]
  }
  ```




