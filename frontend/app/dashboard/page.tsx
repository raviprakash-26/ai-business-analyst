"use client";

import { ChangeEvent, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
type Kpi = { id: string; label: string; value: number; unit?: string };
type Insight = { type: string; title: string; message: string };
type Chart = { id: string; type: string; title: string; data?: { category: string; value: number }[] };

export default function DashboardPage() {
  const [data, setData] = useState<{ kpis: Kpi[]; insights: Insight[]; charts: Chart[]; filename: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true); setError("");
    try {
      const makeRequest = (path: string) => { const form = new FormData(); form.append("file", file); return fetch(`${apiUrl}${path}`, { method: "POST", body: form }); };
      const [kpiResponse, insightResponse, chartResponse] = await Promise.all([makeRequest("/analytics/kpis"), makeRequest("/insights/generate"), makeRequest("/charts/recommend")]);
      const [kpis, insights, charts] = await Promise.all([kpiResponse.json(), insightResponse.json(), chartResponse.json()]);
      if (!kpiResponse.ok) throw new Error(kpis.detail ?? "KPI analysis failed.");
      if (!insightResponse.ok) throw new Error(insights.detail ?? "Insight analysis failed.");
      if (!chartResponse.ok) throw new Error(charts.detail ?? "Chart analysis failed.");
      setData({ kpis: kpis.kpis ?? [], insights: insights.insights ?? [], charts: charts.charts ?? [], filename: file.name });
    } catch (err) { setError(err instanceof Error ? err.message : "Dashboard analysis failed."); }
    finally { setLoading(false); }
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
      <header style={headerStyle}>
        <div><p style={eyebrowStyle}>Executive Intelligence</p><h1 style={{ margin: "8px 0", fontSize: "clamp(34px, 5vw, 58px)" }}>Business Dashboard</h1><p style={{ color: "#667085", marginBottom: 0 }}>KPIs, evidence-backed insights, and recommended visual analysis.</p></div>
        <label style={buttonStyle}>{loading ? "Analyzing…" : "Analyze Dataset"}<input type="file" accept=".csv,.xlsx" onChange={analyze} disabled={loading} style={{ display: "none" }} /></label>
      </header>
      {error && <div style={errorStyle}>{error}</div>}
      {!data && !loading && !error && <section style={emptyStyle}>Upload a CSV or XLSX dataset to generate your executive dashboard.</section>}
      {data && <>
        <p style={{ color: "#667085", margin: "20px 0 12px" }}>Analyzing: <strong>{data.filename}</strong></p>
        <section style={kpiGrid}>{data.kpis.map(kpi => <article key={kpi.id} style={cardStyle}><div style={{ color: "#667085", fontSize: 13 }}>{kpi.label}</div><strong style={{ display: "block", marginTop: 8, fontSize: 28 }}>{kpi.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}{kpi.unit ? ` ${kpi.unit}` : ""}</strong></article>)}</section>
        <section style={sectionStyle}><div style={sectionHeading}><h2>Business Insights</h2><span>{data.insights.length} findings</span></div><div style={stackStyle}>{data.insights.length ? data.insights.map((x,i) => <article key={`${x.title}-${i}`} style={cardStyle}><div style={tagStyle}>{x.type}</div><h3 style={{ margin: "8px 0" }}>{x.title}</h3><p style={{ color: "#475467", lineHeight: 1.6, marginBottom: 0 }}>{x.message}</p></article>) : <div style={emptyStyle}>No significant patterns detected by the current rules.</div>}</div></section>
        <section style={sectionStyle}><div style={sectionHeading}><h2>Recommended Visual Analysis</h2><span>{data.charts.length} charts</span></div><div style={chartGrid}>{data.charts.map(chart => <ChartCard key={chart.id} chart={chart} />)}</div></section>
      </>}
    </main>
  );
}

function ChartCard({ chart }: { chart: Chart }) { const max = Math.max(...(chart.data?.map(x => x.value) ?? [1])); return <article style={cardStyle}><div style={tagStyle}>{chart.type}</div><h3 style={{ margin: "8px 0 18px" }}>{chart.title}</h3>{chart.data ? chart.data.map(item => <div key={item.category} style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>{item.category}</span><strong>{item.value.toLocaleString()}</strong></div><div style={{ height: 8, marginTop: 5, borderRadius: 99, background: "#edf0f5" }}><div style={{ height: "100%", width: `${Math.min(100, item.value / max * 100)}%`, borderRadius: 99, background: "#172033" }} /></div></div>) : <p style={{ color: "#667085", marginBottom: 0 }}>Visualization specification ready for richer chart rendering.</p>}</article>; }

const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, flexWrap: "wrap" as const, background: "white", borderRadius: 24, padding: 32, border: "1px solid #e7ebf2" };
const eyebrowStyle = { margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" as const, color: "#667085" };
const buttonStyle = { display: "inline-block", borderRadius: 12, padding: "13px 18px", background: "#172033", color: "white", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" as const };
const kpiGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 20 };
const cardStyle = { background: "white", borderRadius: 18, padding: 22, border: "1px solid #e7ebf2" };
const sectionStyle = { marginTop: 28 }; const sectionHeading = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }; const stackStyle = { display: "grid", gap: 12 }; const chartGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }; const tagStyle = { display: "inline-block", padding: "4px 8px", borderRadius: 999, background: "#eef2f7", color: "#475467", fontSize: 11, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: 0.7 }; const emptyStyle = { background: "white", borderRadius: 18, padding: 28, border: "1px solid #e7ebf2", color: "#667085" }; const errorStyle = { marginTop: 16, padding: 14, borderRadius: 12, background: "#fff1f0", color: "#b42318", border: "1px solid #fecdca" };
