export const runtime = "nodejs";
import { NextResponse } from "next/server";
const bot = require("../../../lib/bot");
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || "admin";

export async function POST(req) {
  const body = await req.json();
  if (body.password !== DASHBOARD_PASSWORD) return NextResponse.json({ success: false }, { status: 401 });
  const { id, message } = body;
  const b = bot.getBot(id);
  if (!b || bot.getStatus(id) !== "connected") return NextResponse.json({ success: false, message: "Bot not connected" }, { status: 400 });
  try { b.chat(message); bot.addLog(id, "[DASHBOARD CHAT] " + message); return NextResponse.json({ success: true }); }
  catch (err) { return NextResponse.json({ success: false, message: err.message }, { status: 500 }); }
}
