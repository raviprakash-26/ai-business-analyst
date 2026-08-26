"use client";

import { ChangeEvent, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Insight = {
  type: string;
  title: string;
  message: string;
  evidence: Record<string, unknown>;
};

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    setInsights([]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${apiUrl}/insights/generate`, { method: "POST", body: formData });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail ?? "Could not generate insights.");
      setInsights(body.insights ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate insights.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "56px 24px" }}>
      <section style={heroStyle}>
        <p style={eyebrowStyle}>Business Intelligence</p>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", margin: "12px 0" }}>Business Insights</h1>
        <p style={{ color: "#667085", fontSize: 18, lineHeight: 1.6 }}>
          Upload a dataset and get evidence-backed observations about trends and concentration patterns.
        </p>
        <label style={buttonStyle}>
          {loading ? "Analyzing…" : "Upload Dataset"}
          <input type="file" accept=".csv,.xlsx" onChange={generate} disabled={loading} style={{ display: "none" }} />
        </label>
        {error && <p style={{ color: "#b42318" }}>{error}</p>}
      </section>

      <section style={{ marginTop: 20, display: "grid", gap: 14 }}>
        {insights.length === 0 && !loading && !error && (
          <article style={cardStyle}>No insights yet. Upload a CSV or XLSX dataset to begin.</article>
        )}
        {insights.map((insight, index) => (
          <article key={`${insight.title}-${index}`} style={cardStyle}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#667085" }}>{insight.type}</div>
            <h2 style={{ margin: "8px 0" }}>{insight.title}</h2>
            <p style={{ marginBottom: 0, color: "#475467", lineHeight: 1.6 }}>{insight.message}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

const heroStyle = { background: "white", borderRadius: 24, padding: 36, border: "1px solid #e7ebf2" };
const eyebrowStyle = { margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" as const, color: "#667085" };
const buttonStyle = { display: "inline-block", marginTop: 14, borderRadius: 12, padding: "13px 18px", background: "#172033", color: "white", cursor: "pointer", fontWeight: 700 };
const cardStyle = { background: "white", borderRadius: 18, padding: 24, border: "1px solid #e7ebf2" };
