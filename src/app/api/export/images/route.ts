import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";

export const runtime = "nodejs";

/**
 * Bundles everything in /public/images into a single ZIP so the artwork can be
 * taken with you (backup, design hand-off, or moving the project elsewhere).
 */
export async function GET() {
  try {
    const dir = path.join(process.cwd(), "public", "images");
    const entries = await fs.readdir(dir);
    const zip = new JSZip();
    const folder = zip.folder("images");
    let count = 0;
    let bytes = 0;

    for (const name of entries.sort()) {
      if (!/\.(jpe?g|png|webp|svg|gif)$/i.test(name)) continue;
      const buf = await fs.readFile(path.join(dir, name));
      folder?.file(name, buf);
      count++;
      bytes += buf.length;
    }

    if (count === 0) {
      return NextResponse.json({ error: "No images found to bundle." }, { status: 404 });
    }

    zip.file(
      "MANIFEST.txt",
      `OTOPZ site artwork
Generated : ${new Date().toISOString()}
Files     : ${count}
Total     : ${(bytes / 1024 / 1024).toFixed(2)} MB

These are the images referenced by the storefront:
  hero-model.jpg    Homepage hero background
  cat-*.jpg         Category tiles in the black band
  new-vibes.jpg     "New Flows" split-section image
  p-*.jpg           Product covers shown in the grid
`
    );

    const buffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="otopz-images.zip"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    console.error("GET /api/export/images error:", error);
    return NextResponse.json({ error: "Failed to bundle images" }, { status: 500 });
  }
}
