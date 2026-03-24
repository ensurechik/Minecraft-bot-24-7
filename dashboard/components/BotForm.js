"use client";
import { useState } from "react";

export default function BotForm({ initial, onSave, onCancel, title }) {
  const [form, setForm] = useState(initial || { botHost: "", botPort: "25565", botUsername: "", botPasswordIngame: "", repoUrl: "", dashboardUrl: "", welcomeMessage: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.botHost || !form.botUsername) { setError("Server IP and Username are required."); return; }
    setSaving(true); setError("");
    await onSave(form);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <p className="mono" style={{ fontSize: "0.6rem", color: "var(--accent)", letterSpacing: "0.2em" }}>{title}</p>

      <Sec label="SERVER">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: "0.75rem" }}>
          <F label="SERVER IP *" placeholder="play.example.com" value={form.botHost} onChange={(v) => set("botHost", v)} />
          <F label="PORT" placeholder="25565" value={form.botPort} onChange={(v) => set("botPort", v)} />
        </div>
      </Sec>

      <Sec label="BOT">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <F label="USERNAME *" placeholder="MyBot" value={form.botUsername} onChange={(v) => set("botUsername", v)} />
          <F label="IN-GAME PASSWORD" placeholder="/register and /login (optional)" value={form.botPasswordIngame} onChange={(v) => set("botPasswordIngame", v)} type="password" />
        </div>
      </Sec>

      <Sec label="MESSAGES & LINKS">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <F label="WELCOME MESSAGE" placeholder="Custom welcome message (optional)" value={form.welcomeMessage} onChange={(v) => set("welcomeMessage", v)} />
          <F label="REPO URL" placeholder="https://github.com/you/mc-bot" value={form.repoUrl} onChange={(v) => set("repoUrl", v)} />
          <F label="DASHBOARD URL" placeholder="https://mc-bot.up.railway.app" value={form.dashboardUrl} onChange={(v) => set("dashboardUrl", v)} />
        </div>
      </Sec>

      {error && <p className="mono" style={{ fontSize: "0.75rem", color: "var(--danger)" }}>⚠ {error}</p>}

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button type="submit" className="btn btn-success" style={{ flex: 1 }} disabled={saving}>{saving ? "Saving..." : "Save & Start →"}</button>
        {onCancel && <button type="button" className="btn btn-danger" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

function Sec({ label, children }) {
  return (
    <div>
      <p className="mono" style={{ fontSize: "0.6rem", color: "var(--accent)", letterSpacing: "0.15em", marginBottom: "0.75rem" }}>{label}</p>
      <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid var(--border)", borderRadius: 3, padding: "1rem" }}>{children}</div>
    </div>
  );
}

function F({ label, placeholder, value, onChange, type = "text" }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.62rem", color: "var(--muted)", fontFamily: "'Share Tech Mono'", letterSpacing: "0.1em", marginBottom: "0.35rem" }}>{label}</label>
      <input className="input-field" type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
