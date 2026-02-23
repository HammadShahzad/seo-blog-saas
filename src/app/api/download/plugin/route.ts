import { NextResponse } from "next/server";
import AdmZip from "adm-zip";
import { readFileSync } from "fs";
import { join } from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  try {
    const phpFilePath = join(process.cwd(), "public", "downloads", "stackserp-connector.php");
    const phpContent = readFileSync(phpFilePath);

    const zip = new AdmZip();

    // WordPress plugin ZIPs must have a top-level folder matching the plugin slug
    zip.addFile("stackserp-connector/stackserp-connector.php", phpContent);

    const zipBuffer = zip.toBuffer();

    return new Response(zipBuffer.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="stackserp-connector.zip"',
        "Content-Length": String(zipBuffer.length),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("Plugin ZIP generation failed:", err);
    return NextResponse.json({ error: "Failed to generate plugin ZIP" }, { status: 500 });
  }
}
