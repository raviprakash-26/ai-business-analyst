"use client";

import { FormEvent, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
type Forecast = { column: string; trend_per_period: number; forecast: number[]; note: string };

export default function ForecastPage() {
  const [file, setFile] = useState<File | null>(null);
  const [column, setColumn] = useState("");
  const [periods, setPeriods] = useState(6);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function run(event: FormEvent) {
    event.preventDefault();
    if (!file || !column.trim()) { setError("Upload a dataset and enter a numeric column name."); return; }
    setLoading(true); setError("");
    try {
      const form = new FormData();
      form.append("file", file); form.append("column", column); form.append("periods", String(periods));
      const response = await fetch(`${apiUrl}/forecast/generate`, { method: "POST", body: form });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail ?? "Forecast failed.");
      setForecast(body);
    } catch (err) { setError(err instanceof Error ? err.message : "Forecast failed."); }
    finally { setLoading(false); }
  }

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "56px 24px" }}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Predictive Analytics</p>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 62px)", margin: "10px 0" }}>Business Forecast</h1>
        <p style={{ color: "#667085", lineHeight: 1.6, fontSize: 18 }}>Project a numeric business metric using a transparent linear-trend baseline.</p>
        <form onSubmit={run} style={{ display: "grid", gap: 14, marginTop: 24 }}>
          <input type="file" accept=".csv,.xlsx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <input value={column} onChange={(e) => setColumn(e.target.value)} placeholder="Revenue" style={inputStyle} />
          <input type="number" min={1} max={24} value={periods} onChange={(e) => setPeriods(Number(e.target.value))} style={inputStyle} />
          <button type="submit" disabled={loading} style={buttonStyle}>{loading ? "Forecasting…" : "Generate Forecast"}</button>
        </form>
        {error && <p style={{ color: "#b42318" }}>{error}</p>}
      </section>
      {forecast && <section style={{ ...cardStyle, marginTop: 18 }}><div style={tagStyle}>Linear trend</div><h2>{forecast.column} forecast</h2><p>Trend: <strong>{forecast.trend_per_period.toLocaleString()}</strong> per period</p><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10 }}>{forecast.forecast.map((value, index) => <div key={index} style={cellStyle}><small>Period {index + 1}</small><strong>{value.toLocaleString()}</strong></div>)}</div><p style={{ color: "#667085", fontSize: 13 }}>{forecast.note}</p></section>}
    </main>
  );
}

const cardStyle = { background: "white", borderRadius: 22, padding: 30, border: "1px solid #e7ebf2" };
const eyebrowStyle = { margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" as const, color: "#667085" };
const inputStyle = { padding: 12, borderRadius: 10, border: "1px solid #d0d5dd" };
const buttonStyle = { border: 0, borderRadius: 12, padding: "14px 18px", background: "#172033", color: "white", cursor: "pointer", fontWeight: 800 };
const tagStyle = { display: "inline-block", padding: "5px 9px", borderRadius: 999, background: "#eef2f7", color: "#475467", fontSize: 11, fontWeight: 800 };
const cellStyle = { padding: 16, borderRadius: 14, background: "#f6f8fb", display: "grid", gap: 6 };
