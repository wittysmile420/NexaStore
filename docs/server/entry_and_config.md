# Server: Entry Point & Configuration

This document covers the high-level setup of the Node.js/Express backend, specifically focusing on `index.js` and environment configuration.

## `index.js` (The Entry Point)
The `index.js` file is the heart of the backend. When you run `node index.js`, this file dictates exactly how the server spins up, handles security, routes traffic, and connects to the database.

### 1. Module Imports & Environment Setup
We import `express` (the web framework), `mongoose` (the MongoDB database driver), `cors` (Cross-Origin Resource Sharing), and `dotenv`. 
Calling `dotenv.config()` is the very first logical step. It instructs Node to read the `.env` file and load variables like our secret database URL (`MONGO_URI`) and port into the `process.env` global object. This ensures we never hardcode passwords directly in the source code.

### 2. Express Instantiation & Middleware
We initialize our app via `const app = express()`.
Before a request ever hits our business logic (our routes), it must pass through global middleware:
- **CORS Setup**: `app.use(cors({...}))`. By default, browsers block web pages from making requests to a different domain for security reasons. We configure CORS to explicitly tell the browser: "It is safe to let the Vercel frontend (or localhost during dev) talk to this Express server." We use `process.env.CLIENT_URL` to dynamically allow the production frontend URL while allowing `localhost` for testing.
- **JSON Parsing**: `app.use(express.json())`. This middleware intercepts incoming HTTP requests. If the request has a body (like a POST request with login credentials), it parses the raw text string into a usable JavaScript object (`req.body`).

### 3. Route Mounting
Instead of writing 1,000 lines of code in `index.js`, we decouple our logic into modular files in the `/routes` folder.
- `app.use('/api/auth', authRoutes)`: Any request starting with `/api/auth` is handed off to the auth controller.
- `app.use('/api/products', productRoutes)`: Any request starting with `/api/products` is handed off to the products controller.

### 4. Health Check Endpoint
We include a simple `app.get('/api/health')` endpoint. This is standard industry practice. Deployment platforms like Render use this ping to verify the server successfully booted up and hasn't crashed.

### 5. Database Connection & Server Boot
We do not start the Express server immediately. 
Logically, if the server starts but the database is unreachable, all API calls will fail anyway. 
Therefore, we use `mongoose.connect()`, which returns a Promise. 
Only inside the `.then()` block (meaning the DB connection succeeded) do we call `app.listen(PORT)`, opening the server to accept web traffic. If the database fails to connect, the `.catch()` block triggers, logs the error, and forcefully kills the Node process via `process.exit(1)`.
