# Feature Implementation Logic & Design Decisions

This document explains **how** and **why** specific features were implemented the way they were, focusing strictly on the logic, the libraries chosen, and the edge cases considered. 

## 1. Authentication & Role-Based Access Control (RBAC)
**Goal**: Secure the dashboard, providing distinct views for Users and Admins.
**Libraries Used**: `jsonwebtoken` (JWT), `bcryptjs` (Hashing).
**Logic Flow**:
- Passwords are never stored in plain text. Mongoose hooks use `bcrypt` to salt and hash passwords before saving.
- On login, the server compares hashes. If valid, it generates a JWT containing the user's `id` and `role`.
- The frontend stores this JWT in `localStorage` and loads it into a React Context (`AuthContext`).
- We built a centralized `api.js` wrapper class. Its sole logical purpose is to intercept every outgoing `fetch` request and inject the `Authorization: Bearer <token>` header.
- **Edge Case Handled**: If the user leaves the tab open for days and the token expires, the next API call returns a `401`. The `api.js` wrapper intercepts this, wipes `localStorage`, and throws the user back to the login screen, preventing the app from getting stuck in a broken state.

## 2. Advanced Product Filtering & Search
**Goal**: Allow users to instantly sift through hundreds of products without locking up the UI.
**Logic Flow**:
- **Backend Querying**: We use MongoDB's `$regex` for fuzzy searching the product `title` (case-insensitive). For categories, we use the `$in` operator to allow multi-select filtering (e.g., show me "Beauty" AND "Fragrances").
- **Frontend URL Sync**: To ensure users can share links or refresh the page without losing their place, the frontend state doesn't live in `useState`—it lives in the URL. We read and write to the URL using React Router's `useSearchParams`. 
- **Debouncing (Performance)**: We wrote a custom `useDebounce` hook. If a user types "S-m-a-r-t-p-h-o-n-e", we don't want to send 10 API requests. The logic uses a `setTimeout` that clears and resets on every keystroke. It only fires the API call when the user stops typing for 300 milliseconds.

## 3. Analytics & Aggregation
**Goal**: Show meaningful KPIs and charts to Admins.
**Libraries Used**: `recharts` (React charting library), `mongoose` (Aggregation Pipeline).
**Logic Flow**:
- Calculating totals (like average rating across all products or total inventory value) in JavaScript would require downloading the entire database to the client. This is terribly inefficient.
- **Backend**: We use MongoDB Aggregation Pipelines (`$group`, `$sum`, `$avg`, `$bucket`). The heavy lifting and math are done inside the database engine. We send back just a tiny JSON object with the final computed numbers.
- **Frontend**: We feed these arrays into Recharts. We use React's `useMemo` heavily here to transform the raw backend data into the exact `{ name, value }` shapes Recharts expects, ensuring this math only runs when the API data actually changes, not on every component re-render.
- **Edge Case Handled**: Empty states. If all products are deleted, the aggregation pipeline returns empty arrays. The frontend gracefully defaults to `0` or empty charts instead of crashing due to `undefined` errors.

## 4. Column Customization (Dynamic Tables)
**Goal**: Allow admins to declutter their table view by hiding irrelevant columns.
**Logic Flow**:
- We maintain an array of objects representing columns: `[{ id: 'price', label: 'Price', visible: true }, ...]`.
- This array dictates what the `<table/>` renders.
- The `ColumnCustomizer` component maps over this array, rendering checkboxes. When a user toggles a checkbox, we clone the array, update the `visible` boolean for that specific ID, and update state.
- **Drag-and-Drop Reordering**: When a user drags a column name up or down, we capture the drag start index and the drop target index, splice the array to remove the item, and insert it at the new index. The table instantly re-renders in the new order.

## 5. Real-Time Updates (Polling)
**Goal**: Keep inventory numbers fresh without full page reloads.
**Logic Flow**:
- WebSockets are overkill for a simple dashboard update. We opted for Short Polling.
- We created a `usePolling` custom hook. It takes a callback function and an interval (30 seconds).
- **Edge Case Handled (Memory Leaks)**: The critical logic in this hook is the `useEffect` cleanup function `return () => clearInterval(timer)`. If the user navigates away from the products page, the interval is destroyed. Without this, the app would spawn infinite ghost network requests in the background.

## 6. Frontend Performance Architecting
**Goal**: Ensure the app feels snappy even on low-end devices.
**Libraries Used**: React's built-in `React.lazy`, `Suspense`, `useMemo`, `useCallback`, `React.memo`.
**Logic Flow**:
- **Code Splitting**: We wrapped our route components in `React.lazy`. Instead of users downloading the entire app (Analytics charts, product carousels) just to view the Login page, the browser only downloads the specific Javascript required for the current screen.
- **Re-render Prevention**: In the product grid, if you favorite one item, you don't want the other 50 items to re-render. We wrap `ProductCard` and `ProductRow` in `React.memo()`. This tells React: "Unless the exact `product` prop object changes, do not redraw this DOM node."
- To make `React.memo` work, we must wrap our toggle functions in `useCallback()`, ensuring the function's memory address doesn't change on every render, which would break the memoization.
