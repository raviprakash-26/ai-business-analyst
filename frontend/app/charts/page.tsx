"use client";

import { ChangeEvent, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Chart = {
  id: string;
  type: string;
  title: string;
  x?: string;
  y?: string;
  data?: { category: string; value: number }[];
};

export default function ChartsPage() {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${apiUrl}/charts/recommend`, { method: "POST", body: formData });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail ?? "Could not analyze dataset.");
      setCharts(body.charts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyze dataset.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px" }}>
      <section style={heroStyle}>
        <p style={eyebrowStyle}>Visual Analytics</p>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", margin: "12px 0" }}>Interactive Charts</h1>
        <p style={{ color: "#667085", fontSize: 18, lineHeight: 1.6 }}>
          The analytics engine recommends useful visualizations based on the structure of your business dataset.
        </p>
        <label style={buttonStyle}>
          {loading ? "Analyzing…" : "Upload Dataset"}
          <input type="file" accept=".csv,.xlsx" onChange={analyze} disabled={loading} style={{ display: "none" }} />
        </label>
        {error && <p style={{ color: "#b42318" }}>{error}</p>}
      </section>

      <section style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {charts.length === 0 && !loading && <article style={cardStyle}>Upload a dataset to generate chart recommendations.</article>}
        {charts.map((chart) => (
          <article key={chart.id} style={cardStyle}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "#667085" }}>{chart.type}</div>
            <h2 style={{ margin: "8px 0 16px" }}>{chart.title}</h2>
            <p style={{ color: "#667085" }}>X: {chart.x ?? "—"} · Y: {chart.y ?? "—"}</p>
            {chart.data && (
              <div style={{ display: "grid", gap: 8 }}>
                {chart.data.map((item) => (
                  <div key={item.category}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span>{item.category}</span><strong>{item.value.toLocaleString()}</strong>
                    </div>
                    <div style={{ height: 8, background: "#edf0f5", borderRadius: 99, overflow: "hidden", marginTop: 5 }}>
                      <div style={{ width: `${Math.min(100, (item.value / Math.max(...chart.data!.map((x) => x.value))) * 100)}%`, height: "100%", background: "#172033" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
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
