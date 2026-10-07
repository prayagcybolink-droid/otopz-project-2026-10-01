import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

/** Streams the packaged project source zip (public/downloads/otopz-admin-panel.zip). */
export async function GET() {
  try {
    const zipPath = path.join(process.cwd(), "public", "downloads", "otopz-admin-panel.zip");
    const stat = await fs.stat(zipPath);
    const data = await fs.readFile(zipPath);

    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Length": String(stat.size),
        "Content-Disposition": 'attachment; filename="otopz-admin-panel.zip"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Source archive not found. Run the packaging step to generate it." },
      { status: 404 }
    );
  }
}
