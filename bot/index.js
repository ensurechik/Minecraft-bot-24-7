const mineflayer = require("mineflayer");
const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(process.cwd(), "bot", "config.json");

let config = {
  botHost: "",
  botPort: 25565,
  botUsername: "McBot",
  botPasswordIngame: "",
  repoUrl: "",
  dashboardUrl: "",
};

let bot = null;
let status = "disconnected";
let reconnectTimer = null;
let hourTimer = null;
let logs = [];

function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
      config = { ...config, ...data };
    } catch (_) {}
  }
}

function saveConfig(data) {
  config = { ...config, ...data };
  try {
    fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (_) {}
}

function isConfigured() {
  return !!(config.botHost && config.botUsername);
}

function addLog(msg) {
  const entry = { time: new Date().toISOString(), message: msg };
  logs.unshift(entry);
  if (logs.length > 200) logs.pop();
  console.log(`[${entry.time}] ${msg}`);
}

function stopBot() {
  clearTimeout(reconnectTimer);
  clearInterval(hourTimer);
  if (bot) {
    try { bot.quit(); } catch (_) {}
    bot = null;
  }
  status = "disconnected";
}

function scheduleReconnect() {
  clearTimeout(reconnectTimer);
  clearInterval(hourTimer);
  reconnectTimer = setTimeout(() => {
    addLog("Reconnecting...");
    createBot();
  }, 5000);
}

function sendWelcome() {
  if (!bot || status !== "connected") return;
  if (config.botPasswordIngame) {
    setTimeout(() => { try { bot.chat("/register " + config.botPasswordIngame + " " + config.botPasswordIngame); } catch (_) {} }, 500);
    setTimeout(() => { try { bot.chat("/login " + config.botPasswordIngame); } catch (_) {} }, 1500);
  }
  ["This bot created by TerrorAqua", "Repository: " + config.repoUrl, "Dashboard: " + config.dashboardUrl]
    .forEach((line, i) => setTimeout(() => { try { bot.chat(line); } catch (_) {} }, 3000 + i * 1000));
}

function createBot() {
  stopBot();
  if (!isConfigured()) {
    addLog("Bot not configured yet. Fill in settings from the dashboard.");
    return;
  }
  status = "connecting";
  addLog(`Connecting to ${config.botHost}:${config.botPort} as ${config.botUsername}...`);

  bot = mineflayer.createBot({
    host: config.botHost,
    port: Number(config.botPort),
    username: config.botUsername,
    version: "1.21.11",
    auth: "offline",
  });

  bot.once("spawn", () => {
    status = "connected";
    addLog("Bot spawned successfully.");
    setTimeout(() => sendWelcome(), 2000);

    hourTimer = setInterval(() => {
      if (bot && status === "connected") {
        bot.chat("This bot created by TerrorAqua | Repo: " + config.repoUrl + " | Dashboard: " + config.dashboardUrl);
        addLog("Sent hourly welcome message.");
      }
    }, 60 * 60 * 1000);

    reconnectTimer = setTimeout(() => {
      addLog("10-minute reconnect cycle triggered.");
      createBot();
    }, 10 * 60 * 1000);
  });

  bot.on("chat", (username, message) => addLog(`[CHAT] ${username}: ${message}`));

  bot.on("error", (err) => {
    status = "disconnected";
    addLog(`Error: ${err.message}`);
    scheduleReconnect();
  });

  bot.on("end", (reason) => {
    status = "disconnected";
    clearInterval(hourTimer);
    addLog(`Disconnected: ${reason}`);
    scheduleReconnect();
  });
}

let initialized = false;
function init() {
  if (initialized) return;
  initialized = true;
  loadConfig();
  createBot();
}

module.exports = { init, createBot, saveConfig, isConfigured, addLog, loadConfig,
  getConfig: () => config, getStatus: () => status, getLogs: () => logs, getBot: () => bot };
