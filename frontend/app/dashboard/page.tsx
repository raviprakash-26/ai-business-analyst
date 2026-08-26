"use client";

import { ChangeEvent, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Kpi = { id: string; label: string; value: number; unit?: string };

export default function DashboardPage() {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [filename, setFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${apiUrl}/analytics/kpis`, { method: "POST", body: formData });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail ?? "KPI analysis failed.");
      setKpis(body.kpis ?? []);
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "KPI analysis failed.");
      setKpis([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
      <header style={{ marginBottom: 28 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: "#667085" }}>AI Business Analyst</p>
        <h1 style={{ margin: "10px 0", fontSize: 42 }}>Business Intelligence Dashboard</h1>
        <p style={{ margin: 0, color: "#667085" }}>Upload a dataset to calculate evidence-based business KPIs.</p>
      </header>

      <section style={{ background: "white", border: "1px solid #e7ebf2", borderRadius: 18, padding: 24, marginBottom: 18 }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 12, padding: "13px 18px", background: "#172033", color: "white", cursor: "pointer", fontWeight: 700 }}>
          {loading ? "Analyzing…" : "Upload CSV / XLSX"}
          <input type="file" accept=".csv,.xlsx" onChange={analyze} disabled={loading} style={{ display: "none" }} />
        </label>
        {filename && <span style={{ marginLeft: 14, color: "#667085" }}>{filename}</span>}
        {error && <p style={{ color: "#b42318", marginBottom: 0 }}>{error}</p>}
      </section>

      {kpis.length > 0 ? (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
          {kpis.map((kpi) => (
            <article key={kpi.id} style={{ background: "white", border: "1px solid #e7ebf2", borderRadius: 18, padding: 22 }}>
              <div style={{ color: "#667085", fontSize: 13 }}>{kpi.label}</div>
              <strong style={{ display: "block", marginTop: 10, fontSize: 30 }}>
                {kpi.value.toLocaleString()}{kpi.unit ? ` ${kpi.unit}` : ""}
              </strong>
            </article>
          ))}
        </section>
      ) : (
        <section style={{ background: "white", border: "1px dashed #cbd5e1", borderRadius: 18, padding: 48, textAlign: "center", color: "#667085" }}>
          <h2 style={{ color: "#172033" }}>Your KPI dashboard will appear here</h2>
          <p>Upload a business dataset to get started.</p>
        </section>
      )}
    </main>
  );
}
