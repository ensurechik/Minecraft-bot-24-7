export const runtime = "nodejs";
import { NextResponse } from "next/server";
const bot = require("../../../lib/bot");

export async function GET() {
  return NextResponse.json({
    bots: bot.getBotsPublic(),
    configured: bot.hasAnyBot(),
  });
}
