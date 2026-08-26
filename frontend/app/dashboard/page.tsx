"use client";

import { ChangeEvent, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
type Kpi = { id: string; label: string; value: number; unit?: string };
type Insight = { type: string; title: string; message: string };
type ChartPoint = { category: string; value: number };
type ScatterPoint = { x: number; y: number };
type Chart = { id: string; type: string; title: string; x?: string; y?: string; data?: ChartPoint[] | ScatterPoint[] };

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

function ChartCard({ chart }: { chart: Chart }) {
  const isBar = chart.type === "bar";
  const isHistogram = chart.type === "histogram";
  const isScatter = chart.type === "scatter";
  if (isScatter) return <article style={cardStyle}><div style={tagStyle}>{chart.type}</div><h3 style={{ margin: "8px 0 12px" }}>{chart.title}</h3><ScatterChart data={(chart.data ?? []) as ScatterPoint[]} xLabel={chart.x ?? "X"} yLabel={chart.y ?? "Y"} /></article>;
  if (isHistogram) return <article style={cardStyle}><div style={tagStyle}>{chart.type}</div><h3 style={{ margin: "8px 0 12px" }}>{chart.title}</h3><HistogramChart data={(chart.data ?? []) as ChartPoint[]} /></article>;
  if (isBar) return <article style={cardStyle}><div style={tagStyle}>{chart.type}</div><h3 style={{ margin: "8px 0 18px" }}>{chart.title}</h3><BarChart data={(chart.data ?? []) as ChartPoint[]} /></article>;
  return <article style={cardStyle}><div style={tagStyle}>{chart.type}</div><h3 style={{ margin: "8px 0 18px" }}>{chart.title}</h3><p style={{ color: "#667085", marginBottom: 0 }}>No renderable chart data was returned.</p></article>;
}

function BarChart({ data }: { data: ChartPoint[] }) {
  const max = Math.max(...data.map(x => x.value), 1);
  return <div style={{ height: 300, display: "flex", alignItems: "end", gap: 10, padding: "24px 8px 36px", borderBottom: "1px solid #d0d5dd" }}>
    {data.map((item, index) => <div key={`${item.category}-${index}`} title={`${item.category}: ${item.value.toLocaleString()}`} style={{ flex: 1, minWidth: 18, height: `${Math.max(4, item.value / max * 100)}%`, background: "#172033", borderRadius: "7px 7px 0 0", position: "relative" }}><span style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: 8, fontSize: 10, color: "#667085", whiteSpace: "nowrap", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis" }}>{item.category}</span></div>)}
  </div>;
}

function HistogramChart({ data }: { data: ChartPoint[] }) {
  const max = Math.max(...data.map(x => x.value), 1);
  return <div style={{ height: 300, display: "flex", alignItems: "end", gap: 4, padding: "24px 8px 42px", borderBottom: "1px solid #d0d5dd" }}>
    {data.map((item, index) => <div key={`${item.category}-${index}`} title={`${item.category}: ${item.value.toLocaleString()} rows`} style={{ flex: 1, minWidth: 8, height: `${Math.max(3, item.value / max * 100)}%`, background: "#172033", borderRadius: "4px 4px 0 0", position: "relative" }}><span style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%) rotate(-42deg)", transformOrigin: "top left", marginTop: 7, fontSize: 8, color: "#667085", whiteSpace: "nowrap" }}>{item.category}</span></div>)}
  </div>;
}

function ScatterChart({ data, xLabel, yLabel }: { data: ScatterPoint[]; xLabel: string; yLabel: string }) {
  if (!data.length) return <div style={{ height: 300, display: "grid", placeItems: "center", color: "#667085" }}>No numeric point pairs available.</div>;
  const xs = data.map(p => p.x); const ys = data.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const dx = maxX - minX || 1, dy = maxY - minY || 1;
  return <div style={{ position: "relative", height: 300, borderLeft: "1px solid #d0d5dd", borderBottom: "1px solid #d0d5dd", margin: "8px 10px 36px 24px" }}>
    {data.map((p, i) => { const left = ((p.x - minX) / dx) * 96 + 2; const top = 98 - ((p.y - minY) / dy) * 96; return <span key={i} title={`${xLabel}: ${p.x.toLocaleString()} · ${yLabel}: ${p.y.toLocaleString()}`} style={{ position: "absolute", left: `${left}%`, top: `${top}%`, width: 7, height: 7, borderRadius: "50%", background: "#172033", transform: "translate(-50%, -50%)" }} />; })}
    <span style={{ position: "absolute", left: "50%", bottom: -30, transform: "translateX(-50%)", fontSize: 10, color: "#667085" }}>{xLabel}</span>
    <span style={{ position: "absolute", left: -32, top: "50%", transform: "rotate(-90deg) translateX(-50%)", transformOrigin: "left top", fontSize: 10, color: "#667085" }}>{yLabel}</span>
  </div>;
}

const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, flexWrap: "wrap" as const, background: "white", borderRadius: 24, padding: 32, border: "1px solid #e7ebf2" };
const eyebrowStyle = { margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" as const, color: "#667085" };
const buttonStyle = { display: "inline-block", borderRadius: 12, padding: "13px 18px", background: "#172033", color: "white", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" as const };
const kpiGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 20 };
const cardStyle = { background: "white", borderRadius: 18, padding: 22, border: "1px solid #e7ebf2" };
const sectionStyle = { marginTop: 28 }; const sectionHeading = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }; const stackStyle = { display: "grid", gap: 12 }; const chartGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }; const tagStyle = { display: "inline-block", padding: "4px 8px", borderRadius: 999, background: "#eef2f7", color: "#475467", fontSize: 11, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: 0.7 }; const emptyStyle = { background: "white", borderRadius: 18, padding: 28, border: "1px solid #e7ebf2", color: "#667085" }; const errorStyle = { marginTop: 16, padding: 14, borderRadius: 12, background: "#fff1f0", color: "#b42318", border: "1px solid #fecdca" };
