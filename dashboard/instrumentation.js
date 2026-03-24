export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const bot = require("./lib/bot");
    bot.init();
  }
}
