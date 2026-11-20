# SalesFlow — Enterprise CRM & Sales Pipeline Management

SalesFlow is an enterprise-grade Customer Relationship Management (CRM) and sales acceleration platform. It empowers sales teams and managers to track prospective leads, manage multi-stage visual sales pipelines, maintain customer account histories, log audited interactions, and analyze real-time revenue performance.

Built as a modern, decoupled full-stack architecture featuring a **Node.js & Express REST API** connected to a live **MongoDB Atlas** cluster, paired with a responsive **React 19 & Vite** frontend.

---

## 🌟 Key Features

### 1. Executive Analytics Dashboard
- **Key Metrics (KPIs)**: Total Leads, Active Converted Accounts, Pipeline Deal Value, Closed Won Revenue, and Conversion Rate.
- **Visual Analytics**: Interactive Recharts displaying leads breakdown by pipeline stage and marketing acquisition source.
- **Live Feed**: Recent prospective leads and audited interaction activity logs.

### 2. Lead Management
- **Full CRUD Support**: Add, view, edit, and delete leads with form validation.
- **Search & Filter**: Real-time search across lead names, companies, and emails; filter by stage and acquisition channel.
- **Stage Progression**: Inline quick stage update dropdown per row.
- **Auditing**: Automatically logs an activity entry whenever a new lead is created or a status change occurs.

### 3. Visual Sales Pipeline (Kanban Board)
- **7-Stage Workflow**: *New Lead*, *Contacted*, *Qualified*, *Proposal Sent*, *Negotiation*, *Closed Won*, *Closed Lost*.
- **Stage Metrics**: Total opportunity counts and aggregate dollar values per column.
- **Single-Click Transitions**: Easily advance or step back deals across pipeline stages.

### 4. Customer Directory & Lifetime Value
- **Account Tracking**: Comprehensive client records with company, email, phone, and account notes.
- **Revenue Intelligence**: Tracks total deals and customer Lifetime Value (LTV).
- **Status Categories**: *Active*, *Inactive*, *Prospect*, and *Churned*.

### 5. CRM Activity Timeline
- **Interaction Logging**: Track Calls, Meetings, Emails, Notes, and Tasks.
- **Entity Association**: Link activities directly to specific leads or customer accounts.
- **Category Filtering**: Filter timeline by activity type.

### 6. Authentication & Role-Based Access Control (RBAC)
- **JWT Authentication**: JSON Web Tokens with expiration and secure session storage.
- **Password Security**: Salted hashing with `bcryptjs` (10 rounds).
- **Role Permissions**:
  - `admin`: Full unrestricted access, user reassignment, and customer deletion.
  - `employee`: Access to manage leads, log activities, and update pipeline deals. Deleting customer records is restricted to Admins.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router DOM v7, Axios, Recharts, Lucide React, CSS3 Design Tokens |
| **Backend** | Node.js (CommonJS), Express.js v5, Mongoose ODM |
| **Database** | MongoDB Atlas (Cloud Cluster) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **Environment** | `dotenv`, CORS |

---

## 🏗 Architecture & Design System

### Design Theme
- **Background**: Pure white (`#ffffff`) and soft slate (`#f8fafc`).
- **Primary Accents**: Light blue accents (`#0284c7`, `#38bdf8`, `#e0f2fe`).
- **Sidebar**: Deep enterprise navy (`#0f172a`, `#1e293b`).
- **Typography**: Inter font with structured hierarchy, rounded cards, and subtle elevation shadows.

### Project Structure
```text
salesflow/
├── SalesFlow/
│   ├── backend/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB Atlas connection & URI sanitizer
│   │   ├── controllers/
│   │   │   ├── authController.js     # User registration, login, profile, user listing
│   │   │   ├── leadController.js     # Lead CRUD & automated activity triggers
│   │   │   ├── customerController.js # Customer account operations & RBAC rules
│   │   │   ├── activityController.js # Activity logging & timeline filtering
│   │   │   └── dashboardController.js# Aggregated pipeline metrics & revenue stats
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification (protect) & role authorization (authorize)
│   │   │   └── errorHandler.js       # Centralized error handler & 404 handler
│   │   ├── models/
│   │   │   ├── User.js               # User model with role ('admin' | 'employee')
│   │   │   ├── Lead.js               # Lead model with dealValue & pipeline status
│   │   │   ├── Customer.js           # Customer model with LTV & contract metrics
│   │   │   └── Activity.js           # Audited activity log model
│   │   ├── routes/                   # Express routers
│   │   ├── .env                      # Local environment configuration (Excluded from Git)
│   │   ├── .env.example              # Environment variables template
│   │   ├── package.json
│   │   └── server.js                 # Backend entry point
│   └── frontend/
│       ├── src/
│       │   ├── api/                  # Axios instance and API service modules
│       │   ├── components/           # Sidebar, Navbar, StatCard, DataTable, Modal, etc.
│       │   ├── context/              # AuthContext & ToastContext providers
│       │   ├── pages/                # Login, Register, Dashboard, Leads, Pipeline, Customers, etc.
│       │   ├── App.jsx               # Lazy-loaded routes & protected route wrappers
│       │   ├── index.css             # Unified enterprise design system
│       │   └── main.jsx
│       ├── package.json
│       └── vite.config.js
├── .gitignore                        # Root git exclusions (.env, node_modules, dist)
└── README.md                         # Documentation
```

---

## ⚙️ Environment Setup

Create a `.env` file in `SalesFlow/backend/` using `SalesFlow/backend/.env.example` as a template:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/salesflow?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```

> [!NOTE]
> Ensure special characters in your MongoDB Atlas password are URL-encoded and angle brackets `<>` are omitted.

---

## 🚀 Installation & Running

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: MongoDB Atlas cloud cluster or local MongoDB instance

### 2. Backend Setup
```powershell
# Navigate to the backend directory
cd SalesFlow/backend

# Install dependencies
npm install

# Start development server (with nodemon auto-reload)
npm run dev

# Or start in production mode
npm start
```
The backend API starts on `http://localhost:5000`.

### 3. Frontend Setup
```powershell
# In a new terminal, navigate to the frontend directory
cd SalesFlow/frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev

# Or build for production
npm run build
```
Open `http://localhost:5173` in your browser.

---

## 📡 API Endpoints Reference

### Public Routes
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint |
| `POST` | `/api/auth/register` | Register new user (`admin` or `employee`) |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token |

### Protected Routes (Requires `Authorization: Bearer <token>`)
| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `GET` | `/api/auth/me` | Fetch logged-in user profile |
| **Auth** | `GET` | `/api/auth/users` | List users for deal assignment |
| **Dashboard** | `GET` | `/api/dashboard` | Aggregated analytics & status breakdown |
| **Leads** | `GET` | `/api/leads` | List leads (supports `search`, `status`, `source`) |
| **Leads** | `POST` | `/api/leads` | Create new lead (auto-logs activity) |
| **Leads** | `GET` | `/api/leads/:id` | Fetch lead details |
| **Leads** | `PUT` | `/api/leads/:id` | Update lead fields or stage |
| **Leads** | `DELETE` | `/api/leads/:id` | Delete lead (Admin or Assigned Rep) |
| **Customers** | `GET` | `/api/customers` | List customer accounts |
| **Customers** | `POST` | `/api/customers` | Create new customer account |
| **Customers** | `GET` | `/api/customers/:id` | Fetch customer details |
| **Customers** | `PUT` | `/api/customers/:id` | Update customer details |
| **Customers** | `DELETE` | `/api/customers/:id` | Delete customer account (*Admin only*) |
| **Activities** | `GET` | `/api/activities` | List activities (supports `type`, `lead`, `customer`) |
| **Activities** | `POST` | `/api/activities` | Log CRM activity |
| **Activities** | `DELETE` | `/api/activities/:id` | Delete activity record |

---

## 📸 Screenshots

*(Placeholder slots for repository preview assets)*

| Executive Dashboard | Sales Pipeline (Kanban) |
|---|---|
| `![Dashboard](docs/screenshots/dashboard.png)` | `![Pipeline](docs/screenshots/pipeline.png)` |

| Leads Management | Customer Directory |
|---|---|
| `![Leads](docs/screenshots/leads.png)` | `![Customers](docs/screenshots/customers.png)` |

---

## 🛡 Security & Audit Compliance
- **Zero Exposed Secrets**: `.env` and all credential stores are strictly excluded from version control.
- **Centralized Error Handling**: Standardized `{ success: false, message: ... }` responses for duplicate keys, malformed IDs (`CastError`), validation errors, and token expirations.
- **Production Build Ready**: Frontend compiles cleanly with code splitting and zero build errors.
