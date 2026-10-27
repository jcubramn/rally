"use client";
import { useState } from "react";
import {GoogleSignIn} from "@/components/google-sign-in";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Sign-in failed.");
      }
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get("return_to");
      window.location.href = returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <form onSubmit={onSubmit} className="form" style={{ width: "100%", maxWidth: 360 }}>
        <h1 style={{ marginBottom: 4 }}>Rally</h1>
        <p className="muted" style={{ marginBottom: 20 }}>Sign in to your coaching workspace. New coaches: $19/month.</p>
        <GoogleSignIn/><p className="hint"><a href="/pricing">See what’s included for $19/month</a></p><details><summary style={{margin:"20px 0",cursor:"pointer"}}>Owner password sign-in</summary>
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        {error && <p role="alert" style={{ color: "#963f30" }}>{error}</p>}
        <button className="button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></details>
      </form>
    </main>
  );
}
