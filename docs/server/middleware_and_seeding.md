# Server: Middleware & Seeding

This document explains the security middleware that protects our routes and the seeding logic used to bootstrap the database.

## 1. `middleware/auth.js`
Middleware functions sit between the incoming request and the final route controller. They act as bouncers.

### `authenticate` Middleware
**Goal**: Ensure the user has a valid JSON Web Token.
**Logic Flow**:
1. Looks for the `Authorization` header in the incoming request.
2. Checks if it starts with "Bearer ".
3. Extracts the token string. If missing, immediately returns `401 Unauthorized`.
4. Uses `jwt.verify(token, process.env.JWT_SECRET)`.
   - If the token was tampered with, or if it has expired, this function throws an error, which the `catch` block intercepts, returning `401`.
5. If valid, the JWT payload (which contains `{ id, role }`) is decoded.
6. We fetch the user from the database using that `id` to ensure the user hasn't been deleted since the token was issued.
7. We attach the user object to `req.user = user` and call `next()`. This passes control to the actual route controller, which can now securely access `req.user`.

### `requireAdmin` Middleware
**Goal**: Ensure the user has administrative privileges.
**Logic Flow**:
1. This middleware is always placed *after* the `authenticate` middleware in the route definition (`router.get(..., authenticate, requireAdmin, ...)`).
2. Because it runs after, we are guaranteed that `req.user` already exists.
3. It simply checks: `if (req.user.role !== 'admin')`.
4. If they aren't an admin, it returns `403 Forbidden` (meaning "You are authenticated, but you do not have permission to do this").
5. Otherwise, it calls `next()`.

## 2. `seed.js`
The seeding script is a standalone Node script used to rapidly populate the database for development and testing.

**Logic Flow**:
1. **DB Connection**: Connects to MongoDB using `process.env.MONGO_URI`.
2. **User Creation**: 
   - Checks if users already exist (`User.countDocuments()`).
   - If 0, it creates two default users: an `admin` and a `user`.
   - *Design Decision*: We pass plain text passwords here (`'admin123'`), because our Mongoose `pre('save')` hook automatically catches them and hashes them before inserting them into the database!
3. **Fetching External Data**:
   - We make an HTTP GET request to `https://dummyjson.com/products?limit=0` to fetch real-world JSON product data.
4. **Data Transformation**:
   - The DummyJSON data doesn't have an `isPublished` field. 
   - We map over the array of products: `products.map(p => ({ ...p, isPublished: true }))`, injecting our custom field into every item.
5. **Bulk Insertion**:
   - We wipe the existing `products` collection via `Product.deleteMany({})` to prevent duplicates if the seed script is run multiple times.
   - We insert the transformed array via `Product.insertMany()`.
6. **Graceful Exit**: Once finished, it forcefully closes the database connection (`mongoose.connection.close()`) so the Node script doesn't hang indefinitely in the terminal.
