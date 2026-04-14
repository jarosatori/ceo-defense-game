import { NextRequest, NextResponse } from "next/server";
import { addSubscriber } from "@/lib/mailerlite";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, name } = body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const success = await addSubscriber({ email, name });

  if (!success) {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
