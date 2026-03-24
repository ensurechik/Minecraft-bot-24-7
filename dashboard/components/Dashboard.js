"use client";
import { useState, useEffect } from "react";
import BotForm from "./BotForm";

export default function Dashboard({ password, onLogout }) {
  const [bots, setBots] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("bots");
  const [logs, setLogs] = useState([]);
  const [chatMsg, setChatMsg] = useState("");
  const [chatStatus, setChatStatus] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editBot, setEditBot] = useState(null);

  async function fetchBots() {
    try {
      const r = await fetch("/api/config?password=" + encodeURIComponent(password));
      const d = await r.json();
      if (d.success === false) { onLogout(); return; }
      setBots(d.bots || []);
      if (!selectedId && d.bots?.length > 0) setSelectedId(d.bots[0].id);
    } catch {}
  }

  async function fetchLogs() {
    if (!selectedId) return;
    try {
      const r = await fetch("/api/logs?password=" + encodeURIComponent(password) + "&id=" + selectedId);
      const d = await r.json();
      if (d.logs) setLogs(d.logs);
    } catch {}
  }

  useEffect(() => {
    fetchBots();
    const iv = setInterval(() => { fetchBots(); fetchLogs(); }, 4000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => { fetchLogs(); }, [selectedId]);

  async function apiAction(action, id, extra = {}) {
    await fetch("/api/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, action, id, ...extra }) });
    fetchBots();
  }

  async function sendChat(e) {
    e.preventDefault();
    if (!chatMsg.trim() || !selectedId) return;
    setChatStatus("sending");
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, id: selectedId, message: chatMsg }) });
      const d = await r.json();
      if (d.success) { setChatMsg(""); setChatStatus("sent"); setTimeout(() => setChatStatus(""), 2000); }
      else setChatStatus("error: " + (d.message || "failed"));
    } catch { setChatStatus("connection error"); }
  }

  const selected = bots.find((b) => b.id === selectedId);

  const statusColor = (s) => s === "connected" ? "status-connected" : s === "connecting" ? "status-connecting" : "status-disconnected";
  const statusHex = (s) => s === "connected" ? "var(--accent2)" : s === "connecting" ? "var(--warn)" : "var(--danger)";

  const TABS = ["bots", "settings", "logs", "chat"];

  return (
    <div className="grid-bg min-h-screen" style={{ paddingBottom: "2rem" }}>
      <header style={{ background: "rgba(5,10,14,0.95)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <span style={{ fontFamily: "'Rajdhani'", fontWeight: 700, fontSize: "1.3rem", color: "white", letterSpacing: "0.1em" }}>MC<span style={{ color: "var(--accent)" }}>_</span>BOT</span>
          <nav style={{ display: "flex", gap: "0.25rem" }}>
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? "rgba(0,212,255,0.1)" : "transparent", border: tab === t ? "1px solid var(--accent)" : "1px solid transparent", color: tab === t ? "var(--accent)" : "var(--muted)", fontFamily: "'Rajdhani'", fontWeight: 600, fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.3rem 0.8rem", borderRadius: 3, cursor: "pointer", transition: "all 0.2s" }}>{t}</button>
            ))}
          </nav>
          <button className="btn btn-danger" style={{ fontSize: "0.7rem", padding: "0.3rem 0.8rem" }} onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem" }}>

        {tab === "bots" && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <p className="mono" style={{ fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.15em" }}>ALL BOTS ({bots.length})</p>
              <button className="btn btn-success" style={{ fontSize: "0.75rem" }} onClick={() => { setShowAddForm(true); setEditBot(null); }}>+ Add Bot</button>
            </div>

            {showAddForm && (
              <div className="panel" style={{ padding: "1.5rem", marginBottom: "1rem", maxWidth: 560 }}>
                <BotForm title="ADD NEW BOT" onSave={async (cfg) => { await apiAction("add", null, cfg); setShowAddForm(false); }} onCancel={() => setShowAddForm(false)} />
              </div>
            )}

            {bots.length === 0 && !showAddForm && (
              <div className="panel" style={{ padding: "2rem", textAlign: "center" }}>
                <p className="mono" style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: "1rem" }}>No bots yet. Add your first bot.</p>
                <button className="btn btn-success" onClick={() => setShowAddForm(true)}>+ Add Bot</button>
              </div>
            )}

            <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
              {bots.map((b) => (
                <div key={b.id} className="panel" style={{ padding: "1.25rem", cursor: "pointer", outline: selectedId === b.id ? "1px solid var(--accent)" : "none" }} onClick={() => setSelectedId(b.id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div>
                      <p style={{ fontFamily: "'Rajdhani'", fontWeight: 700, fontSize: "1.1rem", color: "white" }}>{b.botUsername}</p>
                      <p className="mono" style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{b.botHost}:{b.botPort}</p>
                    </div>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <span className={"status-dot " + statusColor(b.status)} />
                      <span className="mono" style={{ fontSize: "0.68rem", color: statusHex(b.status), textTransform: "uppercase" }}>{b.status}</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn btn-primary" style={{ fontSize: "0.65rem", padding: "0.25rem 0.6rem", flex: 1 }} onClick={(e) => { e.stopPropagation(); setEditBot(b); setTab("settings"); }}>⚙ Edit</button>
                    <button className="btn btn-success" style={{ fontSize: "0.65rem", padding: "0.25rem 0.6rem", flex: 1 }} onClick={(e) => { e.stopPropagation(); apiAction("reconnect", b.id); }}>⟳ Reconnect</button>
                    <button className="btn btn-danger" style={{ fontSize: "0.65rem", padding: "0.25rem 0.6rem" }} onClick={(e) => { e.stopPropagation(); if (confirm("Remove " + b.botUsername + "?")) apiAction("remove", b.id); }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="panel fade-in" style={{ padding: "1.5rem", maxWidth: 560 }}>
            {editBot ? (
              <BotForm
                title={"EDIT BOT — " + editBot.botUsername}
                initial={editBot}
                onSave={async (cfg) => { await apiAction("update", editBot.id, cfg); setEditBot(null); setTab("bots"); }}
                onCancel={() => { setEditBot(null); setTab("bots"); }}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p className="mono" style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: "1rem" }}>Select a bot from the Bots tab to edit its settings.</p>
                <button className="btn btn-primary" onClick={() => setTab("bots")}>← Go to Bots</button>
              </div>
            )}
          </div>
        )}

        {tab === "logs" && (
          <div className="fade-in">
            {bots.length > 1 && (
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                {bots.map((b) => (
                  <button key={b.id} onClick={() => setSelectedId(b.id)} style={{ background: selectedId === b.id ? "rgba(0,212,255,0.1)" : "transparent", border: selectedId === b.id ? "1px solid var(--accent)" : "1px solid var(--border)", color: selectedId === b.id ? "var(--accent)" : "var(--muted)", fontFamily: "'Rajdhani'", fontWeight: 600, fontSize: "0.75rem", padding: "0.25rem 0.75rem", borderRadius: 3, cursor: "pointer" }}>
                    {b.botUsername}
                  </button>
                ))}
              </div>
            )}
            <div className="panel" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <p className="mono" style={{ fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.15em" }}>LOGS — {selected?.botUsername || "—"} <span style={{ color: "var(--accent)" }}>({logs.length})</span></p>
                <button className="btn btn-primary" style={{ fontSize: "0.65rem", padding: "0.25rem 0.6rem" }} onClick={fetchLogs}>Refresh</button>
              </div>
              <div style={{ maxHeight: 480, overflowY: "auto" }}>
                {logs.length === 0 ? <p className="mono" style={{ fontSize: "0.75rem", color: "var(--muted)" }}>No logs yet.</p>
                  : logs.map((l, i) => (
                    <div key={i} className="log-entry">
                      <span className="time">{l.time.slice(11, 19)}</span>
                      <span className="msg">{l.message}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {tab === "chat" && (
          <div className="fade-in">
            {bots.length > 1 && (
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                {bots.map((b) => (
                  <button key={b.id} onClick={() => setSelectedId(b.id)} style={{ background: selectedId === b.id ? "rgba(0,212,255,0.1)" : "transparent", border: selectedId === b.id ? "1px solid var(--accent)" : "1px solid var(--border)", color: selectedId === b.id ? "var(--accent)" : "var(--muted)", fontFamily: "'Rajdhani'", fontWeight: 600, fontSize: "0.75rem", padding: "0.25rem 0.75rem", borderRadius: 3, cursor: "pointer" }}>
                    {b.botUsername}
                    <span style={{ marginLeft: "0.4rem" }}>
                      <span className={"status-dot " + statusColor(b.status)} style={{ width: 6, height: 6 }} />
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div className="panel" style={{ padding: "1.5rem", maxWidth: 600 }}>
              <p className="mono" style={{ fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.15em", marginBottom: "1.5rem" }}>SEND CHAT — {selected?.botUsername || "select a bot"}</p>
              <form onSubmit={sendChat} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", color: "var(--muted)", fontFamily: "'Share Tech Mono'", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>MESSAGE</label>
                  <input className="input-field" placeholder="Type a message to send in-game..." value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-success" disabled={!chatMsg.trim() || selected?.status !== "connected"}>Send Message →</button>
                {chatStatus && <p className="mono" style={{ fontSize: "0.75rem", color: chatStatus === "sent" ? "var(--accent2)" : "var(--danger)" }}>{chatStatus === "sent" ? "✓ Message sent" : "⚠ " + chatStatus}</p>}
                {selected?.status !== "connected" && <p className="mono" style={{ fontSize: "0.72rem", color: "var(--warn)" }}>Bot is not connected. Chat is disabled.</p>}
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
