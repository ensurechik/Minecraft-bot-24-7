export const runtime = "nodejs";
import { NextResponse } from "next/server";
const bot = require("../../../lib/bot");
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || "admin";

export async function GET(req) {
  const params = new URL(req.url).searchParams;
  if (params.get("password") !== DASHBOARD_PASSWORD) return NextResponse.json({ success: false }, { status: 401 });
  const id = params.get("id");
  return NextResponse.json({ logs: bot.getLogs(id) });
}
