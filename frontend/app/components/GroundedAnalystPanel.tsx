"use client";

import { useState } from "react";
import { DatasetResult } from "../lib/dataset-session";

type Props = { dataset: DatasetResult; analysis: any };

export default function GroundedAnalystPanel({ dataset, analysis }: Props) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  async function ask() {
    if (!question.trim() || !analysis) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(`${apiUrl}/analyst/ask-grounded`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, analysis }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail ?? "Grounded analyst request failed");
      setResult(body);
    } catch (e) { setError(e instanceof Error ? e.message : "Grounded analyst request failed"); }
    finally { setLoading(false); }
  }

  return <section style={cardStyle}>
    <div style={eyebrowStyle}>AI Analyst · Grounded Mode</div>
    <h2 style={{margin:"8px 0 6px"}}>Ask the AI — with verified evidence</h2>
    <p style={{color:"#667085",marginTop:0}}>The model explains analytical results; it does not replace the calculation engine.</p>
    <div style={{display:"flex",gap:8,marginTop:18}}><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==="Enter") void ask();}} placeholder="Why is profit concentrated in one product?" style={inputStyle}/><button type="button" onClick={ask} disabled={loading||!analysis} style={buttonStyle}>{loading?"Thinking…":"Ask AI Analyst"}</button></div>
    {error && <p style={{color:"#b42318"}}>{error}</p>}
    {result && <div style={{display:"grid",gap:12,marginTop:20}}><div style={answerStyle}><div style={eyebrowStyle}>AI interpretation</div><p style={{fontSize:17,lineHeight:1.55,marginBottom:0}}>{result.answer}</p></div><div style={evidenceStyle}><strong>Verified analytical evidence</strong><pre style={{whiteSpace:"pre-wrap",fontSize:12,marginBottom:0}}>{JSON.stringify(result.verified_result ?? result.evidence, null, 2)}</pre></div>{result.tool && <div style={toolStyle}><strong>Analytics tool</strong><span>{result.tool}</span></div>}</div>}
    <p style={{fontSize:11,color:"#98a2b3",marginBottom:0,marginTop:16}}>Dataset: {dataset.filename}</p>
  </section>;
}
const cardStyle={background:"white",borderRadius:20,padding:26,border:"1px solid #e7ebf2"};
const eyebrowStyle={margin:0,fontSize:11,fontWeight:800,letterSpacing:1.4,textTransform:"uppercase" as const,color:"#667085"};
const inputStyle={flex:1,minWidth:0,border:"1px solid #d0d5dd",borderRadius:10,padding:"12px 14px",fontSize:14};
const buttonStyle={border:0,borderRadius:10,padding:"12px 16px",background:"#172033",color:"white",cursor:"pointer",fontWeight:750};
const answerStyle={background:"#f6f8fb",borderRadius:14,padding:18};
const evidenceStyle={border:"1px solid #e7ebf2",borderRadius:14,padding:18};
const toolStyle={display:"flex",justifyContent:"space-between",padding:"12px 14px",background:"#fafafa",borderRadius:10,fontSize:13};
