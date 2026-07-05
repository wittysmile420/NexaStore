# Server: Database Models (Mongoose)

This document breaks down the logical structure of our database schemas found in `server/models/`.

## 1. `User.js`
This file defines the schema for administrators and standard users.

### Schema Design
- **username**: Must be unique and required. We enforce `trim: true` to prevent users from registering `"admin "` (with a trailing space) and getting confused during login.
- **password**: Required, but stored as a hash (never plain text).
- **role**: Uses an `enum: ['user', 'admin']`. This acts as a strict database-level guardrail. It is impossible to accidentally create a user with a typo'd role like "admon".
- **timestamps**: Mongoose automatically adds `createdAt` and `updatedAt` fields.

### Password Hashing (Pre-save Hook)
We employ a Mongoose `pre('save')` hook. Before Mongoose ever writes the user document to the database, this function runs.
- **Logic**: It checks if the password field was modified (`this.isModified('password')`). If a user is just updating their avatar, we skip hashing to prevent double-hashing the already hashed password.
- If it is a new password, we use `bcrypt.genSalt(10)` to generate random data (salt), and `bcrypt.hash()` to securely scramble the password.

### Password Comparison Method
We attach a custom instance method `comparePassword(candidatePassword)` to the schema. When a user logs in, the controller doesn't need to know *how* bcrypt works; it simply calls `user.comparePassword(req.body.password)`. Bcrypt handles the complex math of comparing a plain-text string against a salted hash.

## 2. `Product.js`
This file defines the schema for the inventory items.

### Schema Design
The schema is deliberately massive to perfectly mirror the data structure provided by the `DummyJSON` API we used for seeding.
- Nested objects (like `dimensions: { width: Number, height: Number... }`) are used to logically group related data.
- Arrays (like `images: [String]` and `tags: [String]`) handle 1-to-many relationships (one product, many tags).
- Nested sub-documents (`reviews: [{ rating, comment, reviewerName... }]`) are used instead of a separate Reviews table. Since reviews are tightly coupled to a product and relatively small in number, embedding them improves read performance (no SQL-style JOINs required).

### The `isPublished` Flag
We added a custom boolean field `isPublished` that defaults to `true`. 
- **Logical Purpose**: Soft-deleting or hiding products. Instead of permanently deleting a product from the database (which might break historical sales records), admins can simply toggle this flag. The frontend and backend are configured to only serve `isPublished: true` products to standard users, essentially making the product invisible without destroying the data.
