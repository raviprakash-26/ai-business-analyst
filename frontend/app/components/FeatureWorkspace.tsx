"use client";

import { ChangeEvent, useMemo, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
type Mode = "intelligence" | "analyst" | "forecast" | "root-cause" | "recommendations" | "what-if";
type Props = { mode: Mode };
type ChatMessage = { role: "user" | "assistant"; content: string };

type AnyRow = Record<string, unknown>;

function parseCsvLine(line: string): string[] {
  const values: string[] = []; let current = ""; let quoted = false;
  for (let i = 0; i < line.length; i += 1) { const ch = line[i]; if (ch === '"') { if (quoted && line[i + 1] === '"') { current += '"'; i += 1; } else quoted = !quoted; } else if (ch === "," && !quoted) { values.push(current.trim()); current = ""; } else current += ch; }
  values.push(current.trim()); return values;
}
function parseCsv(text: string): AnyRow[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean); if (lines.length < 2) throw new Error("CSV must contain a header and at least one data row.");
  const headers = parseCsvLine(lines[0]).map((x, i) => x || `Column_${i + 1}`);
  return lines.slice(1).map(line => { const cells = parseCsvLine(line); return Object.fromEntries(headers.map((header, i) => { const raw = cells[i] ?? ""; if (!raw) return [header, null]; const cleaned = raw.replace(/[₹,%]/g, "").replace(/,/g, ""); const numeric = Number(cleaned); return [header, Number.isFinite(numeric) && /^[-+]?₹?[\d,\.]+%?$/.test(raw) ? numeric : raw]; })); });
}
function numericColumns(data: AnyRow[]) { return data.length ? Object.keys(data[0]).filter(k => data.some(r => typeof r[k] === "number")) : []; }

const titles: Record<Mode, [string, string, string]> = {
  intelligence: ["Dataset Intelligence", "Profile, summarize and rank your business data.", "DATASET INTELLIGENCE"],
  analyst: ["AI Business Analyst", "Ask the specialist to explain performance, evidence and management actions.", "AI SPECIALIST GPT"],
  forecast: ["Forecast", "Build a transparent directional baseline from historical observations.", "PREDICTIVE ANALYTICS"],
  "root-cause": ["Root Cause", "Identify the largest descriptive drivers behind revenue, profit or other metrics.", "DRIVER ANALYSIS"],
  recommendations: ["Recommendations", "Turn analytical evidence into prioritized decision-support actions.", "DECISION SUPPORT"],
  "what-if": ["What-If Analysis", "Test revenue and cost sensitivity before making a decision.", "SCENARIO SIMULATOR"],
};
const suggested = ["What is the overall business performance?", "Which region generates the most revenue?", "Which products contribute the most profit?", "What problems should management investigate?", "How can the company improve profit?", "What should management do next?"];

export default function FeatureWorkspace({ mode }: Props) {
  const [rows, setRows] = useState<AnyRow[]>([]); const [filename, setFilename] = useState(""); const [result, setResult] = useState<any>(null); const [question, setQuestion] = useState(suggested[0]); const [history, setHistory] = useState<ChatMessage[]>([]); const [revenueChange, setRevenueChange] = useState(10); const [costChange, setCostChange] = useState(5); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const nums = useMemo(() => numericColumns(rows), [rows]); const [title, subtitle, eyebrow] = titles[mode];
  async function post(path: string, body: unknown) { const r = await fetch(`${apiUrl}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const d = await r.json(); if (!r.ok) throw new Error(d.detail || `Request failed: ${r.status}`); return d; }
  async function loadFile(e: ChangeEvent<HTMLInputElement>) { const file = e.target.files?.[0]; if (!file) return; setLoading(true); setError(""); setResult(null); setHistory([]); try { if (!file.name.toLowerCase().endsWith(".csv")) throw new Error("This workspace currently accepts CSV files. Use Dashboard for CSV/XLSX ingestion."); const parsed = parseCsv(await file.text()); setRows(parsed); setFilename(file.name); await runFeature(parsed, file.name); } catch (err) { setError(err instanceof Error ? err.message : "Analysis failed."); } finally { setLoading(false); } }
  async function runFeature(data = rows, name = filename) { if (!data.length) return; setLoading(true); setError(""); try { const payload = { rows: data, filename: name }; const columns = numericColumns(data); const preferred = ["Revenue", "Profit", "Cost", "Quantity"].find(x => columns.includes(x)) || columns[0];
      if (mode === "intelligence" || mode === "analyst") { const analysis = await post("/intelligence/analyze-preview", payload); setResult(mode === "analyst" ? { analysis } : analysis); }
      else if (mode === "forecast") { if (!preferred) throw new Error("No numeric metric was found in the CSV."); setResult(await post("/forecast/preview", { rows: data, metric: preferred, periods: 6 })); }
      else if (mode === "root-cause") { const metric = data[0].Profit !== undefined ? "Profit" : data[0].Revenue !== undefined ? "Revenue" : preferred; if (!metric) throw new Error("No numeric metric was found in the CSV."); setResult(await post("/root-cause/preview", { rows: data, metric })); }
      else if (mode === "recommendations") { const analysis = await post("/intelligence/analyze-preview", payload); const [anomalies, drivers, forecast] = await Promise.all([post("/anomalies/preview", payload).catch(() => ({})), post("/root-cause/preview", { rows: data, metric: data[0].Profit !== undefined ? "Profit" : preferred }).catch(() => ({})), preferred ? post("/forecast/preview", { rows: data, metric: data[0].Revenue !== undefined ? "Revenue" : preferred, periods: 3 }).catch(() => ({})) : Promise.resolve({})]); setResult(await post("/recommendations/preview", { summary: analysis.summary, anomalies, drivers, forecast })); }
      else { const analysis = await post("/intelligence/analyze-preview", payload); const revenue = Number(analysis.summary?.revenue ?? 0); const profit = Number(analysis.summary?.profit ?? 0); if (revenue <= 0) throw new Error("The dataset needs a positive Revenue column for What-If analysis."); setResult(await post("/scenarios/what-if", { revenue, profit, revenue_change_pct: revenueChange, cost_change_pct: costChange })); }
    } catch (err) { setError(err instanceof Error ? err.message : "Analysis failed."); } finally { setLoading(false); } }
  async function askSpecialist(nextQuestion = question) { if (!rows.length || !nextQuestion.trim()) return; setLoading(true); setError(""); try { const analysis = result?.analysis || await post("/intelligence/analyze-preview", { rows, filename }); const next = [...history, { role: "user" as const, content: nextQuestion }]; const answer = await post("/analyst/specialist", { question: nextQuestion, analysis, history: next }); setResult({ analysis, specialist: answer }); setHistory([...next, { role: "assistant", content: answer.answer }]); } catch (err) { setError(err instanceof Error ? err.message : "Specialist analysis failed."); } finally { setLoading(false); } }

  return <main style={page}><section style={hero} className="glass"><div style={{ maxWidth: 820 }}><div style={eyebrow}>{eyebrow}</div><h1 style={h1}>{title}</h1><p style={subtitleStyle}>{subtitle}</p><div style={actions}><label className="glow-button" style={uploadButton}>{loading ? "Working…" : "☁ Upload CSV"}<input type="file" accept=".csv" onChange={loadFile} disabled={loading} style={{ display: "none" }} /></label>{filename && <span style={datasetPill}>● {filename} · {rows.length.toLocaleString()} rows · {nums.length} numeric fields</span>}</div>{error && <div style={errorStyle}>{error}</div>}</div><div style={orb}><strong>AI</strong><span>ANALYTICS<br/>ENGINE</span></div></section>
    {mode === "analyst" && rows.length > 0 && <Specialist question={question} setQuestion={setQuestion} ask={askSpecialist} loading={loading} history={history} result={result?.specialist} />}
    {mode === "what-if" && rows.length > 0 && <section style={panel} className="glass"><div style={sectionTitle}><div><div style={eyebrowSmall}>Scenario controls</div><h2 style={h2}>Sensitivity simulator</h2></div><span style={statusPill}>LIVE MODEL</span></div><div style={controlGrid}><label style={control}>Revenue change %<input type="number" value={revenueChange} onChange={e => setRevenueChange(Number(e.target.value))} style={input} /></label><label style={control}>Cost change %<input type="number" value={costChange} onChange={e => setCostChange(Number(e.target.value))} style={input} /></label><button onClick={() => runFeature()} className="glow-button" style={actionButton}>Run Scenario →</button></div></section>}
    {result && mode !== "analyst" && <Result mode={mode} result={result} />}
    {!result && !error && <section style={empty} className="glass"><div style={emptyIcon}>✦</div><h2 style={h2}>Ready for analysis</h2><p style={muted}>Upload a CSV to activate this workspace. The analytics engine will calculate evidence before presenting conclusions.</p></section>}
  </main>;
}

function Specialist({ question, setQuestion, ask, loading, history, result }: { question: string; setQuestion: (v: string) => void; ask: (q?: string) => void; loading: boolean; history: ChatMessage[]; result: any }) { return <><section style={panel} className="glass"><div style={sectionTitle}><div><div style={eyebrowSmall}>AI SPECIALIST GPT</div><h2 style={h2}>Business Analyst Specialist</h2><p style={muted}>Dataset-grounded answers · evidence · recommendations · management actions</p></div><span style={online}>● Specialist online</span></div><div style={chatRow}><input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => { if (e.key === "Enter") ask(question); }} style={{ ...input, flex: 1, minWidth: 240 }} placeholder="Ask anything about the uploaded business data…" /><button onClick={() => ask(question)} disabled={loading || !question.trim()} className="glow-button" style={actionButton}>{loading ? "Analyzing…" : "Ask Specialist"}</button></div><div style={chips}>{suggested.map(q => <button key={q} onClick={() => { setQuestion(q); ask(q); }} style={chip}>{q}</button>)}</div></section>{history.length > 0 && <section style={panel} className="glass"><div style={eyebrowSmall}>CONVERSATION</div>{history.map((m, i) => <div key={i} style={{ ...message, background: m.role === "user" ? "rgba(59,130,246,.08)" : "rgba(255,255,255,.025)" }}><strong>{m.role === "user" ? "You" : "Business Analyst Specialist"}</strong><p>{m.content}</p></div>)}</section>}{result && <section style={panel} className="glass"><div style={sectionTitle}><div style={eyebrowSmall}>VERIFIED SPECIALIST ANALYSIS</div><span style={statusPill}>✓ GROUNDED</span></div><p style={answer}>{result.answer}</p>{result.recommendations?.length > 0 && <div style={{ marginTop: 22 }}><h3>Management actions</h3>{result.recommendations.map((r: any, i: number) => <article key={i} style={recommendation}><div style={sectionTitle}><strong>{r.action}</strong><span style={priority}>{r.priority}</span></div><p>{r.reason}</p><small>{r.objective}</small></article>)}</div>}{result.tools_used?.length > 0 && <p style={muted}>Analytics used: {result.tools_used.join(" · ")}</p>}</section>}</> }

function Result({ mode, result }: { mode: Mode; result: any }) { if (mode === "forecast") return <section style={panel} className="glass"><div style={eyebrowSmall}>BASELINE FORECAST</div><h2 style={h2}>Trend: <span style={accent}>{result.trend}</span></h2><div style={metricGrid}>{result.forecast?.map((v: number, i: number) => <Metric key={i} label={`Period ${i + 1}`} value={`₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} />)}</div><p style={muted}>{result.note}</p></section>;
  if (mode === "root-cause") return <section style={panel} className="glass"><div style={eyebrowSmall}>DESCRIPTIVE DRIVERS</div><h2 style={h2}>Total {result.metric}: <span style={accent}>₹{Number(result.total).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></h2>{result.drivers?.slice(0, 12).map((d: any, i: number) => <div key={i} style={driverRow}><strong>{d.label}</strong><span>{d.dimension}</span><span>₹{Number(d.value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span><span>{Number(d.share_pct).toFixed(1)}%</span></div>)}<p style={muted}>{result.note}</p></section>;
  if (mode === "recommendations") return <section style={panel} className="glass"><div style={eyebrowSmall}>PRIORITIZED ACTIONS</div>{result.recommendations?.map((r: any, i: number) => <article key={i} style={recommendation}><span style={priority}>{r.priority}</span><h3>{r.finding}</h3><p>{r.action}</p></article>)}<p style={muted}>{result.note}</p></section>;
  if (mode === "what-if") return <section style={panel} className="glass"><div style={eyebrowSmall}>SENSITIVITY RESULT</div><div style={metricGrid}><Metric label="Projected Revenue" value={`₹${Number(result.projected?.revenue).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} /><Metric label="Projected Profit" value={`₹${Number(result.projected?.profit).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} /><Metric label="Profit Impact" value={`₹${Number(result.impact?.profit_delta).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} /><Metric label="Margin" value={`${Number(result.projected?.margin_pct).toFixed(2)}%`} /></div><p style={muted}>{result.note}</p></section>;
  const s = result.summary || {}; return <section style={panel} className="glass"><div style={eyebrowSmall}>BACKEND-CALCULATED INTELLIGENCE</div><div style={metricGrid}>{[["Rows",s.rows],["Columns",s.columns],["Revenue",s.revenue],["Profit",s.profit],["Profit Margin",s.profit_margin !== undefined ? `${Number(s.profit_margin).toFixed(2)}%` : "—"]].map(([label,value]) => <Metric key={String(label)} label={String(label)} value={typeof value === "number" ? Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 }) : String(value ?? "—")} />)}</div></section>; }
function Metric({ label, value }: { label: string; value: string }) { return <div style={metric}><span>{label}</span><strong>{value}</strong></div>; }

const page={maxWidth:1280,margin:"0 auto",padding:"40px 28px 70px"};
const hero={minHeight:360,padding:"48px 50px",borderRadius:28,display:"flex",alignItems:"center",justifyContent:"space-between",gap:30,background:"linear-gradient(135deg,rgba(19,38,65,.88),rgba(37,24,70,.72))",border:"1px solid rgba(148,163,184,.16)",boxShadow:"0 30px 90px rgba(0,0,0,.24)"};
const h1={fontSize:"clamp(38px,6vw,68px)",lineHeight:1,letterSpacing:-2.5,margin:"14px 0 16px",maxWidth:850};
const subtitleStyle={fontSize:16,lineHeight:1.7,color:"#a9b8cc",maxWidth:700,margin:0};
const uploadButton={display:"inline-block",padding:"13px 18px",borderRadius:12,color:"white",fontWeight:800,cursor:"pointer"};
const actions={display:"flex",gap:10,flexWrap:"wrap" as const,alignItems:"center",marginTop:25};
const datasetPill={padding:"10px 13px",borderRadius:999,background:"rgba(45,212,191,.08)",border:"1px solid rgba(45,212,191,.18)",color:"#9de9df",fontSize:11};
const orb={width:220,height:220,borderRadius:"50%",display:"grid",placeItems:"center",alignContent:"center",flexShrink:0,textAlign:"center" as const,background:"radial-gradient(circle,rgba(99,102,241,.42),rgba(14,165,233,.1) 48%,transparent 70%)",border:"1px solid rgba(139,92,246,.24)",boxShadow:"0 0 100px rgba(99,102,241,.12),inset 0 0 60px rgba(99,102,241,.12)",color:"white"};
const panel={marginTop:16,padding:26,borderRadius:20,border:"1px solid rgba(148,163,184,.14)"};
const sectionTitle={display:"flex",justifyContent:"space-between",alignItems:"center",gap:15,flexWrap:"wrap" as const};
const h2={margin:"5px 0",fontSize:22};
const eyebrowSmall={fontSize:10,fontWeight:850,letterSpacing:1.4,color:"#8fa4bf"};
const muted={color:"#8fa4bf",lineHeight:1.65,fontSize:13};
const statusPill={padding:"5px 8px",borderRadius:999,background:"rgba(45,212,191,.1)",color:"#5eead4",fontSize:9,fontWeight:850};
const controlGrid={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginTop:20,alignItems:"end"};
const control={display:"grid",gap:7,color:"#9fb0c7",fontSize:12};
const input={width:"100%",border:"1px solid rgba(148,163,184,.18)",borderRadius:11,padding:"12px 13px",background:"rgba(5,16,29,.65)",color:"#f8fbff",outline:"none"};
const actionButton={border:0,padding:"12px 16px",borderRadius:11,color:"white",fontWeight:800,cursor:"pointer"};
const empty={marginTop:16,padding:42,borderRadius:20,border:"1px solid rgba(148,163,184,.14)",textAlign:"center" as const};
const emptyIcon={width:52,height:52,borderRadius:16,display:"grid",placeItems:"center",margin:"0 auto 12px",background:"linear-gradient(135deg,rgba(37,99,235,.25),rgba(139,92,246,.25))",color:"#c4b5fd",fontSize:22};
const online={padding:"7px 10px",borderRadius:999,background:"rgba(45,212,191,.08)",color:"#5eead4",fontSize:10};
const chatRow={display:"flex",gap:10,marginTop:20,flexWrap:"wrap" as const};
const chips={display:"flex",gap:8,flexWrap:"wrap" as const,marginTop:13};
const chip={padding:"8px 10px",borderRadius:999,border:"1px solid rgba(148,163,184,.14)",background:"rgba(255,255,255,.025)",color:"#9fb0c7",fontSize:10,cursor:"pointer"};
const message={padding:15,borderRadius:14,border:"1px solid rgba(148,163,184,.1)",marginTop:10};
const answer={fontSize:16,lineHeight:1.8,color:"#e6edf7"};
const recommendation={padding:16,borderRadius:14,background:"rgba(255,255,255,.025)",border:"1px solid rgba(148,163,184,.1)",marginTop:10};
const priority={padding:"4px 7px",borderRadius:999,background:"rgba(139,92,246,.14)",color:"#c4b5fd",fontSize:9,fontWeight:800};
const metricGrid={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginTop:18};
const metric={padding:"17px",borderRadius:15,background:"rgba(11,27,47,.7)",border:"1px solid rgba(148,163,184,.12)"};
const driverRow={display:"grid",gridTemplateColumns:"1.4fr .8fr 1fr .5fr",gap:10,alignItems:"center",padding:"13px 0",borderBottom:"1px solid rgba(148,163,184,.09)",color:"#b6c4d6",fontSize:12};
const accent={color:"#7dd3fc"};
const errorStyle={marginTop:16,padding:13,borderRadius:12,background:"rgba(127,29,29,.25)",color:"#fca5a5",border:"1px solid rgba(248,113,113,.2)"};
