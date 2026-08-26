"use client";

import { useState } from "react";
import { DatasetResult } from "../lib/dataset-session";

type Props = { dataset: DatasetResult; analysis: any };

export default function AnalystPanel({ dataset, analysis }: Props) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  async function ask() {
    if (!question.trim() || !analysis) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(`${apiUrl}/analyst/ask`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, analysis }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail ?? "Analyst request failed");
      setResult(body);
    } catch (e) { setError(e instanceof Error ? e.message : "Analyst request failed"); }
    finally { setLoading(false); }
  }

  return <section style={cardStyle}>
    <div style={eyebrowStyle}>AI Business Analyst</div>
    <h2 style={{ margin: "8px 0 6px" }}>Ask a question about {dataset.filename}</h2>
    <p style={{ color: "#667085", marginTop: 0 }}>Answers are grounded in the current analytical evidence.</p>
    <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
      <input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void ask(); }} placeholder="e.g. Which region has the highest revenue?" style={inputStyle} />
      <button type="button" onClick={ask} disabled={loading || !analysis} style={buttonStyle}>{loading ? "Analyzing…" : "Ask Analyst"}</button>
    </div>
    {error && <p style={{ color: "#b42318" }}>{error}</p>}
    {result && <div style={{ marginTop: 20, display: "grid", gap: 12 }}><div style={answerStyle}><div style={eyebrowStyle}>Answer</div><p style={{ fontSize: 18, lineHeight: 1.55, marginBottom: 0 }}>{result.answer}</p></div><div style={evidenceStyle}><strong>Evidence</strong><pre style={{ whiteSpace: "pre-wrap", fontSize: 12, marginBottom: 0 }}>{JSON.stringify(result.evidence, null, 2)}</pre></div><div style={nextStyle}><strong>Next action</strong><p style={{ marginBottom: 0 }}>{result.next_action}</p></div></div>}
  </section>;
}
const cardStyle={background:"white",borderRadius:20,padding:26,border:"1px solid #e7ebf2"};
const eyebrowStyle={margin:0,fontSize:11,fontWeight:800,letterSpacing:1.4,textTransform:"uppercase" as const,color:"#667085"};
const inputStyle={flex:1,minWidth:0,border:"1px solid #d0d5dd",borderRadius:10,padding:"12px 14px",fontSize:14};
const buttonStyle={border:0,borderRadius:10,padding:"12px 16px",background:"#172033",color:"white",cursor:"pointer",fontWeight:750};
const answerStyle={background:"#f6f8fb",borderRadius:14,padding:18};
const evidenceStyle={border:"1px solid #e7ebf2",borderRadius:14,padding:18};
const nextStyle={borderLeft:"3px solid #172033",padding:"8px 14px",background:"#fafafa"};
