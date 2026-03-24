export const runtime = "nodejs";
import { NextResponse } from "next/server";
const bot = require("../../../lib/bot");

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || "admin";

export async function POST(req) {
  const body = await req.json();
  if (body.password !== DASHBOARD_PASSWORD) return NextResponse.json({ success: false }, { status: 401 });
  bot.addLog("Manual reconnect triggered from dashboard.");
  bot.createBot();
  return NextResponse.json({ success: true });
}
