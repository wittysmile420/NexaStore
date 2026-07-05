# NexaStore Admin Dashboard

> A powerful, highly-performant, and visually stunning MERN stack (MongoDB, Express, React, Node.js) admin dashboard tailored for robust product inventory management, comprehensive analytics, and seamless administrative control.

---

## 🌟 Overview

NexaStore is a modern web application designed from the ground up to solve complex e-commerce inventory challenges. Featuring a fully decoupled architecture, the dashboard provides blazing-fast data retrieval, intuitive user interfaces built with glassmorphism aesthetics, and role-based access control to ensure secure data management.

This project was engineered with a heavy focus on **performance**, **security**, and **user experience**.

---

## ✨ Key Features

- **🔐 Role-Based Access Control (RBAC)**: Secure JWT-based authentication. Two distinct tiers of users: `Admin` (full system control, analytics access, publish toggling) and `User` (read-only access to published inventory).
- **📦 Advanced Product Management**: 
  - Dynamic **List & Grid views** to navigate hundreds of items.
  - Multi-category filtering, granular sorting mechanisms, and server-side pagination.
- **📊 Real-Time Analytics Dashboard**: Four core KPI tracking cards and Recharts-powered data visualization (Donut charts for categories, Bar charts for prices/ratings, Pie charts for stock levels).
- **🎠 Interactive Product Details**: Deep-dive product views featuring auto-playing image carousels, full specifications grids, and aggregated customer reviews.
- **⚡ Peak Performance Optimization**: 
  - Debounced search inputs (300ms) to prevent database overloading.
  - Extensive use of React's memoization (`React.memo`, `useMemo`, `useCallback`) to guarantee 60fps scrolling and type-responsiveness.
  - Route-level code splitting (`React.lazy`) for lightning-fast initial load times.
- **🔗 URL State Synchronization**: All complex filters and active pages are mirrored in the browser's URL, making every specific dashboard state bookmarkable and shareable.
- **🎛️ Dynamic Column Customization**: Drag-and-drop table headers allowing administrators to hide, show, and reorganize data columns on the fly.
- **📡 Background Polling**: Automated short-polling intervals (30s) keeping inventory data fresh without requiring manual page refreshes.

---

## 🛠️ Technology Stack

**Frontend (Client)**
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Data Visualization**: Recharts
- **Styling**: Pure CSS (Custom Design System utilizing CSS Variables, Flexbox/Grid, and modern glassmorphism UI/UX trends)

**Backend (Server)**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs (password hashing)
- **Database**: MongoDB (via Mongoose ODM)

---

## 🚀 Getting Started

Follow these steps to run the NexaStore Dashboard locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance running on port 27017, or a MongoDB Atlas URI)
- Git

### 1. Database & Backend Setup
```bash
# Navigate to the backend directory
cd server

# Install dependencies
npm install

# Seed the database (Fetches ~200 products from DummyJSON and creates default users)
npm run seed

# Start the development server (runs on http://localhost:5000)
npm run dev
```

### 2. Frontend Setup
```bash
# Open a new terminal and navigate to the frontend directory
cd client

# Install dependencies
npm install

# Start the Vite development server (runs on http://localhost:5173)
npm run dev
```

### Default Credentials
Use these pre-seeded accounts to explore the dashboard:
| Role | Username | Password | Privileges |
|------|----------|----------|------------|
| **Admin** | `admin` | `admin123` | Full access. Can view analytics, soft-delete products, and view all items. |
| **User** | `user` | `user123` | Restricted access. Can only view published products. No analytics access. |

---

## 📚 Deep-Dive Documentation

This project contains heavily detailed documentation breaking down every architectural choice, logical flow, and component structure. 

Explore the `docs/` directory to understand the engine under the hood:
- [Project Architecture & Logic](./docs/project/)
- [Backend (Node/Express) LLD](./docs/server/)
- [Frontend (React) Components & State](./docs/client/)