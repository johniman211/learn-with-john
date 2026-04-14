export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { encryptCredentials, decryptCredentials, maskCredentials } from "@/lib/encryption";

// GET single gateway details
export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gateway = await db.paymentGateway.findUnique({
      where: { code: params.code },
      include: { credentialFields: { orderBy: { sortOrder: "asc" } } },
    });

    if (!gateway) {
      return NextResponse.json({ error: "Gateway not found" }, { status: 404 });
    }

    let maskedCreds: Record<string, string> = {};
    if (gateway.credentials) {
      try {
        maskedCreds = maskCredentials(decryptCredentials(gateway.credentials));
      } catch {
        maskedCreds = {};
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { credentials: rawCreds, ...rest } = gateway;
    return NextResponse.json({ ...rest, credentials: maskedCreds });
  } catch (error) {
    console.error("[ADMIN_GATEWAY_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// PUT update gateway credentials and settings
export async function PUT(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { credentials, displayName, environment } = await req.json();

    const gateway = await db.paymentGateway.findUnique({
      where: { code: params.code },
    });

    if (!gateway) {
      return NextResponse.json({ error: "Gateway not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (displayName !== undefined) updateData.displayName = displayName;
    if (environment !== undefined) updateData.environment = environment;

    if (credentials && typeof credentials === "object") {
      // Merge with existing credentials - only update fields that have new values
      let existingCreds: Record<string, string> = {};
      if (gateway.credentials) {
        try {
          existingCreds = decryptCredentials(gateway.credentials);
        } catch {
          existingCreds = {};
        }
      }

      const merged = { ...existingCreds };
      for (const [key, value] of Object.entries(credentials)) {
        if (value && typeof value === "string" && !value.includes("••••")) {
          merged[key] = value;
        }
      }
      updateData.credentials = encryptCredentials(merged);
    }

    const updated = await db.paymentGateway.update({
      where: { code: params.code },
      data: updateData,
    });

    return NextResponse.json({ success: true, gateway: { code: updated.code } });
  } catch (error) {
    console.error("[ADMIN_GATEWAY_PUT]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
