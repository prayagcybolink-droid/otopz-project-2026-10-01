import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Zips the entire project source so it can be taken elsewhere and run:
 * application code, configuration and the public artwork folder.
 * Build output and dependencies are left out to keep the archive small.
 */
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".turbo",
  ".cache",
  "coverage",
  ".DS_Store",
]);

const SKIP_FILES = new Set([".DS_Store", "Thumbs.db"]);

async function walk(dir: string, root: string, zip: JSZip, stats: { files: number }) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    const rel = path.relative(root, abs);

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".log")) continue;
      await walk(abs, root, zip, stats);
      continue;
    }
    if (!entry.isFile()) continue;
    if (SKIP_FILES.has(entry.name)) continue;
    if (entry.name.endsWith(".log")) continue;

    try {
      const buf = await fs.readFile(abs);
      zip.file(rel, buf);
      stats.files++;
    } catch (err) {
      console.error("Skipped unreadable file:", rel, err);
    }
  }
}

export async function GET() {
  try {
    const root = process.cwd();
    const zip = new JSZip();
    const stats = { files: 0 };

    await walk(root, root, zip, stats);

    zip.file(
      "PROJECT-README.txt",
      `OTOPZ — project source archive
Generated : ${new Date().toISOString()}
Files     : ${stats.files}

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
`
    );

    const buffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const stamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="otopz-project-${stamp}.zip"`,
        "Content-Length": String(buffer.length),
        "X-File-Count": String(stats.files),
      },
    });
  } catch (error) {
    console.error("GET /api/export/project error:", error);
    return NextResponse.json({ error: "Failed to build the project archive" }, { status: 500 });
  }
}
