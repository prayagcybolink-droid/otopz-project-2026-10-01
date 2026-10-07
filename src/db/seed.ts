import { db, users, products, orders, reviews } from "./index";
import { eq } from "drizzle-orm";

export function generateLicenseKey(): string {
  const chars = "0123456789ABCDEF";
  const segment = () =>
    Array.from({ length: 4 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  return `OTOPZ-${segment()}-${segment()}-${segment()}`;
}

const CATALOG_MARKER_SLUG = "autopilot-automation-suite";

let seedPromise: Promise<void> | null = null;

export async function ensureSeeded(): Promise<void> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    try {
      const marker = await db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.slug, CATALOG_MARKER_SLUG))
        .limit(1);

      if (marker.length > 0) return;

      // One-time migration: clear any legacy catalog before seeding the new one
      await db.delete(reviews);
      await db.delete(orders);
      await db.delete(products);

      // 1. Demo users (idempotent)
      await db
        .insert(users)
        .values([
          {
            name: "Elena Vance",
            email: "elena@atelierfoundry.io",
            passwordHash: "demo-creator-pass",
            role: "creator",
            avatarUrl: "EV",
          },
          {
            name: "Marcus Sterling",
            email: "marcus@studio.co",
            passwordHash: "demo-buyer-pass",
            role: "buyer",
            avatarUrl: "MS",
          },
        ])
        .onConflictDoNothing();

      const [creator] = await db
        .select()
        .from(users)
        .where(eq(users.email, "elena@atelierfoundry.io"));
      const creatorId = creator?.id ?? null;

      // 2. Digital products
      const inserted = await db
        .insert(products)
        .values([
          {
            title: "AutoPilot — Zapier & Make Automation Suite",
            slug: CATALOG_MARKER_SLUG,
            tagline:
              "120 plug-and-play automation blueprints for lead capture, invoicing, CRM sync and client reporting.",
            description:
              "Stop doing the same task twice. AutoPilot bundles 120 production-tested automation blueprints you can import into Zapier or Make in one click.\n\nWhat's inside:\n• 120 importable blueprints (.JSON) grouped by Sales, Ops, Finance & Content\n• Lead-to-CRM, Stripe-to-Invoice, Form-to-Slack & Weekly Report flows\n• Step-by-step setup guide (PDF) with screenshots for every scenario\n• Video walkthroughs and lifetime blueprint updates",
            priceCents: 4900,
            category: "Automation Tools",
            fileFormat: ".JSON, .PDF",
            fileSizeMb: "18.4 MB",
            version: "v3.1.0",
            coverImage: "/images/p-automation.jpg",
            status: "published",
            salesCount: 412,
            creatorId,
          },
          {
            title: "n8n AI Agent Automation Kit",
            slug: "n8n-ai-agent-automation-kit",
            tagline:
              "Self-hosted AI agents that triage email, draft replies, summarize meetings and update your docs automatically.",
            description:
              "Build your own AI operations team with n8n. This kit ships 24 ready-to-run AI agent workflows with prompt libraries and error handling baked in.\n\nIncluded:\n• 24 n8n workflow files (.JSON) with OpenAI / Claude nodes\n• Inbox triage, meeting summarizer, content repurposer & support bot\n• Docker compose file for self-hosting in 5 minutes\n• 40-page implementation handbook (PDF)",
            priceCents: 6900,
            category: "Automation Tools",
            fileFormat: ".JSON, .YML, .PDF",
            fileSizeMb: "26.2 MB",
            version: "v1.4.0",
            coverImage: "/images/cat-automation.jpg",
            status: "published",
            salesCount: 268,
            creatorId,
          },
          {
            title: "Creator Content Workflow System",
            slug: "creator-content-workflow-system",
            tagline:
              "Idea → script → publish → repurpose. One Notion workflow for YouTube, TikTok, newsletter and LinkedIn.",
            description:
              "A complete content operating system for solo creators and small teams. Capture ideas, script with templates, track production and repurpose every piece across 6 platforms.\n\nIncluded:\n• Notion workspace template with 9 linked databases\n• Content calendar, script templates & sponsor tracker\n• Repurposing checklist for 6 platforms\n• Quick-start video + PDF guide",
            priceCents: 2900,
            category: "Workflows",
            fileFormat: "NOTION, .PDF",
            fileSizeMb: "8.6 MB",
            version: "v2.2.0",
            coverImage: "/images/p-workflow.jpg",
            status: "published",
            salesCount: 531,
            creatorId,
          },
          {
            title: "Freelance Client Onboarding Workflow",
            slug: "freelance-client-onboarding-workflow",
            tagline:
              "From signed proposal to kickoff call in 15 minutes — forms, emails, contracts and checklists done for you.",
            description:
              "Look like an agency even if you're solo. This workflow automates your whole onboarding with intake forms, welcome sequences and a client portal.\n\nIncluded:\n• Client portal template (Notion + Google Drive)\n• 7 onboarding email scripts\n• Intake form + kickoff agenda templates\n• Automation recipe to trigger everything from a signed contract",
            priceCents: 2400,
            category: "Workflows",
            fileFormat: "NOTION, .DOCX",
            fileSizeMb: "5.1 MB",
            version: "v1.6.0",
            coverImage: "/images/p-docs.jpg",
            status: "published",
            salesCount: 297,
            creatorId,
          },
          {
            title: "The Automation Playbook — E-Book",
            slug: "the-automation-playbook-ebook",
            tagline:
              "A 180-page guide to automating your business, from first Zap to fully autonomous AI operations.",
            description:
              "Learn how to find, design and ship automations that save 10+ hours a week. Written for founders, freelancers and operators — no code needed.\n\nChapters include:\n• The Automation Audit: finding your highest-ROI tasks\n• Designing reliable workflows & handling failures\n• AI agents for support, sales and content\n• 30 real case studies with before/after metrics\nDelivered as EPUB + PDF.",
            priceCents: 1900,
            category: "E-Books",
            fileFormat: ".EPUB, .PDF",
            fileSizeMb: "12.3 MB",
            version: "2nd Edition",
            coverImage: "/images/p-ebook.jpg",
            status: "published",
            salesCount: 846,
            creatorId,
          },
          {
            title: "Digital Product Launch Blueprint",
            slug: "digital-product-launch-blueprint",
            tagline:
              "The exact 30-day launch plan used to sell $250K of templates, presets and courses.",
            description:
              "Everything you need to validate, build and launch your first digital product — with swipe files and launch-day checklists.\n\nIncluded:\n• 120-page e-book (PDF + EPUB)\n• 30-day launch calendar\n• Email and social swipe files\n• Pricing & bundling worksheet",
            priceCents: 1500,
            category: "E-Books",
            fileFormat: ".PDF, .EPUB",
            fileSizeMb: "9.8 MB",
            version: "v1.2",
            coverImage: "/images/cat-ebooks.jpg",
            status: "published",
            salesCount: 389,
            creatorId,
          },
          {
            title: "Business Doc Templates Bundle",
            slug: "business-doc-templates-bundle",
            tagline:
              "85 lawyer-reviewed contracts, proposals, invoices, SOPs and pitch docs — editable in Word & Google Docs.",
            description:
              "Never start from a blank page again. A complete library of polished business documents for freelancers, agencies and startups.\n\nIncluded:\n• 22 contracts & agreements (NDA, MSA, SOW, freelance)\n• 18 proposals & quotes\n• 15 invoices & financial templates\n• 30 SOPs, policies and pitch documents\nFormats: .DOCX, Google Docs & PDF",
            priceCents: 3200,
            category: "Doc Templates",
            fileFormat: ".DOCX, GDOC, .PDF",
            fileSizeMb: "34.0 MB",
            version: "v4.0",
            coverImage: "/images/p-docs.jpg",
            status: "published",
            salesCount: 624,
            creatorId,
          },
          {
            title: "Monochrome Film — Lightroom Preset Kit",
            slug: "monochrome-film-lightroom-preset-kit",
            tagline:
              "40 black & white film presets for Lightroom desktop & mobile, inspired by Tri-X, HP5 and Ilford Delta.",
            description:
              "Timeless monochrome looks in one click. Carefully tuned grain, contrast curves and tonal separation for portraits, street and fashion.\n\nIncluded:\n• 40 Lightroom presets (.XMP) for desktop\n• 40 mobile presets (.DNG)\n• 12 matching LUTs (.CUBE) for video\n• Installation guide for every platform",
            priceCents: 2200,
            category: "Preset Kits",
            fileFormat: ".XMP, .DNG, .CUBE",
            fileSizeMb: "64.5 MB",
            version: "v2.0",
            coverImage: "/images/p-presets.jpg",
            status: "published",
            salesCount: 712,
            creatorId,
          },
          {
            title: "Cinematic Video Editing Kit — LUTs & Premiere Presets",
            slug: "cinematic-video-editing-kit",
            tagline:
              "60 LUTs, 150 transitions and 40 title presets for Premiere Pro, Final Cut and DaVinci Resolve.",
            description:
              "Give every edit a cinematic finish. A complete preset editing kit for YouTubers, filmmakers and agencies.\n\nIncluded:\n• 60 cinematic LUTs (.CUBE)\n• 150 drag-and-drop transitions (.PRFPSET / .MOTN)\n• 40 animated title templates (.MOGRT)\n• 120 sound effects (.WAV)",
            priceCents: 3900,
            category: "Preset Kits",
            fileFormat: ".CUBE, .MOGRT, .WAV",
            fileSizeMb: "1.2 GB",
            version: "v3.3",
            coverImage: "/images/cat-presets.jpg",
            status: "published",
            salesCount: 455,
            creatorId,
          },
          {
            title: "Agency Operations Workflow Pack",
            slug: "agency-operations-workflow-pack",
            tagline:
              "12 interconnected workflows for sales, delivery, hiring and finance — ClickUp, Notion & Airtable versions.",
            description:
              "Run your agency like a machine. The full back-office system used by 300+ agencies to scale past 20 clients without chaos.\n\nIncluded:\n• 12 workflows: CRM, project delivery, hiring, finance, reporting\n• ClickUp, Notion & Airtable versions\n• 25 SOP documents and client-facing templates\n• Automation recipes for Zapier & Make",
            priceCents: 8900,
            category: "Workflow Packs",
            fileFormat: "CLICKUP, NOTION, CSV",
            fileSizeMb: "42.7 MB",
            version: "v2.5",
            coverImage: "/images/p-workflow.jpg",
            status: "published",
            salesCount: 183,
            creatorId,
          },
          {
            title: "Social Media Creator Mega Pack",
            slug: "social-media-creator-mega-pack",
            tagline:
              "500 Canva templates, 1,000 captions, 90-day content calendar and reel hooks — everything in one pack.",
            description:
              "The ultimate digital pack for creators and social media managers.\n\nIncluded:\n• 500 editable Canva templates (posts, carousels, stories)\n• 1,000 caption & hook swipe file\n• 90-day content calendar (Notion + Sheets)\n• Brand kit template and hashtag research sheets",
            priceCents: 4500,
            category: "Digital Packs",
            fileFormat: "CANVA, .PDF, .XLSX",
            fileSizeMb: "210 MB",
            version: "v5.0",
            coverImage: "/images/new-vibes.jpg",
            status: "published",
            salesCount: 938,
            creatorId,
          },
          {
            title: "Startup Starter Digital Pack",
            slug: "startup-starter-digital-pack",
            tagline:
              "Pitch deck, financial model, automation stack and legal docs — launch your startup this weekend.",
            description:
              "A curated bundle of the essentials every early-stage founder needs.\n\nIncluded:\n• Investor pitch deck (Keynote, PPT, Google Slides)\n• 3-year financial model (Excel + Sheets)\n• Founder automation stack (15 blueprints)\n• Incorporation & founder agreement templates",
            priceCents: 5900,
            category: "Digital Packs",
            fileFormat: ".PPTX, .XLSX, .DOCX",
            fileSizeMb: "88.0 MB",
            version: "v1.8",
            coverImage: "/images/p-automation.jpg",
            status: "published",
            salesCount: 241,
            creatorId,
          },
        ])
        .returning();

      const id = (slug: string) =>
        inserted.find((p) => p.slug === slug)?.id ?? inserted[0].id;

      // 3. Orders
      await db.insert(orders).values([
        {
          productId: id(CATALOG_MARKER_SLUG),
          buyerEmail: "marcus@studio.co",
          buyerName: "Marcus Sterling",
          amountCents: 4900,
          licenseKey: "OTOPZ-982F-441A-89BC",
        },
        {
          productId: id("the-automation-playbook-ebook"),
          buyerEmail: "marcus@studio.co",
          buyerName: "Marcus Sterling",
          amountCents: 1900,
          licenseKey: "OTOPZ-7C4E-109B-33F1",
        },
        {
          productId: id("monochrome-film-lightroom-preset-kit"),
          buyerEmail: "marcus@studio.co",
          buyerName: "Marcus Sterling",
          amountCents: 2200,
          licenseKey: "OTOPZ-55D2-884C-90A4",
        },
        {
          productId: id("business-doc-templates-bundle"),
          buyerEmail: "claire.dubois@northlabs.io",
          buyerName: "Claire Dubois",
          amountCents: 3200,
          licenseKey: "OTOPZ-310A-992E-77B8",
        },
        {
          productId: id("social-media-creator-mega-pack"),
          buyerEmail: "sora.takahashi@koto.jp",
          buyerName: "Sora Takahashi",
          amountCents: 4500,
          licenseKey: "OTOPZ-661F-204D-11C9",
        },
        {
          productId: id("agency-operations-workflow-pack"),
          buyerEmail: "henrik.lindqvist@nordic.se",
          buyerName: "Henrik Lindqvist",
          amountCents: 8900,
          licenseKey: "OTOPZ-842B-719C-45E0",
        },
        {
          productId: id("n8n-ai-agent-automation-kit"),
          buyerEmail: "devon.brooks@opsly.co",
          buyerName: "Devon Brooks",
          amountCents: 6900,
          licenseKey: "OTOPZ-409C-332A-98E7",
          status: "refunded",
        },
      ]);

      // 4. Reviews
      await db.insert(reviews).values([
        {
          productId: id(CATALOG_MARKER_SLUG),
          authorName: "Marcus Sterling — Ops Lead",
          rating: 5,
          comment:
            "Imported 14 blueprints on day one. Our invoicing and CRM sync now run themselves — easily saving 8 hours a week.",
        },
        {
          productId: id(CATALOG_MARKER_SLUG),
          authorName: "Priya Nair — Founder",
          rating: 5,
          comment: "The setup guide is incredibly clear. Worth 10x the price.",
        },
        {
          productId: id("n8n-ai-agent-automation-kit"),
          authorName: "Lukas Weber — Engineer",
          rating: 5,
          comment:
            "The inbox triage agent alone paid for this. Docker setup took literally five minutes.",
        },
        {
          productId: id("creator-content-workflow-system"),
          authorName: "Mia Chen — YouTuber",
          rating: 5,
          comment:
            "Finally one place for ideas, scripts and sponsors. My upload schedule has never been this consistent.",
        },
        {
          productId: id("the-automation-playbook-ebook"),
          authorName: "Marcus Sterling — Ops Lead",
          rating: 5,
          comment:
            "The Automation Audit chapter changed how I look at my week. Practical, no fluff.",
        },
        {
          productId: id("business-doc-templates-bundle"),
          authorName: "Claire Dubois — Agency Owner",
          rating: 5,
          comment:
            "Proposals and contracts that look premium out of the box. Closed two clients the first week.",
        },
        {
          productId: id("monochrome-film-lightroom-preset-kit"),
          authorName: "Sora Takahashi — Photographer",
          rating: 5,
          comment:
            "The HP5-inspired preset is gorgeous. Grain and contrast feel like real film.",
        },
        {
          productId: id("cinematic-video-editing-kit"),
          authorName: "Mateo Silva — Filmmaker",
          rating: 4,
          comment: "Great LUTs and titles. Transitions are smooth and easy to tweak.",
        },
        {
          productId: id("social-media-creator-mega-pack"),
          authorName: "Ava Johnson — Social Manager",
          rating: 5,
          comment:
            "I manage 6 client accounts and this pack cut my design time in half.",
        },
        {
          productId: id("agency-operations-workflow-pack"),
          authorName: "Henrik Lindqvist — Agency Director",
          rating: 5,
          comment:
            "We moved our entire delivery process into the ClickUp version. Game changer.",
        },
      ]);
    } catch (err) {
      console.error("Seed error:", err);
      seedPromise = null;
      throw err;
    }
  })();

  return seedPromise;
}
