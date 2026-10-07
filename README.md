# OTOPZ Storefront and Admin

This Next.js app combines the public storefront with its operations panel:

- Storefront: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

## Local setup

1. Install Node.js 20 or later and PostgreSQL 14 or later.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to a reachable PostgreSQL database.
3. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (use a unique password with at least 16 characters), and `ADMIN_SESSION_SECRET` (at least 32 random characters). Keep `.env` private; it is ignored by Git.
4. Install dependencies and create/update the database schema:

   ```sh
   npm install
   npm run db:push
   ```

5. Start the app:

   ```sh
   npm run dev
   ```

The first successful admin sign-in creates the configured admin user in the database. The admin panel does not include demo credentials. Staff users invited from the panel receive individually salted scrypt password hashes.

## Deploy to Vercel

Import this project into Vercel as a Next.js project and configure these environment variables for the Production, Preview, and Development environments as appropriate:

- `DATABASE_URL`: a hosted PostgreSQL connection string reachable by Vercel.
- `ADMIN_EMAIL`: the primary admin sign-in email.
- `ADMIN_PASSWORD`: a unique secret password; never use the local development password in production.
- `ADMIN_SESSION_SECRET`: a cryptographically random secret of at least 32 characters, kept stable between deployments so existing sessions remain valid until expiry.

The production build does not connect to the database; `DATABASE_URL` is required at runtime for database-backed pages and API routes.

Deploy with Vercel's normal Next.js build (`npm run build`). Apply schema updates to the hosted database with `npm run db:push` from a trusted environment before deploying a release that depends on new columns or tables. Do not upload `.env` or put secrets in client-side `NEXT_PUBLIC_*` variables.
