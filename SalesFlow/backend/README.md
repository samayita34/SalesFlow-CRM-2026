# SalesFlow Backend

The backend service for **SalesFlow CRM**, built with Express.js, MongoDB (Mongoose), JWT authentication, and role-based access control.

---

## 🛠 Tech Stack

- **Runtime**: Node.js (CommonJS)
- **Framework**: Express.js (v5)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs for password hashing
- **Environment Management**: dotenv
- **CORS Support**: cors

---

## 📂 Project Structure

```text
SalesFlow/backend/
├── config/
│   └── db.js                 # MongoDB connection logic
├── controllers/
│   ├── authController.js     # User registration, login, and user queries
│   ├── leadController.js     # Lead CRUD operations & status updates
│   ├── customerController.js # Customer CRUD operations
│   ├── activityController.js # Activity log creation, retrieval, and deletion
│   └── dashboardController.js# Aggregated analytics and CRM metrics
├── middleware/
│   ├── auth.js               # JWT verification & role-based authorization (admin, employee)
│   └── errorHandler.js       # Centralized error handler & 404 handler
├── models/
│   ├── User.js               # User schema (name, email, password, role)
│   ├── Lead.js               # Lead schema (name, email, phone, company, source, status, assignedTo, dealValue)
│   ├── Customer.js           # Customer schema (name, email, phone, company, status, totalDeals, totalSpent, etc.)
│   └── Activity.js           # Activity log schema (type, title, description, lead, customer, performedBy)
├── routes/
│   ├── authRoutes.js         # /api/auth routes
│   ├── leadRoutes.js         # /api/leads routes
│   ├── customerRoutes.js     # /api/customers routes
│   ├── activityRoutes.js     # /api/activities routes
│   └── dashboardRoutes.js    # /api/dashboard routes
├── .env                      # Local environment configuration
├── .env.example              # Environment variable template
├── package.json              # Project dependencies and npm scripts
└── server.js                 # Main server entrypoint
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend` folder (or copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/salesflow
JWT_SECRET=salesflow_super_secret_jwt_key_2026_dev_prod
JWT_EXPIRES_IN=7d
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ installed
- **MongoDB**: Running locally at `mongodb://127.0.0.1:27017` or a remote MongoDB Atlas connection string.

### 2. Install Dependencies
Navigate into the `SalesFlow/backend` directory:
```bash
cd SalesFlow/backend
npm install
```

### 3. Start MongoDB
Ensure MongoDB daemon is running locally:
```bash
# Windows (if installed as a service)
net start MongoDB
# Or run mongod directly
mongod --dbpath "C:\data\db"
```

### 4. Run Server
- **Development mode (with nodemon auto-reload)**:
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm start
  ```

Server will be running on `http://localhost:5000`.

---

## 📡 API Reference

### Health Check
- `GET /api/health` - Check server status

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user
  - Body: `{ "name": "Admin User", "email": "admin@salesflow.com", "password": "password123", "role": "admin" }`
  - Roles allowed: `'admin'`, `'employee'` (defaults to `'employee'`)
- `POST /api/auth/login` - Authenticate and get JWT token
  - Body: `{ "email": "admin@salesflow.com", "password": "password123" }`
- `GET /api/auth/me` - Get current logged-in user details (Bearer Token required)
- `GET /api/auth/users` - Get list of users for assignment (Bearer Token required)

### Leads (`/api/leads`) *(Bearer Token Required)*
- `GET /api/leads` - List leads (Supports query parameters: `status`, `source`, `assignedTo`, `search`, `mine=true`, `sortBy`, `sortOrder`)
- `POST /api/leads` - Create a new lead
  - Body:
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@acmecorp.com",
      "phone": "+1-555-0199",
      "company": "Acme Corp",
      "source": "Website",
      "status": "New",
      "dealValue": 15000,
      "assignedTo": "<userId>"
    }
    ```
- `GET /api/leads/:id` - Get lead by ID
- `PUT /api/leads/:id` - Update lead by ID (automatically logs an activity on status change)
- `DELETE /api/leads/:id` - Delete lead (Admins can delete any; employees can delete assigned leads)

### Customers (`/api/customers`) *(Bearer Token Required)*
- `GET /api/customers` - List customers (Supports `status`, `search`, `sortBy`, `sortOrder`)
- `POST /api/customers` - Create a customer
  - Body:
    ```json
    {
      "name": "John Smith",
      "email": "john@globaltech.com",
      "phone": "+1-555-0123",
      "company": "Global Tech",
      "status": "Active",
      "totalDeals": 2,
      "totalSpent": 25000,
      "leadId": "<optionalLeadId>"
    }
    ```
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer (Admin role only)

### Activities (`/api/activities`) *(Bearer Token Required)*
- `GET /api/activities` - Get activity feed (Filters: `lead`, `customer`, `type`, `limit`)
- `POST /api/activities` - Log a CRM activity (Call, Email, Meeting, Note, Task, Status Change)
- `DELETE /api/activities/:id` - Delete activity (Creator or Admin)

### Dashboard Analytics (`/api/dashboard`) *(Bearer Token Required)*
- `GET /api/dashboard` - Get full analytics summary:
  - `totalLeads`, `totalCustomers`, `totalDealValue`, `wonDealValue`, `pipelineValue`, `conversionRate`, `totalCustomerRevenue`
  - `leadsByStatus` breakdown (counts & values)
  - `leadsBySource` breakdown
  - `recentLeads` (latest 5)
  - `recentActivities` (latest 5)

---

## 🔒 Security & Authorization Details
1. **Passwords**: Hashed with `bcryptjs` (salt rounds: 10) in pre-save Mongoose hook.
2. **JWT**: Includes `id` and `role`, validated on protected routes.
3. **Role-Based Access Control (RBAC)**:
   - `admin`: Has unrestricted access to manage, delete customers, and reassign leads.
   - `employee`: Access to manage leads, view customers, log activities, and delete their assigned leads. Deleting customer records is restricted to admins.
4. **Validation & Errors**: Handled cleanly with standard `{ success: false, message: ... }` responses for duplicate emails, invalid ObjectIds, missing required fields, and expired tokens.
