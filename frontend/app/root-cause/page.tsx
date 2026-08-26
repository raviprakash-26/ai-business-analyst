"use client";

import { FormEvent, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
type Driver = { dimension: string; category: string; metric: string; value: number; contribution_pct: number };

export default function RootCausePage() {
  const [file, setFile] = useState<File | null>(null);
  const [metric, setMetric] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyze(event: FormEvent) {
    event.preventDefault();
    if (!file || !metric.trim()) { setError("Upload a dataset and enter a numeric metric."); return; }
    setLoading(true); setError("");
    try {
      const form = new FormData(); form.append("file", file); form.append("metric", metric); form.append("top_n", "5");
      const response = await fetch(`${apiUrl}/root-cause/analyze`, { method: "POST", body: form });
      const body = await response.json(); if (!response.ok) throw new Error(body.detail ?? "Root cause analysis failed.");
      setDrivers(body.drivers ?? []); setTotal(body.total ?? null);
    } catch (err) { setError(err instanceof Error ? err.message : "Root cause analysis failed."); }
    finally { setLoading(false); }
  }

  return (
    <main style={{ maxWidth: 1050, margin: "0 auto", padding: "56px 24px" }}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Diagnostic Analytics</p>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 62px)", margin: "10px 0" }}>Root Cause Explorer</h1>
        <p style={{ color: "#667085", lineHeight: 1.6, fontSize: 18 }}>Find the regions, products, segments, or other categorical groups contributing most to a selected business metric.</p>
        <form onSubmit={analyze} style={{ display: "grid", gap: 14, marginTop: 24 }}>
          <label style={labelStyle}>Dataset<input type="file" accept=".csv,.xlsx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
          <label style={labelStyle}>Metric<input value={metric} onChange={(e) => setMetric(e.target.value)} placeholder="Revenue" style={inputStyle} /></label>
          <button type="submit" disabled={loading} style={buttonStyle}>{loading ? "Analyzing…" : "Find Drivers"}</button>
        </form>
        {error && <p style={{ color: "#b42318" }}>{error}</p>}
      </section>
      {total !== null && <section style={{ marginTop: 18 }}>
        <div style={{ ...cardStyle, marginBottom: 14 }}><small style={{ color: "#667085" }}>Selected metric total</small><h2 style={{ margin: "8px 0 0" }}>{total.toLocaleString()}</h2></div>
        <div style={{ display: "grid", gap: 12 }}>
          {drivers.map((driver, index) => <article key={`${driver.dimension}-${driver.category}-${index}`} style={cardStyle}>
            <div style={tagStyle}>{driver.dimension}</div>
            <h3 style={{ margin: "10px 0" }}>{driver.category}</h3>
            <p style={{ color: "#475467", margin: 0 }}>{driver.value.toLocaleString()} · {driver.contribution_pct}% contribution</p>
          </article>)}
        </div>
      </section>}
    </main>
  );
}

const cardStyle = { background: "white", borderRadius: 22, padding: 30, border: "1px solid #e7ebf2" };
const eyebrowStyle = { margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" as const, color: "#667085" };
const labelStyle = { display: "grid", gap: 8, fontWeight: 700 };
const inputStyle = { padding: 12, borderRadius: 10, border: "1px solid #d0d5dd" };
const buttonStyle = { border: 0, borderRadius: 12, padding: "14px 18px", background: "#172033", color: "white", cursor: "pointer", fontWeight: 800 };
const tagStyle = { display: "inline-block", padding: "5px 9px", borderRadius: 999, background: "#eef2f7", color: "#475467", fontSize: 11, fontWeight: 800, textTransform: "uppercase" as const };
