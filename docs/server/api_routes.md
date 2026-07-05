# Server: API Routes (Business Logic)

This document explains the controllers located in `server/routes/`. These files handle the core business logic of the application.

## 1. `auth.js`
This file handles authentication endpoints.

### `POST /api/auth/login`
**Logic Flow**:
1. Extracts `username` and `password` from the incoming JSON body.
2. Queries the database: `User.findOne({ username: username.toLowerCase() })`. We force lowercase to prevent case-sensitivity login bugs.
3. If the user isn't found, we return a `401 Unauthorized`. (Note: We explicitly *do not* say "Username not found" for security reasons. We say "Invalid credentials" so attackers can't guess valid usernames).
4. Calls the `user.comparePassword()` method (defined in the Model). If false, returns `401`.
5. **JWT Generation**: If true, we create a JSON Web Token. The payload contains the user's `id` and `role`. We sign it using our `JWT_SECRET` and set it to expire in 1 day (`expiresIn: '1d'`).
6. Returns the token and user object to the client.

### `GET /api/auth/me`
**Logic Flow**:
This route is protected by the `authenticate` middleware. When a user opens a new tab, the frontend sends a request here with their stored JWT.
1. The middleware parses the JWT. If valid, it attaches `req.user` to the request object.
2. The route controller simply takes `req.user.id`, queries the database for that user (excluding the password field via `.select('-password')`), and returns the user object. This silently logs the user back in.

## 2. `products.js`
This file handles all product inventory logic. It is highly complex because it handles pagination, dynamic querying, and data aggregation.

### `GET /api/products` (The Listing Module)
**Logic Flow**:
1. Extracts variables from the URL query string: `page`, `limit`, `search`, `category`, `sort`, `order`.
2. Constructs a dynamic MongoDB query object (`const query = {}`).
3. **Role-Based Filtering**: It checks `req.user.role`. If the user is NOT an admin, it forcefully injects `query.isPublished = true`. This guarantees users cannot fetch hidden products.
4. **Search Logic**: If a `search` term exists, it adds a regex query: `{ title: { $regex: search, $options: 'i' } }` (case-insensitive fuzzy matching).
5. **Category Logic**: If `category` exists, it uses the `$in` operator. The frontend might send `category=Beauty,Laptops`. We split this string into an array and query for products that match *any* of those categories.
6. **Execution**: We execute two queries simultaneously using `Promise.all()`:
   - `Product.countDocuments(query)`: Finds the total number of items matching the filters (required for calculating the total number of pages).
   - `Product.find(query).sort(...).skip(...).limit(...)`: Fetches the actual chunk of data for the current page.

### `GET /api/products/analytics/summary`
This route is protected by the `requireAdmin` middleware.
**Logic Flow**:
Instead of using `.find()` and looping through arrays in JavaScript, we use MongoDB's `aggregate()` pipeline. This runs native C++ code inside the database engine, which is exponentially faster.
1. **Total Products & Averages**: We use `$group` with `_id: null` to calculate the total sum and the mathematical average of the `rating` field.
2. **Category Distribution**: We group by `_id: "$category"` and use `$sum: 1` to count how many products belong to each category.
3. **Price Ranges**: We use the powerful `$bucket` operator. We define boundaries (0, 25, 50, 100, 250, 500, 1000, 5000) and tell MongoDB to drop every product into these buckets based on their `price` field.
4. **Stock Status**: We group by a conditional statement (`$cond`) that evaluates the `stock` integer and returns strings like "In Stock", "Low Stock", or "Out of Stock".

### `PATCH /api/products/:id/toggle-publish`
This route allows admins to soft-delete products.
**Logic Flow**:
1. Finds the product by ID.
2. Flips the boolean: `product.isPublished = !product.isPublished`.
3. Saves the product back to the database.
