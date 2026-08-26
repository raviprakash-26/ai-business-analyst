"use client";

import { useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Recommendation = { priority: string; area: string; action: string; evidence: Record<string, unknown> };

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  async function demoGenerate() {
    setLoading(true);
    const response = await fetch(`${apiUrl}/recommendations/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anomalies: [{ column: "Revenue", z_score: 4.1 }],
        forecast: { column: "Revenue", trend_per_period: -1250 },
        drivers: [{ dimension: "Region", category: "North", metric: "Revenue", value: 450000, contribution_pct: 45 }],
      }),
    });
    const body = await response.json();
    setRecommendations(body.recommendations ?? []);
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "56px 24px" }}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Decision Intelligence</p>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 62px)", margin: "10px 0" }}>Business Recommendations</h1>
        <p style={{ color: "#667085", lineHeight: 1.6, fontSize: 18 }}>Convert verified analytical findings into prioritized actions for business investigation and decision-making.</p>
        <button onClick={demoGenerate} disabled={loading} style={buttonStyle}>{loading ? "Generating…" : "Generate Recommendations"}</button>
      </section>
      <section style={{ display: "grid", gap: 12, marginTop: 18 }}>
        {recommendations.map((item, index) => <article key={`${item.area}-${index}`} style={cardStyle}>
          <div style={tagStyle}>{item.priority} · {item.area}</div>
          <h2 style={{ margin: "10px 0" }}>{item.action}</h2>
          <details><summary style={{ cursor: "pointer", color: "#667085" }}>View evidence</summary><pre style={resultStyle}>{JSON.stringify(item.evidence, null, 2)}</pre></details>
        </article>)}
      </section>
    </main>
  );
}

const cardStyle = { background: "white", borderRadius: 22, padding: 30, border: "1px solid #e7ebf2" };
const eyebrowStyle = { margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" as const, color: "#667085" };
const buttonStyle = { marginTop: 18, border: 0, borderRadius: 12, padding: "14px 18px", background: "#172033", color: "white", cursor: "pointer", fontWeight: 800 };
const tagStyle = { display: "inline-block", padding: "5px 9px", borderRadius: 999, background: "#eef2f7", color: "#475467", fontSize: 11, fontWeight: 800, textTransform: "uppercase" as const };
const resultStyle = { padding: 14, borderRadius: 12, background: "#f6f8fb", overflowX: "auto" as const };
