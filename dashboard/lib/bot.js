const mineflayer = require("mineflayer");
const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(process.cwd(), "bots-config.json");

let bots = {};

function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
      bots = data;
    } catch (_) {}
  }
}

function saveConfig() {
  try { fs.writeFileSync(CONFIG_PATH, JSON.stringify(bots, null, 2)); } catch (_) {}
}

function createBotEntry(id) {
  return {
    id,
    botHost: "",
    botPort: 25565,
    botUsername: "McBot",
    botPasswordIngame: "",
    repoUrl: "",
    dashboardUrl: "",
    welcomeMessage: "",
    _bot: null,
    _status: "disconnected",
    _logs: [],
    _reconnectTimer: null,
    _hourTimer: null,
  };
}

function addLog(id, msg) {
  if (!bots[id]) return;
  const entry = { time: new Date().toISOString(), message: msg };
  bots[id]._logs.unshift(entry);
  if (bots[id]._logs.length > 200) bots[id]._logs.pop();
  console.log("[" + id + "] [" + entry.time + "] " + msg);
}

function isConfigured(id) {
  const b = bots[id];
  return !!(b && b.botHost && b.botUsername);
}

function stopBot(id) {
  const b = bots[id];
  if (!b) return;
  clearTimeout(b._reconnectTimer);
  clearInterval(b._hourTimer);
  if (b._bot) { try { b._bot.quit(); } catch (_) {} b._bot = null; }
  b._status = "disconnected";
}

function scheduleReconnect(id) {
  const b = bots[id];
  if (!b) return;
  clearTimeout(b._reconnectTimer);
  b._reconnectTimer = setTimeout(() => { addLog(id, "Reconnecting..."); startBot(id); }, 5000);
}

function sendWelcome(id) {
  const b = bots[id];
  if (!b || !b._bot || b._status !== "connected") return;
  if (b.botPasswordIngame) {
    setTimeout(() => { try { b._bot.chat("/register " + b.botPasswordIngame + " " + b.botPasswordIngame); } catch (_) {} }, 500);
    setTimeout(() => { try { b._bot.chat("/login " + b.botPasswordIngame); } catch (_) {} }, 1500);
  }
  const msg = [
    "This bot created by TerrorAqua",
    b.repoUrl ? "Repository: " + b.repoUrl : null,
    b.dashboardUrl ? "Dashboard: " + b.dashboardUrl : null,
    b.welcomeMessage || null,
  ].filter(Boolean);
  msg.forEach((line, i) => setTimeout(() => { try { b._bot.chat(line); } catch (_) {} }, 3000 + i * 1200));
}

function startBot(id) {
  stopBot(id);
  const b = bots[id];
  if (!b) return;
  if (!isConfigured(id)) { addLog(id, "Not configured yet."); return; }
  b._status = "connecting";
  addLog(id, "Connecting to " + b.botHost + ":" + b.botPort + " as " + b.botUsername + "...");

  const bot = mineflayer.createBot({ host: b.botHost, port: Number(b.botPort), username: b.botUsername, version: "1.21.11", auth: "offline" });
  b._bot = bot;

  bot.once("spawn", () => {
    b._status = "connected";
    addLog(id, "Bot spawned successfully.");
    setTimeout(() => sendWelcome(id), 2000);

    b._hourTimer = setInterval(() => {
      if (b._bot && b._status === "connected") {
        const msg = [
          "This bot created by TerrorAqua",
          b.repoUrl ? "Repository: " + b.repoUrl : null,
          b.dashboardUrl ? "Dashboard: " + b.dashboardUrl : null,
          b.welcomeMessage || null,
        ].filter(Boolean).join(" | ");
        try { b._bot.chat(msg); } catch (_) {}
        addLog(id, "Sent hourly message.");
      }
    }, 60 * 60 * 1000);

    b._reconnectTimer = setTimeout(() => { addLog(id, "10-min reconnect."); startBot(id); }, 10 * 60 * 1000);
  });

  bot.on("chat", (username, message) => addLog(id, "[CHAT] " + username + ": " + message));
  bot.on("error", (err) => { b._status = "disconnected"; addLog(id, "Error: " + err.message); scheduleReconnect(id); });
  bot.on("end", (reason) => { b._status = "disconnected"; clearInterval(b._hourTimer); addLog(id, "Disconnected: " + reason); scheduleReconnect(id); });
}

function init() {
  if (global._botInitialized) return;
  global._botInitialized = true;
  loadConfig();
  Object.keys(bots).forEach((id) => startBot(id));
}

function addBot(cfg) {
  const id = "bot_" + Date.now();
  bots[id] = { ...createBotEntry(id), ...cfg, _bot: null, _status: "disconnected", _logs: [], _reconnectTimer: null, _hourTimer: null };
  saveConfig();
  startBot(id);
  return id;
}

function updateBot(id, cfg) {
  if (!bots[id]) return false;
  Object.assign(bots[id], cfg);
  saveConfig();
  startBot(id);
  return true;
}

function removeBot(id) {
  stopBot(id);
  delete bots[id];
  saveConfig();
}

function getBotsPublic() {
  return Object.values(bots).map((b) => ({ id: b.id, nickname: b.botUsername, ip: b.botHost + ":" + b.botPort, status: b._status }));
}

function getBotConfig(id) {
  const b = bots[id];
  if (!b) return null;
  const { _bot, _reconnectTimer, _hourTimer, ...rest } = b;
  return { ...rest, status: b._status };
}

function getAllConfigs() {
  return Object.values(bots).map((b) => {
    const { _bot, _reconnectTimer, _hourTimer, ...rest } = b;
    return { ...rest, status: b._status };
  });
}

module.exports = { init, addBot, updateBot, removeBot, startBot, addLog, isConfigured,
  getBotsPublic, getBotConfig, getAllConfigs,
  getBot: (id) => bots[id]?._bot,
  getStatus: (id) => bots[id]?._status,
  getLogs: (id) => bots[id]?._logs || [],
  hasAnyBot: () => Object.keys(bots).length > 0,
};
