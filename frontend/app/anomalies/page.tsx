"use client";

import { ChangeEvent, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Anomaly = { row: number; column: string; value: number; z_score: number; direction: string };

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch(`${apiUrl}/anomalies/detect`, { method: "POST", body: form });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail ?? "Anomaly detection failed.");
      setAnomalies(body.anomalies ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Anomaly detection failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "56px 24px" }}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Risk Analytics</p>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 62px)", margin: "10px 0" }}>Anomaly Detection</h1>
        <p style={{ color: "#667085", lineHeight: 1.6, fontSize: 18 }}>
          Detect unusually high or low numeric observations that may need business investigation.
        </p>
        <label style={buttonStyle}>
          {loading ? "Detecting…" : "Upload Dataset"}
          <input type="file" accept=".csv,.xlsx" onChange={analyze} disabled={loading} style={{ display: "none" }} />
        </label>
        {error && <p style={{ color: "#b42318" }}>{error}</p>}
      </section>

      <section style={{ marginTop: 18, display: "grid", gap: 12 }}>
        {anomalies.length === 0 && !loading && <article style={cardStyle}>No anomalies detected by the current z-score rule.</article>}
        {anomalies.map((item, index) => (
          <article key={`${item.column}-${item.row}-${index}`} style={cardStyle}>
            <div style={tagStyle}>{item.direction} anomaly</div>
            <h2 style={{ margin: "10px 0" }}>{item.column}</h2>
            <p style={{ color: "#475467", marginBottom: 0 }}>Row {item.row} · Value {item.value.toLocaleString()} · z-score {item.z_score}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

const cardStyle = { background: "white", borderRadius: 22, padding: 30, border: "1px solid #e7ebf2" };
const eyebrowStyle = { margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" as const, color: "#667085" };
const buttonStyle = { display: "inline-block", marginTop: 14, borderRadius: 12, padding: "13px 18px", background: "#172033", color: "white", cursor: "pointer", fontWeight: 800 };
const tagStyle = { display: "inline-block", padding: "5px 9px", borderRadius: 999, background: "#fff1f0", color: "#b42318", fontSize: 11, fontWeight: 800, textTransform: "uppercase" as const };
