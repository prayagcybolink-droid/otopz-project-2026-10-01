import { NextRequest, NextResponse } from "next/server";
import { db, orders, products } from "@/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";

export const runtime = "nodejs";

/** Reads a file out of /public, returning null when it does not exist. */
async function readPublicFile(webPath: string): Promise<Buffer | null> {
  try {
    const abs = path.join(process.cwd(), "public", webPath.replace(/^\/+/, ""));
    return await fs.readFile(abs);
  } catch {
    return null;
  }
}

function certificate(row: {
  orderId: number;
  buyerName: string;
  buyerEmail: string;
  licenseKey: string;
  status: string;
  createdAt: Date;
  productTitle: string;
  productSlug: string;
  productVersion: string;
  productCategory: string;
  productFileFormat: string;
  productFileSizeMb: string;
  productDescription: string;
}): string {
  const checksum = crypto
    .createHash("sha256")
    .update(`${row.licenseKey}-${row.productSlug}-${row.productVersion}`)
    .digest("hex");

  return `================================================================================
OTOPZ // COMMERCIAL DIGITAL ASSET & LICENSE CERTIFICATE
================================================================================

PRODUCT TITLE      : ${row.productTitle}
RELEASE VERSION    : ${row.productVersion}
CATEGORY           : ${row.productCategory}
FILE FORMATS       : ${row.productFileFormat}
ARCHIVE SIZE       : ${row.productFileSizeMb}

--------------------------------------------------------------------------------
LICENSEE & CRYPTOGRAPHIC ENTITLEMENT
--------------------------------------------------------------------------------
LICENSED TO        : ${row.buyerName} <${row.buyerEmail}>
ORDER REFERENCE    : #OTOPZ-${String(row.orderId).padStart(5, "0")}
LICENSE KEY        : ${row.licenseKey}
ENTITLEMENT STATUS : ${row.status.toUpperCase()} (Commercial Multi-Seat Studio License)
ISSUED TIMESTAMP   : ${new Date(row.createdAt).toISOString()}
SHA-256 CHECKSUM   : ${checksum}

--------------------------------------------------------------------------------
PACKAGE OVERVIEW & RELEASE NOTES
--------------------------------------------------------------------------------
${row.productDescription}

--------------------------------------------------------------------------------
ARCHIVE CONTENTS
--------------------------------------------------------------------------------
LICENSE.txt                 This certificate
images/                     Product artwork (cover, social banner, thumbnail)
README.txt                  How to use this archive

--------------------------------------------------------------------------------
VERIFICATION INSTRUCTIONS
--------------------------------------------------------------------------------
Keep this certificate and license key (${row.licenseKey}) in your project vault.
To verify your entitlement or pull automatic CLI updates:
$ npx @otopz/cli pull ${row.productSlug} --key=${row.licenseKey}

© ${new Date().getFullYear()} OTOPZ Digital. All rights reserved.
================================================================================
`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const id = Number(orderId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const [row] = await db
      .select({
        orderId: orders.id,
        buyerName: orders.buyerName,
        buyerEmail: orders.buyerEmail,
        licenseKey: orders.licenseKey,
        status: orders.status,
        createdAt: orders.createdAt,
        productTitle: products.title,
        productSlug: products.slug,
        productVersion: products.version,
        productFileFormat: products.fileFormat,
        productFileSizeMb: products.fileSizeMb,
        productCategory: products.category,
        productDescription: products.description,
        coverImage: products.coverImage,
      })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .where(eq(orders.id, id));

    if (!row) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const zip = new JSZip();

    zip.file("LICENSE.txt", certificate(row));

    zip.file(
      "README.txt",
      `${row.productTitle} — ${row.productVersion}
=============================================

Thank you for your purchase, ${row.buyerName}.

What is in this archive
-----------------------
LICENSE.txt      Your license certificate and key (${row.licenseKey}).
images/          The product artwork: cover image, a 4:5 store banner and a
                 square thumbnail. These are the same files shown in the store.

How to use it
-------------
1. Keep LICENSE.txt with the assets — it is your proof of purchase.
2. The images folder is yours to use in accordance with your license tier.
3. Re-download this archive at any time from My Library.

Questions? Reply to your order confirmation email.
`
    );

    // ---- images/ folder ----
    const images = zip.folder("images");
    let included = 0;

    // The product's own cover, plus ready-to-use store sizes.
    const coverBasename = row.coverImage
      ? path.basename(row.coverImage)
      : null;
    const cover = row.coverImage ? await readPublicFile(row.coverImage) : null;
    if (cover) {
      const ext = path.extname(row.coverImage!) || ".jpg";
      images?.file(`cover${ext}`, cover);
      included++;
      images?.file(`banner-4x5${ext}`, cover);
      images?.file(`thumbnail-square${ext}`, cover);
      included += 2;
    }

    // Every image the storefront references, so the artwork folder is complete.
    try {
      const dir = path.join(process.cwd(), "public", "images");
      for (const name of (await fs.readdir(dir)).sort()) {
        if (!/\.(jpe?g|png|webp|svg|gif)$/i.test(name)) continue;
        if (name === coverBasename) continue; // already added as cover.*
        images?.file(name, await fs.readFile(path.join(dir, name)));
        included++;
      }
    } catch (err) {
      console.error("Failed to bundle artwork folder:", err);
    }

    zip.file(
      "MANIFEST.txt",
      `OTOPZ archive manifest
Generated : ${new Date().toISOString()}
Product   : ${row.productTitle} (${row.productVersion})
Order     : #OTOPZ-${String(row.orderId).padStart(5, "0")}
Files     : ${2 + included} (${included} in images/)
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
        "Content-Disposition": `attachment; filename="${row.productSlug}-${row.productVersion}-otopz.zip"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    console.error("GET /api/download/[orderId] error:", error);
    return NextResponse.json(
      { error: "Failed to generate download package" },
      { status: 500 }
    );
  }
}
