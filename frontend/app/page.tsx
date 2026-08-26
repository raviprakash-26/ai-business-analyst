"use client";

import { ChangeEvent, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type DatasetResult = {
  filename: string;
  profile: {
    rows: number;
    columns: number;
    column_names: string[];
    missing_cells: number;
    duplicate_rows: number;
    quality_score: number;
  };
  preview: Record<string, unknown>[];
};

export default function Home() {
  const [status, setStatus] = useState("Not connected");
  const [dataset, setDataset] = useState<DatasetResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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

  async function uploadDataset(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setDataset(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${apiUrl}/datasets/profile`, {
        method: "POST",
        body: formData,
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.detail ?? "Dataset upload failed.");

      setDataset(body);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Dataset upload failed.");
    } finally {
      setUploading(false);
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
          Upload a business dataset to profile its structure, data quality and first rows before we build the full analytics engine.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
          <button onClick={checkBackend} style={buttonStyle}>
            Check API Connection
          </button>
          <label style={{ ...buttonStyle, background: "#eef2f7", color: "#172033" }}>
            {uploading ? "Profiling…" : "Upload CSV / XLSX"}
            <input type="file" accept=".csv,.xlsx" onChange={uploadDataset} disabled={uploading} style={{ display: "none" }} />
          </label>
          <span style={{ alignSelf: "center", color: "#566176" }}>{status}</span>
        </div>
        {error && <p style={{ color: "#b42318", marginTop: 18 }}>{error}</p>}
      </section>

      {dataset && (
        <section style={{ marginTop: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
            {[
              ["Rows", dataset.profile.rows],
              ["Columns", dataset.profile.columns],
              ["Missing Cells", dataset.profile.missing_cells],
              ["Duplicate Rows", dataset.profile.duplicate_rows],
              ["Quality Score", `${dataset.profile.quality_score}/100`],
            ].map(([label, value]) => (
              <article key={label} style={cardStyle}>
                <div style={{ color: "#718096", fontSize: 13 }}>{label}</div>
                <strong style={{ display: "block", fontSize: 24, marginTop: 8 }}>{value}</strong>
              </article>
            ))}
          </div>

          <article style={{ ...cardStyle, marginTop: 16, overflowX: "auto" }}>
            <h2 style={{ marginTop: 0 }}>Dataset Preview — {dataset.filename}</h2>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 650 }}>
              <thead>
                <tr>
                  {dataset.profile.column_names.map((column) => <th key={column} style={tableCellStyle}>{column}</th>)}
                </tr>
              </thead>
              <tbody>
                {dataset.preview.map((row, index) => (
                  <tr key={index}>
                    {dataset.profile.column_names.map((column) => <td key={column} style={tableCellStyle}>{String(row[column] ?? "—")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </section>
      )}

      {!dataset && (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 20 }}>
          {[
            ["01", "Upload & Profile", "Understand data quality before analysis."],
            ["02", "Analyze", "Generate KPIs, trends and business metrics."],
            ["03", "Explain", "Turn analytical results into clear business insights."],
            ["04", "Decide", "Support decisions with recommendations and scenarios."],
          ].map(([number, title, description]) => (
            <article key={number} style={cardStyle}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#718096" }}>{number}</div>
              <h2 style={{ fontSize: 20, margin: "10px 0" }}>{title}</h2>
              <p style={{ color: "#667085", lineHeight: 1.6, marginBottom: 0 }}>{description}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

const buttonStyle = { border: 0, borderRadius: 12, padding: "13px 18px", background: "#172033", color: "white", cursor: "pointer", fontWeight: 700 };
const cardStyle = { background: "white", borderRadius: 18, padding: 24, border: "1px solid #e7ebf2" };
const tableCellStyle = { padding: "10px 12px", borderBottom: "1px solid #e7ebf2", textAlign: "left" as const, whiteSpace: "nowrap" as const };
