"use client";
import { useEffect, useState } from "react";
import Login from "../components/Login";
import Dashboard from "../components/Dashboard";

export default function Home() {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem("mc_bot_auth");
    setAuth(saved || null);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050a0e" }}>
        <p style={{ fontFamily: "monospace", color: "#00d4ff", fontSize: "0.85rem", letterSpacing: "0.2em" }}>LOADING...</p>
      </div>
    );
  }

  if (!auth) {
    return <Login onAuth={(p) => { sessionStorage.setItem("mc_bot_auth", p); setAuth(p); }} />;
  }

  return <Dashboard password={auth} onLogout={() => { sessionStorage.removeItem("mc_bot_auth"); setAuth(null); }} />;
}
