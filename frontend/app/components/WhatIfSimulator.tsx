"use client";

import { useState } from "react";

export default function WhatIfSimulator({ revenue, profit }: { revenue: number; profit: number }) {
  const [revenueChange, setRevenueChange] = useState(10);
  const [costChange, setCostChange] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  async function simulate() {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/scenarios/what-if`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revenue, profit, revenue_change_pct: revenueChange, cost_change_pct: costChange }) });
      if (!response.ok) throw new Error("Scenario calculation failed");
      setResult(await response.json());
    } finally { setLoading(false); }
  }

  return <section style={cardStyle}><div style={eyebrowStyle}>Decision Simulation</div><h2 style={{margin:"8px 0 4px"}}>What if the business changes?</h2><p style={{color:"#667085",marginTop:0}}>Run a sensitivity scenario using the current revenue and profit baseline.</p><div style={gridStyle}><label>Revenue change %<input type="number" value={revenueChange} onChange={e=>setRevenueChange(Number(e.target.value))} style={inputStyle}/></label><label>Cost change %<input type="number" value={costChange} onChange={e=>setCostChange(Number(e.target.value))} style={inputStyle}/></label></div><button type="button" onClick={simulate} disabled={loading} style={buttonStyle}>{loading ? "Calculating…" : "Run Scenario"}</button>{result && <div style={{marginTop:18}}><div style={resultGrid}>{[["Projected Revenue",result.projected.revenue],["Projected Cost",result.projected.cost],["Projected Profit",result.projected.profit]].map(([label,value])=><div key={String(label)} style={metricStyle}><span>{label}</span><strong>₹{Number(value).toLocaleString("en-IN",{maximumFractionDigits:0})}</strong></div>)}</div><p style={{color:"#475467"}}>Profit impact: <strong>₹{Number(result.impact.profit_delta).toLocaleString("en-IN",{maximumFractionDigits:0})}</strong> · Margin impact: <strong>{Number(result.impact.margin_delta_pct).toFixed(2)} percentage points</strong></p><p style={{fontSize:12,color:"#667085"}}>{result.note}</p></div>}</section>;
}
const cardStyle={background:"white",borderRadius:20,padding:26,border:"1px solid #e7ebf2"};
const eyebrowStyle={margin:0,fontSize:11,fontWeight:800,letterSpacing:1.4,textTransform:"uppercase" as const,color:"#667085"};
const gridStyle={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,margin:"18px 0"};
const inputStyle={display:"block",width:"100%",boxSizing:"border-box" as const,border:"1px solid #d0d5dd",borderRadius:10,padding:"10px 12px",marginTop:6};
const buttonStyle={border:0,borderRadius:10,padding:"12px 16px",background:"#172033",color:"white",cursor:"pointer",fontWeight:750};
const resultGrid={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10};
const metricStyle={background:"#f6f8fb",borderRadius:12,padding:14,display:"grid",gap:5,color:"#667085",fontSize:12};
