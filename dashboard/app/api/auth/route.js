export const runtime = "nodejs";
import { NextResponse } from "next/server";
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || "admin";
export async function POST(req) {
  const { password } = await req.json();
  if (password === DASHBOARD_PASSWORD) return NextResponse.json({ success: true });
  return NextResponse.json({ success: false, message: "Wrong password" }, { status: 401 });
}
