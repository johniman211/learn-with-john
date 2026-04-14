export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";

export async function PATCH(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const profile = await getProfile();

    if (!profile || profile.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name } = await req.json();

    const category = await db.category.update({
      where: { id: params.categoryId },
      data: { name },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const profile = await getProfile();

    if (!profile || profile.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const category = await db.category.delete({
      where: { id: params.categoryId },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
