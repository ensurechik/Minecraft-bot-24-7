"use client";
import { useState, useEffect } from "react";

export default function Login({ onAuth }) {
  const [bots, setBots] = useState([]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestMode, setGuestMode] = useState(false);

  useEffect(() => {
    fetch("/api/public").then((r) => r.json()).then((d) => setBots(d.bots || [])).catch(() => {});
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    if (!password) return;
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const d = await r.json();
      if (d.success) { onAuth(password); }
      else { setError("Invalid password"); }
    } catch { setError("Cannot connect to API"); }
    setLoading(false);
  }

  if (guestMode) {
    return (
      <div className="grid-bg min-h-screen flex flex-col items-center justify-center px-4">
        <div className="panel fade-in" style={{ width: "100%", maxWidth: 520 }}>
          <div style={{ padding: "2rem" }}>
            <span className="mono" style={{ fontSize: "0.6rem", color: "var(--accent)", letterSpacing: "0.2em" }}>◈ GUEST VIEW ◈</span>
            <h1 style={{ fontFamily: "'Rajdhani'", fontWeight: 700, fontSize: "1.6rem", color: "white", marginTop: "0.4rem", marginBottom: "1.5rem" }}>Bot Status</h1>
            {bots.length === 0 ? (
              <p className="mono" style={{ fontSize: "0.78rem", color: "var(--muted)" }}>No bots configured.</p>
            ) : bots.map((b) => (
              <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: "1px solid rgba(26,58,92,0.4)" }}>
                <div>
                  <p className="mono" style={{ fontSize: "0.82rem", color: "var(--text)" }}>{b.nickname}</p>
                  <p className="mono" style={{ fontSize: "0.68rem", color: "var(--muted)" }}>{b.ip}</p>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span className={"status-dot " + (b.status === "connected" ? "status-connected" : b.status === "connecting" ? "status-connecting" : "status-disconnected")} />
                  <span className="mono" style={{ fontSize: "0.72rem", textTransform: "uppercase", color: b.status === "connected" ? "var(--accent2)" : "var(--muted)" }}>{b.status}</span>
                </span>
              </div>
            ))}
            <button className="btn btn-primary" style={{ width: "100%", marginTop: "1.5rem" }} onClick={() => setGuestMode(false)}>← Back to Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-bg min-h-screen flex flex-col items-center justify-center px-4">
      <div className="panel fade-in" style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ padding: "2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <span className="mono" style={{ fontSize: "0.6rem", color: "var(--accent)", letterSpacing: "0.2em" }}>◈ MINECRAFT BOT DASHBOARD ◈</span>
            <h1 style={{ fontFamily: "'Rajdhani'", fontWeight: 700, fontSize: "2.2rem", color: "white", letterSpacing: "0.08em", lineHeight: 1, marginTop: "0.4rem" }}>
              MC<span style={{ color: "var(--accent)" }}>_</span>BOT
            </h1>
            <p className="mono" style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "0.5rem" }}>by TerrorAqua</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.7rem", color: "var(--muted)", fontFamily: "'Share Tech Mono'", letterSpacing: "0.12em", marginBottom: "0.4rem" }}>DASHBOARD PASSWORD</label>
              <input type="password" className="input-field" placeholder="Enter password..." value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} autoFocus />
            </div>
            {error && <p className="mono" style={{ fontSize: "0.75rem", color: "var(--danger)" }}>⚠ {error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>{loading ? "Authenticating..." : "Access Dashboard →"}</button>
          </form>
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <button className="mono" style={{ fontSize: "0.7rem", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }} onClick={() => setGuestMode(true)}>Continue as Guest</button>
          </div>
        </div>
      </div>
    </div>
  );
}
