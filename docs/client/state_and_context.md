# Client: State, API & Routing

This document covers the core frontend shell located in `client/src/`. This includes how the app handles network requests, global state (authentication), and routing.

## 1. `utils/api.js` (The Fetch Wrapper)
Instead of calling `fetch()` manually in 50 different components, we centralized all network logic into a custom `ApiClient` class.

**Why? (Design Decision)**:
- **DRY (Don't Repeat Yourself)**: We don't want to manually append the `Authorization: Bearer <token>` header on every single request. The class method `request()` does this automatically.
- **Global Error Interception**: If a user's token expires, the backend will return a `401 Unauthorized` HTTP status. Instead of handling this in every single React component, `api.js` intercepts it globally.
- **Logic**:
  1. It reads the token from `localStorage`.
  2. It constructs the headers.
  3. It fires the `fetch` request.
  4. If `response.status === 401`, it immediately deletes the tokens from `localStorage` and executes `window.location.href = '/login'`. This acts as a forced, unbreakable logout mechanism for invalid sessions.
  5. It parses the JSON and throws a standard Javascript `Error` if the response was not `ok`. This allows components to use standard `try/catch` blocks.

## 2. `context/AuthContext.jsx`
We use React's Context API to manage the global "Who is logged in?" state.

**Logic Flow**:
1. **Initialization**: When the app boots, it tries to read `nexastore_user` and `nexastore_token` from `localStorage`. If found, the user is instantly logged in (persisted session).
2. **Mount Validation**: In a `useEffect`, it sends a background request to `/api/auth/me`. If the token is valid, it refreshes the user data. If the server says the token is invalid (e.g., deleted from DB), it wipes `localStorage` and logs them out.
3. **Methods**: It exposes `login()` and `logout()` functions. When `login()` is called, it hits the API, saves the resulting token to `localStorage`, and updates the React state, which triggers a global re-render, swapping out the Login page for the Dashboard.
4. **RBAC Variable**: It exports a helpful boolean: `const isAdmin = user?.role === 'admin'`. Components use this to easily hide/show UI elements (like the Analytics link in the sidebar).

## 3. `App.jsx` (Routing & Lazy Loading)
This file handles the React Router definitions.

**Lazy Loading Logic**:
- Instead of `import Login from './pages/Login'`, we use `const Login = lazy(() => import('./pages/Login'))`.
- **Why?**: Performance. Webpack/Vite will split the final JavaScript bundle into multiple smaller files. The browser will only download the `Analytics.jsx` code if the user actually navigates to `/analytics`.
- Because lazy loaded components take a few milliseconds to download over the network, React requires us to wrap the `<Routes>` in a `<Suspense fallback={<PageLoader />}>`. This shows a spinning loader while the file downloads.

**Protected Routes Logic**:
- We don't render the Dashboard directly. We wrap it in a `<ProtectedRoute>` component.
- The `ProtectedRoute` checks the `AuthContext`. 
- If the user is NOT logged in, it returns `<Navigate to="/login" replace />`.
- If a route requires `adminOnly` (like Analytics), it checks the `isAdmin` boolean. If they are a standard user, it kicks them back to `/products`.
