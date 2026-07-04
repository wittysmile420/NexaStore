# NexaStore Admin Dashboard

A full-stack MERN (MongoDB, Express, React, Node.js) admin dashboard for product management with analytics, authentication, and role-based access control.

## Features

- **🔐 Authentication & RBAC** — JWT-based login with Admin/User roles
- **📦 Product Management** — Grid/table view with search, filters, sorting, pagination
- **📊 Analytics Dashboard** — KPI cards, charts (category, price, rating, stock distribution)
- **🎠 Product Detail** — Image carousel, reviews, full product info
- **🔗 URL State Sync** — All filters reflected in URL
- **⚡ Performance Optimized** — Debounced search, React.memo, useMemo, useCallback, lazy loading
- **📡 Real-time Updates** — Polling every 30 seconds
- **🎛️ Column Customization** — Show/hide and drag-to-reorder columns
- **📱 Fully Responsive** — Desktop, tablet, mobile

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend Setup
```bash
cd server
npm install
npm run seed    # Seed database with products + users
npm run dev     # Start server on :5000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev     # Start Vite on :5173
```

### Default Credentials
| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | admin    | admin123  |
| User  | user     | user123   |

### Access Control
- **User**: Products listing + detail (published only)
- **Admin**: Full access + Analytics + toggle publish/unpublish

## Tech Stack
- **Frontend**: React 18, Vite, React Router v6, Recharts
- **Backend**: Express.js, Mongoose, JWT, bcryptjs
- **Database**: MongoDB
- **API Source**: https://dummyjson.com/products
