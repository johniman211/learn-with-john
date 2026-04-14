export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { encryptCredentials, decryptCredentials } from "@/lib/encryption";

// POST activate a gateway
export async function POST(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { credentials, environment } = body;

    const gateway = await db.paymentGateway.findUnique({
      where: { code: params.code },
      include: { credentialFields: true },
    });

    if (!gateway) {
      return NextResponse.json({ error: "Gateway not found" }, { status: 404 });
    }

    // Validate required fields (skip 'environment' — it's stored at gateway level, not as a credential)
    const requiredFields = gateway.credentialFields.filter(
      (f: { isRequired: boolean; fieldName: string }) => f.isRequired && f.fieldName !== "environment"
    );
    let existingCreds: Record<string, string> = {};
    if (gateway.credentials) {
      try { existingCreds = decryptCredentials(gateway.credentials); } catch { /* */ }
    }

    const merged = { ...existingCreds, ...credentials };

    for (const field of requiredFields) {
      if (!merged[field.fieldName]) {
        return NextResponse.json(
          { error: `Missing required field: ${field.fieldLabel}` },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {
      credentials: encryptCredentials(merged),
      isActive: true,
      activatedBy: profile.id,
      activatedAt: new Date(),
    };

    // Also update environment if provided
    if (environment && ["sandbox", "live"].includes(environment)) {
      updateData.environment = environment;
    }

    await db.paymentGateway.update({
      where: { code: params.code },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ACTIVATE_GATEWAY]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
