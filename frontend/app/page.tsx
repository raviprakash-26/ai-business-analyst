"use client";

import { useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function Home() {
  const [status, setStatus] = useState("Not connected");

  async function checkBackend() {
    setStatus("Checking…");
    try {
      const response = await fetch(`${apiUrl}/health`);
      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();
      setStatus(`${data.service}: ${data.status}`);
    } catch {
      setStatus("Backend unavailable — start FastAPI on port 8000.");
    }
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px" }}>
      <section style={{ padding: 40, borderRadius: 24, background: "white", boxShadow: "0 12px 40px rgba(23, 32, 51, 0.08)" }}>
        <p style={{ margin: 0, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontSize: 13 }}>
          AI Business Analyst
        </p>
        <h1 style={{ fontSize: "clamp(42px, 7vw, 76px)", lineHeight: 1.02, margin: "18px 0" }}>
          Turn business data into intelligent decisions.
        </h1>
        <p style={{ maxWidth: 700, fontSize: 19, lineHeight: 1.7, color: "#566176" }}>
          Upload a dataset, discover meaningful KPIs, explore interactive analytics, and eventually ask an AI analyst questions about your business data.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
          <button
            onClick={checkBackend}
            style={{ border: 0, borderRadius: 12, padding: "13px 18px", background: "#172033", color: "white", cursor: "pointer", fontWeight: 700 }}
          >
            Check API Connection
          </button>
          <span style={{ alignSelf: "center", color: "#566176" }}>{status}</span>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 20 }}>
        {[
          ["01", "Upload & Profile", "Understand data quality before analysis."],
          ["02", "Analyze", "Generate KPIs, trends and business metrics."],
          ["03", "Explain", "Turn analytical results into clear business insights."],
          ["04", "Decide", "Support decisions with recommendations and scenarios."],
        ].map(([number, title, description]) => (
          <article key={number} style={{ background: "white", borderRadius: 18, padding: 24, border: "1px solid #e7ebf2" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#718096" }}>{number}</div>
            <h2 style={{ fontSize: 20, margin: "10px 0" }}>{title}</h2>
            <p style={{ color: "#667085", lineHeight: 1.6, marginBottom: 0 }}>{description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
