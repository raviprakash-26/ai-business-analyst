"use client";

import { useEffect, useState } from "react";
import BusinessCharts from "../components/BusinessCharts";
import IntelligenceSummary from "../components/IntelligenceSummary";
import SuggestedQuestions from "../components/SuggestedQuestions";
import InsightActions from "../components/InsightActions";
import AnalystPanel from "../components/AnalystPanel";
import { DatasetResult, loadDataset } from "../lib/dataset-session";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function RealDatasetIntelligence() {
  const [dataset, setDataset] = useState<DatasetResult | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [status, setStatus] = useState("Loading dataset…");

  useEffect(() => {
    const active = loadDataset();
    setDataset(active);
    if (!active) { setStatus("No dataset loaded"); return; }
    async function runAnalysis() {
      try {
        const response = await fetch(`${apiUrl}/intelligence/analyze-preview`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows: active.preview, filename: active.filename }) });
        if (!response.ok) throw new Error("Backend analysis unavailable");
        setAnalysis(await response.json());
        setStatus("Backend intelligence ready");
      } catch { setStatus("Using profiled preview — backend intelligence unavailable"); }
    }
    void runAnalysis();
  }, []);

  if (!dataset) return <section style={cardStyle}><h2>No dataset loaded</h2><p style={{color:"#667085"}}>Return to the dashboard and load a CSV/XLSX file or the demo dataset first.</p></section>;
  return <div style={{display:"grid",gap:14}}><section style={cardStyle}><div style={eyebrowStyle}>Active dataset</div><h2 style={{margin:"8px 0 4px"}}>{dataset.filename}</h2><p style={{margin:0,color:"#667085"}}>{dataset.profile.rows} rows · {dataset.profile.columns} columns · quality {dataset.profile.quality_score}/100</p><p style={{margin:"10px 0 0",fontSize:12,color:"#667085"}}>{status}</p></section>{analysis?.summary && <section style={cardStyle}><div style={eyebrowStyle}>Backend-calculated summary</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginTop:14}}>{[["Revenue",analysis.summary.revenue],["Cost",analysis.summary.cost],["Profit",analysis.summary.profit],["Quantity",analysis.summary.quantity]].filter(([,v])=>v !== undefined).map(([label,v])=><div key={String(label)} style={metricStyle}><span>{label}</span><strong>{Number(v).toLocaleString("en-IN")}</strong></div>)}</div></section>}<IntelligenceSummary rows={dataset.preview}/><BusinessCharts rows={dataset.preview}/>{analysis && <AnalystPanel dataset={dataset} analysis={analysis}/>}<SuggestedQuestions/><InsightActions/></div>;
}
const cardStyle={background:"white",borderRadius:20,padding:26,border:"1px solid #e7ebf2"};
const metricStyle={background:"#f6f8fb",borderRadius:12,padding:14,display:"grid",gap:5,color:"#667085",fontSize:12};
const eyebrowStyle={margin:0,fontSize:11,fontWeight:800,letterSpacing:1.4,textTransform:"uppercase" as const,color:"#667085"};
