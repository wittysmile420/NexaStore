# NexaStore Project Architecture & Hierarchy

This document outlines the overarching architecture of the NexaStore Admin Dashboard, the high-level data flow, and a complete breakdown of the project hierarchy.

## 1. High-Level Architecture (MERN Stack)

The project follows a decoupled client-server architecture using the MERN stack (MongoDB, Express, React, Node.js). 

- **Frontend (Client)**: A React Single Page Application (SPA) built with Vite. It handles all UI rendering, state management (via Context API), routing (via React Router), and URL state synchronization. It communicates exclusively via RESTful HTTP requests.
- **Backend (Server)**: A stateless Node.js/Express API. It handles business logic, authentication (JWT), authorization (Role-Based Access Control), and data aggregation.
- **Database**: MongoDB (NoSQL), accessed via the Mongoose ODM (Object Data Modeling) library. It stores users and product inventories.

### Data Flow Example (Fetching Analytics)
1. User clicks the "Analytics" tab. React Router mounts the `Analytics` component.
2. The component's `useEffect` triggers the `api.get('/products/analytics/summary')` utility.
3. The `api` utility retrieves the JWT from `localStorage` and attaches it to the `Authorization` header.
4. The Express server receives the request. The `auth` middleware intercepts it, verifies the JWT, and extracts the user role.
5. A secondary middleware checks if the user is an `admin`. If yes, the request proceeds to the analytics controller.
6. The controller executes a complex MongoDB Aggregation Pipeline to calculate KPIs (e.g., grouping by category, bucketing by price).
7. MongoDB returns the computed JSON data to the controller.
8. Express responds with a `200 OK` and the JSON payload.
9. React updates its local state, triggering a re-render. Recharts visualizes the new data.

## 2. File Hierarchy Breakdown

```text
Round_0/ (Root)
│
├── docs/                      # Extensive project documentation (you are here)
│   ├── project/               # Overall architecture and feature implementation logic
│   ├── server/                # Backend LLD, routing, and DB logic
│   └── client/                # Frontend component hierarchy and state logic
│
├── server/                    # Backend Repository
│   ├── models/                # Mongoose Schemas (Data Layer)
│   │   ├── Product.js         # Inventory structure and types
│   │   └── User.js            # Admin/User structure with bcrypt password hashing
│   ├── middleware/            # Request Interceptors
│   │   └── auth.js            # JWT validation and RBAC role checking
│   ├── routes/                # Express Controllers (Business Logic)
│   │   ├── auth.js            # Login and session validation endpoints
│   │   └── products.js        # CRUD, pagination, filtering, and aggregation endpoints
│   ├── index.js               # Application entry point, CORS config, DB connection
│   ├── seed.js                # Bootstrap script to fetch DummyJSON and populate DB
│   └── .env                   # Secrets (MONGO_URI, JWT_SECRET, PORT)
│
├── client/                    # Frontend Repository
│   ├── public/                # Static assets (Favicon)
│   ├── src/                   # React Source Code
│   │   ├── components/        # Reusable UI Blocks
│   │   │   ├── Layout/        # Shell components (DashboardLayout, Sidebar, Header)
│   │   │   ├── ColumnCustomizer.jsx # Logic for toggling table columns
│   │   │   ├── Pagination.jsx # Page navigation logic
│   │   │   ├── ProductCard.jsx# Grid view item component (Memoized)
│   │   │   └── ProductRow.jsx # Table view item component (Memoized)
│   │   ├── context/           # Global State Management
│   │   │   └── AuthContext.jsx# Holds current user session and login/logout methods
│   │   ├── hooks/             # Custom React Hooks
│   │   │   ├── useDebounce.js # Delays fast-typing API spam
│   │   │   └── usePolling.js  # Runs background intervals for live data
│   │   ├── pages/             # Route-level Components
│   │   │   ├── Analytics.jsx  # Recharts dashboard for KPIs
│   │   │   ├── Login.jsx      # Authentication form
│   │   │   ├── ProductDetail.jsx # Deep dive view with image carousel
│   │   │   └── Products.jsx   # Core listing module (Search, Filter, Sort, View toggle)
│   │   ├── utils/             # Helper Functions
│   │   │   └── api.js         # Fetch wrapper for automatic JWT injection & 401 handling
│   │   ├── App.jsx            # React Router definitions & Lazy Loading setup
│   │   ├── index.css          # Global Design System (Tokens, Utilities, Animations)
│   │   └── main.jsx           # React DOM render entry
│   ├── index.html             # Main HTML template
│   └── vite.config.js         # Vite bundler config and API proxy setup
│
├── .gitignore                 # Root git ignores
├── package.json               # Not present at root (monorepo style but decoupled)
└── README.md                  # Quick start guide
```

## 3. General Edge Cases Handled Globally

Across both the client and server, we anticipated several system-wide edge cases:
- **Token Expiration / Manipulation**: If a user's JWT expires or is manually tampered with in `localStorage`, the `api.js` fetch wrapper universally catches the HTTP `401 Unauthorized` response, automatically purges the local session, and forces a hard redirect to the `/login` page.
- **Missing or Corrupted Images**: Handled gracefully on the frontend by defining fallback UI states and ensuring image arrays always have at least one element (falling back to a thumbnail).
- **Network Latency & Spams**: The frontend implements a strict `300ms` debounce on text inputs to prevent hammering the backend DB with queries for every single keystroke.
- **Unpublished Products**: Standard users attempting to directly navigate via URL to an unpublished product (`/products/123`) will be met with a 404/Not Found state on the frontend, because the backend explicitly filters out `isPublished: false` for non-admins at the database query level.
