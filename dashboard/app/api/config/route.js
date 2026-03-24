export const runtime = "nodejs";
import { NextResponse } from "next/server";
const bot = require("../../../lib/bot");
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || "admin";

function checkAuth(pw) { return pw === DASHBOARD_PASSWORD; }

export async function GET(req) {
  const password = new URL(req.url).searchParams.get("password");
  if (!checkAuth(password)) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json({ bots: bot.getAllConfigs() });
}

export async function POST(req) {
  const body = await req.json();
  if (!checkAuth(body.password)) return NextResponse.json({ success: false }, { status: 401 });
  const { action, id, ...cfg } = body;
  delete cfg.password;

  if (action === "add") {
    const newId = bot.addBot(cfg);
    return NextResponse.json({ success: true, id: newId });
  }
  if (action === "update" && id) {
    bot.updateBot(id, cfg);
    return NextResponse.json({ success: true });
  }
  if (action === "remove" && id) {
    bot.removeBot(id);
    return NextResponse.json({ success: true });
  }
  if (action === "reconnect" && id) {
    bot.startBot(id);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, message: "Unknown action" }, { status: 400 });
}
