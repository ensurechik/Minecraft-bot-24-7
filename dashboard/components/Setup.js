"use client";
import { useState } from "react";

function emptyInstance() {
  return { id: Date.now().toString(), botHost: "", botPort: "25565", botUsername: "", botPasswordIngame: "" };
}

export default function Setup({ password, onDone, onLogout }) {
  const [instances, setInstances] = useState([emptyInstance()]);
  const [repoUrl, setRepoUrl] = useState("");
  const [dashboardUrl, setDashboardUrl] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("This bot created by TerrorAqua | Repo: {repo} | Dashboard: {dashboard}");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateInst(idx, key, val) {
    setInstances((arr) => arr.map((x, i) => i === idx ? { ...x, [key]: val } : x));
  }
  function addInstance() { setInstances((arr) => [...arr, { ...emptyInstance(), id: Date.now().toString() }]); }
  function removeInstance(idx) { setInstances((arr) => arr.filter((_, i) => i !== idx)); }

  async function handleSave(e) {
    e.preventDefault();
    if (!instances[0].botHost || !instances[0].botUsername) { setError("At least one bot with Server IP and Username is required."); return; }
    setSaving(true); setError("");
    try {
      const r = await fetch("/api/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, instances, repoUrl, dashboardUrl, welcomeMessage }) });
      const d = await r.json();
      if (d.success) { onDone(); } else { setError(d.message || "Failed to save."); }
    } catch { setError("Cannot connect to API."); }
    setSaving(false);
  }

  return (
    <div className="grid-bg min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="panel fade-in" style={{ width: "100%", maxWidth: 600 }}>
        <div style={{ padding: "2rem" }}>
          <div style={{ marginBottom: "2rem" }}>
            <span className="mono" style={{ fontSize: "0.6rem", color: "var(--accent)", letterSpacing: "0.2em" }}>◈ FIRST TIME SETUP ◈</span>
            <h1 style={{ fontFamily: "'Rajdhani'", fontWeight: 700, fontSize: "2rem", color: "white", marginTop: "0.4rem" }}>Configure Bots</h1>
            <p className="mono" style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: "0.5rem" }}>Add one or more bots. Settings can be changed later.</p>
          </div>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {instances.map((inst, idx) => (
              <div key={inst.id} style={{ background: "rgba(0,0,0,0.25)", border: "1px solid var(--border)", borderRadius: 3, padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span className="mono" style={{ fontSize: "0.62rem", color: "var(--accent)", letterSpacing: "0.12em" }}>BOT #{idx + 1}</span>
                  {instances.length > 1 && <button type="button" onClick={() => removeInstance(idx)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.75rem", fontFamily: "monospace" }}>✕ Remove</button>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "0.6rem", marginBottom: "0.6rem" }}>
                  <Field label="SERVER IP" placeholder="play.example.com" value={inst.botHost} onChange={(v) => updateInst(idx, "botHost", v)} required />
                  <Field label="PORT" placeholder="25565" value={inst.botPort} onChange={(v) => updateInst(idx, "botPort", v)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                  <Field label="USERNAME" placeholder="MyBot" value={inst.botUsername} onChange={(v) => updateInst(idx, "botUsername", v)} required />
                  <Field label="IN-GAME PASSWORD" placeholder="optional" value={inst.botPasswordIngame} onChange={(v) => updateInst(idx, "botPasswordIngame", v)} type="password" />
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-primary" onClick={addInstance}>+ Add Another Bot</button>
            <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid var(--border)", borderRadius: 3, padding: "1rem" }}>
              <p className="mono" style={{ fontSize: "0.62rem", color: "var(--accent)", letterSpacing: "0.12em", marginBottom: "0.75rem" }}>GENERAL</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <Field label="REPO URL" placeholder="https://github.com/you/mc-bot" value={repoUrl} onChange={setRepoUrl} />
                <Field label="DASHBOARD URL" placeholder="https://mc-bot.up.railway.app" value={dashboardUrl} onChange={setDashboardUrl} />
                <Field label="HOURLY MESSAGE ({repo} and {dashboard} are replaced automatically)" placeholder="This bot created by TerrorAqua | Repo: {repo} | Dashboard: {dashboard}" value={welcomeMessage} onChange={setWelcomeMessage} />
              </div>
            </div>
            {error && <p className="mono" style={{ fontSize: "0.75rem", color: "var(--danger)" }}>⚠ {error}</p>}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="submit" className="btn btn-success" style={{ flex: 1 }} disabled={saving}>{saving ? "Saving..." : "Save & Start Bots →"}</button>
              <button type="button" className="btn btn-danger" onClick={onLogout}>Logout</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, type = "text", required }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.6rem", color: "var(--muted)", fontFamily: "'Share Tech Mono'", letterSpacing: "0.1em", marginBottom: "0.3rem" }}>
        {label}{required && <span style={{ color: "var(--danger)", marginLeft: 2 }}>*</span>}
      </label>
      <input className="input-field" type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
