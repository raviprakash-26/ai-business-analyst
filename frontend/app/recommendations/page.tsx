"use client";

import { useState } from "react";
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export default function RecommendationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  async function generate() {
    setLoading(true);
    const response = await fetch(`${apiUrl}/recommendations/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anomalies: [{ column: "Revenue", z_score: 4.1 }], forecast: { column: "Revenue", trend_per_period: -1250 }, drivers: [{ dimension: "Region", category: "North", metric: "Revenue", value: 450000, contribution_pct: 45 }] }) });
    const body = await response.json(); setItems(body.recommendations ?? []); setLoading(false);
  }
  return <main style={{ maxWidth: 1000, margin: "0 auto", padding: 48 }}><section style={card}><p style={eyebrow}>Decision Intelligence</p><h1>Business Recommendations</h1><p>Convert verified findings into prioritized investigation actions.</p><button onClick={generate} disabled={loading} style={button}>{loading ? "Generating…" : "Generate Recommendations"}</button></section><section style={{ display: "grid", gap: 12, marginTop: 18 }}>{items.map((item, i) => <article key={i} style={card}><strong>{item.priority.toUpperCase()} · {item.area}</strong><p>{item.action}</p><details><summary>View evidence</summary><pre>{JSON.stringify(item.evidence, null, 2)}</pre></details></article>)}</section></main>;
}
const card = { background: "white", borderRadius: 22, padding: 30, border: "1px solid #e7ebf2" };
const eyebrow = { margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" as const, color: "#667085" };
const button = { border: 0, borderRadius: 12, padding: "14px 18px", background: "#172033", color: "white", cursor: "pointer", fontWeight: 800 };
