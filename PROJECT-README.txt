OTOPZ — project source archive
Generated : 2026-10-01T12:55:56.805Z
Files     : 54

Contents
--------
src/            Application code (Next.js App Router)
public/         Static assets — artwork, fonts, covers
  images/       Product artwork and hero photography
  fonts/        Splatink webfont used by the logo
drizzle.config.json, tsconfig.json, package.json, next.config.ts

Running it locally
------------------
1. Install dependencies:  npm install
2. Create a .env file with:
       DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
3. Build the database:    npx drizzle-kit push
4. Seed the demo data:    node scripts/seed.mjs
5. Start the app:         npm run dev

Note
----
node_modules/ and .next/ are intentionally excluded — run npm install to
recreate them. The .env file stores only a local development database URL.
