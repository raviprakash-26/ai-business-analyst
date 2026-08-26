"use client";

import { ChangeEvent, useMemo, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

type Mode = "intelligence" | "analyst" | "forecast" | "root-cause" | "recommendations" | "what-if";

type Props = { mode: Mode };

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { current += '"'; i += 1; }
      else quoted = !quoted;
    } else if (ch === "," && !quoted) { values.push(current.trim()); current = ""; }
    else current += ch;
  }
  values.push(current.trim());
  return values;
}

function parseCsv(text: string): Record<string, unknown>[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error("CSV must contain a header and at least one data row.");
  const headers = parseCsvLine(lines[0]).map((x, i) => x || `Column_${i + 1}`);
  return lines.slice(1).map(line => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, i) => {
      const raw = cells[i] ?? "";
      if (raw === "") return [header, null];
      const numeric = Number(raw.replace(/₹|,/g, ""));
      return [header, Number.isFinite(numeric) && /^[-+]?₹?[,\d.]+%?$/.test(raw) ? numeric : raw];
    }));
  });
}

const titles: Record<Mode, [string, string]> = {
  intelligence: ["Dataset Intelligence", "Profile, summarize and rank the uploaded business data."],
  analyst: ["AI Analyst", "Ask business questions and receive evidence-backed answers from your dataset."],
  forecast: ["Forecast", "Generate a transparent directional baseline from historical numeric observations."],
  "root-cause": ["Root Cause", "Identify the largest descriptive drivers behind revenue, profit or other metrics."],
  recommendations: ["Recommendations", "Turn analytical evidence into prioritized decision-support actions."],
  "what-if": ["What-If Analysis", "Test revenue and cost sensitivity scenarios before making decisions."],
};

export default function FeatureWorkspace({ mode }: Props) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [filename, setFilename] = useState("");
  const [result, setResult] = useState<any>(null);
  const [question, setQuestion] = useState("Which region has the highest revenue?");
  const [revenueChange, setRevenueChange] = useState(10);
  const [costChange, setCostChange] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const numericColumns = useMemo(() => rows.length ? Object.keys(rows[0]).filter(k => rows.some(r => typeof r[k] === "number")) : [], [rows]);

  async function post(path: string, body: unknown) {
    const response = await fetch(`${apiUrl}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || `Request failed: ${response.status}`);
    return data;
  }

  async function loadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true); setError(""); setResult(null);
    try {
      if (!file.name.toLowerCase().endsWith(".csv")) throw new Error("This workspace currently accepts CSV files. Use Dashboard for CSV/XLSX ingestion.");
      const parsed = parseCsv(await file.text());
      setRows(parsed); setFilename(file.name);
      await runFeature(parsed, file.name);
    } catch (err) { setError(err instanceof Error ? err.message : "Analysis failed."); }
    finally { setLoading(false); }
  }

  async function runFeature(data = rows, name = filename) {
    if (!data.length) return;
    setLoading(true); setError("");
    try {
      const payload = { rows: data, filename: name };
      if (mode === "intelligence") setResult(await post("/intelligence/analyze-preview", payload));
      else if (mode === "analyst") setResult({ analysis: await post("/intelligence/analyze-preview", payload) });
      else if (mode === "forecast") {
        const metric = ["Revenue", "Profit", "Cost", "Quantity"].find(x => numericColumns.includes(x)) || numericColumns[0];
        if (!metric) throw new Error("No numeric metric was found in the CSV.");
        setResult(await post("/forecast/preview", { rows: data, metric, periods: 6 }));
      } else if (mode === "root-cause") {
        const metric = data[0].Profit !== undefined ? "Profit" : data[0].Revenue !== undefined ? "Revenue" : numericColumns[0];
        if (!metric) throw new Error("No numeric metric was found in the CSV.");
        setResult(await post("/root-cause/preview", { rows: data, metric }));
      } else if (mode === "recommendations") {
        const analysis = await post("/intelligence/analyze-preview", payload);
        const [anomalies, drivers, forecast] = await Promise.all([
          post("/anomalies/preview", payload).catch(() => ({})),
          post("/root-cause/preview", { rows: data, metric: data[0].Profit !== undefined ? "Profit" : "Revenue" }).catch(() => ({})),
          post("/forecast/preview", { rows: data, metric: data[0].Revenue !== undefined ? "Revenue" : numericColumns[0], periods: 3 }).catch(() => ({})),
        ]);
        setResult(await post("/recommendations/preview", { summary: analysis.summary, anomalies, drivers, forecast }));
      } else {
        const analysis = await post("/intelligence/analyze-preview", payload);
        const revenue = Number(analysis.summary?.revenue ?? 0);
        const profit = Number(analysis.summary?.profit ?? 0);
        if (revenue <= 0) throw new Error("The dataset needs a positive Revenue column for What-If analysis.");
        setResult(await post("/scenarios/what-if", { revenue, profit, revenue_change_pct: revenueChange, cost_change_pct: costChange }));
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Analysis failed."); }
    finally { setLoading(false); }
  }

  async function askQuestion() {
    if (!rows.length) return;
    setLoading(true); setError("");
    try {
      const analysis = result?.analysis || await post("/intelligence/analyze-preview", { rows, filename });
      const answer = await post("/analyst/ask", { question, analysis });
      setResult({ analysis, answer });
    } catch (err) { setError(err instanceof Error ? err.message : "AI Analyst request failed."); }
    finally { setLoading(false); }
  }

  const [title, subtitle] = titles[mode];
  return <main style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
    <section style={cardStyle}>
      <p style={eyebrowStyle}>Decision Intelligence</p>
      <h1 style={{ fontSize: "clamp(36px, 6vw, 58px)", margin: "8px 0" }}>{title}</h1>
      <p style={{ color: "#667085", fontSize: 17, lineHeight: 1.6 }}>{subtitle}</p>
      <label style={buttonStyle}>{loading ? "Working…" : "Upload CSV"}<input type="file" accept=".csv" onChange={loadFile} disabled={loading} style={{ display: "none" }} /></label>
      {filename && <span style={{ marginLeft: 12, color: "#667085", fontSize: 13 }}>{filename} · {rows.length.toLocaleString()} rows</span>}
      {error && <p style={errorStyle}>{error}</p>}
    </section>

    {mode === "analyst" && rows.length > 0 && <section style={cardStyle}><h2>Ask a business question</h2><div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><input value={question} onChange={e => setQuestion(e.target.value)} style={inputStyle} /><button onClick={askQuestion} style={buttonStyle}>Ask Analyst</button></div></section>}
    {mode === "what-if" && rows.length > 0 && <section style={cardStyle}><h2>Scenario controls</h2><div style={controlGrid}><label>Revenue change %<input type="number" value={revenueChange} onChange={e => setRevenueChange(Number(e.target.value))} style={inputStyle} /></label><label>Cost change %<input type="number" value={costChange} onChange={e => setCostChange(Number(e.target.value))} style={inputStyle} /></label><button onClick={() => runFeature()} style={buttonStyle}>Run Scenario</button></div></section>}

    {result && <Result mode={mode} result={result} />}
    {!result && !error && <section style={cardStyle}><p style={{ margin: 0, color: "#667085" }}>Upload a CSV to activate this workspace.</p></section>}
  </main>;
}

function Result({ mode, result }: { mode: Mode; result: any }) {
  if (mode === "analyst") return <section style={cardStyle}><p style={eyebrowStyle}>Evidence-backed answer</p><h2>{result.answer?.answer || "Ready for your question"}</h2><p style={{ color: "#667085" }}>{result.answer?.next_action}</p>{result.answer?.tools_used?.length > 0 && <p style={smallStyle}>Tools used: {result.answer.tools_used.join(", ")}</p>}</section>;
  if (mode === "forecast") return <section style={cardStyle}><p style={eyebrowStyle}>Baseline forecast</p><h2>Trend: {result.trend}</h2><div style={gridStyle}>{result.forecast?.map((v: number, i: number) => <div key={i} style={metricStyle}><span>Period {i + 1}</span><strong>₹{Number(v).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong></div>)}</div><p style={smallStyle}>{result.note}</p></section>;
  if (mode === "root-cause") return <section style={cardStyle}><p style={eyebrowStyle}>Descriptive drivers</p><h2>Total {result.metric}: ₹{Number(result.total).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</h2>{result.drivers?.slice(0, 12).map((d: any, i: number) => <div key={i} style={rowStyle}><strong>{d.label}</strong><span>{d.dimension}</span><span>₹{Number(d.value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span><span>{Number(d.share_pct).toFixed(1)}%</span></div>)}<p style={smallStyle}>{result.note}</p></section>;
  if (mode === "recommendations") return <section style={cardStyle}><p style={eyebrowStyle}>Prioritized actions</p>{result.recommendations?.map((r: any, i: number) => <article key={i} style={recommendationStyle}><strong>{r.priority}</strong><h3>{r.finding}</h3><p>{r.action}</p></article>)}<p style={smallStyle}>{result.note}</p></section>;
  if (mode === "what-if") return <section style={cardStyle}><p style={eyebrowStyle}>Sensitivity result</p><div style={gridStyle}><div style={metricStyle}><span>Projected Revenue</span><strong>₹{Number(result.projected?.revenue).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong></div><div style={metricStyle}><span>Projected Profit</span><strong>₹{Number(result.projected?.profit).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong></div><div style={metricStyle}><span>Profit Impact</span><strong>₹{Number(result.impact?.profit_delta).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong></div><div style={metricStyle}><span>Margin</span><strong>{Number(result.projected?.margin_pct).toFixed(2)}%</strong></div></div><p style={smallStyle}>{result.note}</p></section>;
  const s = result.summary || {};
  return <section style={cardStyle}><p style={eyebrowStyle}>Backend-calculated intelligence</p><div style={gridStyle}>{[["Rows",s.rows],["Columns",s.columns],["Revenue",s.revenue],["Profit",s.profit],["Profit Margin",s.profit_margin !== undefined ? `${Number(s.profit_margin).toFixed(2)}%` : "—"]].map(([label,value]) => <div key={String(label)} style={metricStyle}><span>{label}</span><strong>{typeof value === "number" ? Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 }) : value}</strong></div>)}</div></section>;
}

const cardStyle = { background: "white", borderRadius: 20, padding: 28, border: "1px solid #e7ebf2", marginTop: 16 };
const eyebrowStyle = { margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase" as const, color: "#667085" };
const buttonStyle = { display: "inline-block", border: 0, borderRadius: 12, padding: "13px 18px", background: "#172033", color: "white", cursor: "pointer", fontWeight: 800 };
const inputStyle = { border: "1px solid #d0d5dd", borderRadius: 10, padding: "12px 13px", minWidth: 260, fontSize: 14 };
const errorStyle = { marginTop: 16, padding: 14, borderRadius: 12, background: "#fff1f0", color: "#b42318", border: "1px solid #fecdca" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginTop: 16 };
const metricStyle = { background: "#f6f8fb", borderRadius: 12, padding: 15, display: "grid", gap: 6, color: "#667085", fontSize: 12 };
const rowStyle = { display: "flex", gap: 16, flexWrap: "wrap" as const, padding: "11px 0", borderTop: "1px solid #e7ebf2", fontSize: 13 };
const recommendationStyle = { padding: 16, marginTop: 10, borderRadius: 14, background: "#f6f8fb" };
const controlGrid = { display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" as const };
const smallStyle = { color: "#667085", fontSize: 12, lineHeight: 1.6 };
