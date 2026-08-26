"use client";

import { CSSProperties, useEffect, useState } from "react";
import { DatasetResult } from "../lib/dataset-session";
import { AnalystMessage, clearAnalystMemory, loadAnalystMemory, saveAnalystMemory } from "../lib/analyst-memory";

type Props = { dataset: DatasetResult; analysis: any };

export default function GroundedAnalystPanel({ dataset, analysis }: Props) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<AnalystMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  useEffect(() => setMessages(loadAnalystMemory()), []);

  async function ask() {
    const text = question.trim();
    if (!text || !analysis || loading) return;
    setLoading(true); setError("");
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next); setQuestion(""); saveAnalystMemory(next);
    try {
      const response = await fetch(`${apiUrl}/analyst/ask-grounded`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: text, analysis, history: next.slice(-10) }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail ?? "Grounded analyst request failed");
      const answer: AnalystMessage = { role: "assistant", content: body.answer ?? "No answer returned.", tools: body.tools_used ?? (body.tool ? [body.tool] : []) };
      const updated = [...next, answer]; setMessages(updated); saveAnalystMemory(updated);
    } catch (e) { setError(e instanceof Error ? e.message : "Grounded analyst request failed"); }
    finally { setLoading(false); }
  }

  function clear() { clearAnalystMemory(); setMessages([]); setError(""); }

  return <section style={cardStyle}>
    <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center"}}><div><div style={eyebrowStyle}>AI Analyst · Grounded Mode</div><h2 style={{margin:"8px 0 6px"}}>Conversational business analyst</h2></div><button type="button" onClick={clear} style={clearStyle}>Clear chat</button></div>
    <p style={{color:"#667085",marginTop:0}}>Ask follow-up questions. The conversation stays scoped to this browser session and dataset.</p>
    <div style={threadStyle}>{messages.length === 0 && <div style={emptyStyle}>Try: “Which region has the highest revenue?” then ask “Why?”</div>}{messages.map((message,index)=><div key={index} style={message.role === "user" ? userStyle : assistantStyle}><div style={eyebrowStyle}>{message.role === "user" ? "You" : "AI Analyst"}</div><div style={{marginTop:5,lineHeight:1.5}}>{message.content}</div>{message.tools?.length ? <div style={toolText}>Tools: {message.tools.join(", ")}</div> : null}</div>)}</div>
    <div style={{display:"flex",gap:8,marginTop:14}}><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==="Enter") void ask();}} placeholder="Ask a follow-up business question…" style={inputStyle}/><button type="button" onClick={ask} disabled={loading||!analysis} style={buttonStyle}>{loading?"Thinking…":"Ask AI Analyst"}</button></div>
    {error && <p style={{color:"#b42318"}}>{error}</p>}
    <p style={{fontSize:11,color:"#98a2b3",marginBottom:0,marginTop:12}}>Dataset: {dataset.filename}</p>
  </section>;
}
const cardStyle: CSSProperties = {background:"white",borderRadius:20,padding:26,border:"1px solid #e7ebf2"};
const eyebrowStyle: CSSProperties = {margin:0,fontSize:11,fontWeight:800,letterSpacing:1.4,textTransform:"uppercase",color:"#667085"};
const inputStyle: CSSProperties = {flex:1,minWidth:0,border:"1px solid #d0d5dd",borderRadius:10,padding:"12px 14px",fontSize:14};
const buttonStyle: CSSProperties = {border:0,borderRadius:10,padding:"12px 16px",background:"#172033",color:"white",cursor:"pointer",fontWeight:750};
const clearStyle: CSSProperties = {border:"1px solid #d0d5dd",borderRadius:9,padding:"8px 11px",background:"white",cursor:"pointer",fontSize:12};
const threadStyle: CSSProperties = {display:"grid",gap:10,maxHeight:420,overflowY:"auto",padding:"8px 0"};
const userStyle: CSSProperties = {marginLeft:"12%",background:"#172033",color:"white",borderRadius:"14px 14px 4px 14px",padding:14};
const assistantStyle: CSSProperties = {marginRight:"12%",background:"#f6f8fb",borderRadius:"14px 14px 14px 4px",padding:14};
const emptyStyle: CSSProperties = {padding:20,border:"1px dashed #d0d5dd",borderRadius:12,color:"#667085"};
const toolText: CSSProperties = {fontSize:11,color:"#667085",marginTop:8};
