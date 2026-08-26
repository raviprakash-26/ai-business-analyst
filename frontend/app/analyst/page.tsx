"use client";

import { FormEvent, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Result = {
  answer: { answer?: string; tool?: string };
  selected_metric: string | null;
  anomalies: { count: number };
  forecast: { forecast: number[]; trend_per_period: number; column: string } | null;
  root_cause_drivers: { dimension: string; category: string; value: number; contribution_pct: number }[];
  recommendations: { recommendations: { priority: string; area: string; action: string }[] };
};

export default function AnalystPage() {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("What is total revenue?");
  const [metric, setMetric] = useState("Revenue");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze(event: FormEvent) {
    event.preventDefault();
    if (!file || !question.trim()) { setError("Upload a dataset and enter a question."); return; }
    setLoading(true); setError("");
    try {
      const form = new FormData();
      form.append("file", file); form.append("question", question); form.append("metric", metric); form.append("forecast_periods", "6");
      const response = await fetch(`${apiUrl}/analyst/analyze`, { method: "POST", body: form });
      const body = await response.json(); if (!response.ok) throw new Error(body.detail ?? "Analysis failed.");
      setResult(body);
    } catch (err) { setError(err instanceof Error ? err.message : "Analysis failed."); }
    finally { setLoading(false); }
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
      <section style={heroStyle}>
        <p style={eyebrowStyle}>Unified Decision Intelligence</p>
        <h1 style={{ fontSize: "clamp(38px, 6vw, 66px)", margin: "10px 0" }}>AI Business Analyst</h1>
        <p style={{ color: "#667085", fontSize: 18, lineHeight: 1.6 }}>One workflow for questions, anomalies, forecasts, root-cause drivers, and recommendations.</p>
        <form onSubmit={analyze} style={{ display: "grid", gap: 12, marginTop: 24 }}>
          <input type="file" accept=".csv,.xlsx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a business question" style={inputStyle} />
          <input value={metric} onChange={(e) => setMetric(e.target.value)} placeholder="Primary numeric metric" style={inputStyle} />
          <button type="submit" disabled={loading} style={buttonStyle}>{loading ? "Analyzing…" : "Run Full Analysis"}</button>
        </form>
        {error && <p style={{ color: "#b42318" }}>{error}</p>}
      </section>

      {result && <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
        <section style={cardStyle}><div style={tagStyle}>{result.answer.tool ?? "analysis"}</div><h2>Analyst Answer</h2><p style={{ fontSize: 20, lineHeight: 1.6 }}>{result.answer.answer}</p></section>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <section style={cardStyle}><small>Anomalies</small><h2>{result.anomalies.count}</h2></section>
          <section style={cardStyle}><small>Forecast trend</small><h2>{result.forecast ? result.forecast.trend_per_period.toLocaleString() : "—"}</h2></section>
          <section style={cardStyle}><small>Primary metric</small><h2>{result.selected_metric ?? "—"}</h2></section>
        </div>
        <section style={cardStyle}><h2>Top Drivers</h2>{result.root_cause_drivers.slice(0, 5).map((driver, i) => <p key={i}>{driver.dimension} = <strong>{driver.category}</strong> · {driver.contribution_pct}%</p>)}</section>
        <section style={cardStyle}><h2>Recommendations</h2>{result.recommendations.recommendations.map((item, i) => <p key={i}><strong>{item.priority.toUpperCase()}</strong> — {item.action}</p>)}</section>
      </div>}
    </main>
  );
}

const heroStyle = { background: "white", borderRadius: 26, padding: 34, border: "1px solid #e7ebf2" };
const cardStyle = { background: "white", borderRadius: 22, padding: 28, border: "1px solid #e7ebf2" };
const eyebrowStyle = { margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" as const, color: "#667085" };
const inputStyle = { padding: 13, borderRadius: 11, border: "1px solid #d0d5dd" };
const buttonStyle = { border: 0, borderRadius: 12, padding: "14px 18px", background: "#172033", color: "white", cursor: "pointer", fontWeight: 800 };
const tagStyle = { display: "inline-block", padding: "5px 9px", borderRadius: 999, background: "#eef2f7", color: "#475467", fontSize: 11, fontWeight: 800, textTransform: "uppercase" as const };
