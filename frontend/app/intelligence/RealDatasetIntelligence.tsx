"use client";

import { useEffect, useState } from "react";
import BusinessCharts from "../components/BusinessCharts";
import IntelligenceSummary from "../components/IntelligenceSummary";
import SuggestedQuestions from "../components/SuggestedQuestions";
import InsightActions from "../components/InsightActions";
import AnalystPanel from "../components/AnalystPanel";
import RecommendationPanel from "../components/RecommendationPanel";
import WhatIfSimulator from "../components/WhatIfSimulator";
import { DatasetResult, loadDataset } from "../lib/dataset-session";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function RealDatasetIntelligence() {
  const [dataset, setDataset] = useState<DatasetResult | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any>(null);
  const [drivers, setDrivers] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [status, setStatus] = useState("Loading dataset…");

  useEffect(() => {
    const active = loadDataset(); setDataset(active); if (!active) { setStatus("No dataset loaded"); return; }
    async function runAnalysis() {
      try {
        const payload = { rows: active.preview, filename: active.filename };
        const [analysisResponse, anomalyResponse, driverResponse, forecastResponse] = await Promise.all([
          fetch(`${apiUrl}/intelligence/analyze-preview`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
          fetch(`${apiUrl}/anomalies/preview`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
          fetch(`${apiUrl}/root-cause/preview`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows: active.preview, metric: "Profit" }) }),
          fetch(`${apiUrl}/forecast/preview`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows: active.preview, metric: "Revenue", periods: 3 }) }),
        ]);
        if (!analysisResponse.ok) throw new Error("Backend analysis unavailable");
        const analysisBody = await analysisResponse.json(); const anomalyBody = anomalyResponse.ok ? await anomalyResponse.json() : null; const driverBody = driverResponse.ok ? await driverResponse.json() : null; const forecastBody = forecastResponse.ok ? await forecastResponse.json() : null;
        setAnalysis(analysisBody); setAnomalies(anomalyBody); setDrivers(driverBody); setForecast(forecastBody);
        const recommendationResponse = await fetch(`${apiUrl}/recommendations/preview`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ summary: analysisBody.summary, anomalies: anomalyBody ?? {}, drivers: driverBody ?? {}, forecast: forecastBody ?? {} }) });
        if (recommendationResponse.ok) setRecommendations((await recommendationResponse.json()).recommendations ?? []); setStatus("Backend intelligence ready");
      } catch { setStatus("Using profiled preview — backend intelligence unavailable"); }
    }
    void runAnalysis();
  }, []);

  if (!dataset) return <section style={cardStyle}><h2>No dataset loaded</h2><p style={{color:"#667085"}}>Return to the dashboard and load a CSV/XLSX file or the demo dataset first.</p></section>;
  const revenue = Number(analysis?.summary?.revenue ?? 0); const profit = Number(analysis?.summary?.profit ?? 0);
  return <div style={{display:"grid",gap:14}}><section style={cardStyle}><div style={eyebrowStyle}>Active dataset</div><h2 style={{margin:"8px 0 4px"}}>{dataset.filename}</h2><p style={{margin:0,color:"#667085"}}>{dataset.profile.rows} rows · {dataset.profile.columns} columns · quality {dataset.profile.quality_score}/100</p><p style={{margin:"10px 0 0",fontSize:12,color:"#667085"}}>{status}</p></section>{analysis?.summary && <section style={cardStyle}><div style={eyebrowStyle}>Backend-calculated summary</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginTop:14}}>{[["Revenue",revenue],["Cost",analysis.summary.cost],["Profit",profit],["Quantity",analysis.summary.quantity]].filter(([,v])=>v !== undefined).map(([label,v])=><div key={String(label)} style={metricStyle}><span>{label}</span><strong>{Number(v).toLocaleString("en-IN")}</strong></div>)}</div></section>}{anomalies && <section style={cardStyle}><div style={eyebrowStyle}>Diagnostic screening</div><h2 style={{margin:"8px 0 4px"}}>{anomalies.anomaly_count} potential anomalies</h2><p style={{color:"#667085",marginTop:0}}>IQR screening across numeric preview columns. This is a review signal, not proof of an error or fraud.</p>{anomalies.findings?.slice(0,5).map((item:any,index:number)=><div key={index} style={findingStyle}><strong>{item.column}</strong><span>Row {item.row_index}</span><span>Value {Number(item.value).toLocaleString("en-IN")}</span></div>)}</section>}{drivers?.drivers?.length > 0 && <section style={cardStyle}><div style={eyebrowStyle}>Profit drivers</div><h2 style={{margin:"8px 0 4px"}}>What contributes most to profit?</h2><p style={{color:"#667085",marginTop:0}}>Descriptive contribution analysis across available dimensions.</p>{drivers.drivers.slice(0,6).map((item:any,index:number)=><div key={index} style={findingStyle}><strong>{item.label}</strong><span>{item.dimension}</span><span>₹{Number(item.value).toLocaleString("en-IN")}</span><span>{Number(item.share_pct).toFixed(1)}%</span></div>)}</section>}{forecast && <section style={cardStyle}><div style={eyebrowStyle}>Revenue outlook</div><h2 style={{margin:"8px 0 4px"}}>Baseline forecast: {forecast.trend}</h2><p style={{color:"#667085",marginTop:0}}>Three-step linear trend baseline. RMSE: ₹{Number(forecast.rmse).toLocaleString("en-IN", {maximumFractionDigits:0})}.</p><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>{forecast.forecast.map((value:number,index:number)=><div key={index} style={metricStyle}><span>Period {index+1}</span><strong>₹{Number(value).toLocaleString("en-IN", {maximumFractionDigits:0})}</strong></div>)}</div><p style={{fontSize:12,color:"#667085",marginBottom:0}}>{forecast.note}</p></section>}<RecommendationPanel recommendations={recommendations}/>{analysis && <WhatIfSimulator revenue={revenue} profit={profit}/>}<IntelligenceSummary rows={dataset.preview}/><BusinessCharts rows={dataset.preview}/>{analysis && <AnalystPanel dataset={dataset} analysis={analysis}/>}<SuggestedQuestions/><InsightActions/></div>;
}
const cardStyle={background:"white",borderRadius:20,padding:26,border:"1px solid #e7ebf2"};
const metricStyle={background:"#f6f8fb",borderRadius:12,padding:14,display:"grid",gap:5,color:"#667085",fontSize:12};
const findingStyle={display:"flex",gap:14,flexWrap:"wrap" as const,padding:"10px 0",borderTop:"1px solid #e7ebf2",fontSize:13};
const eyebrowStyle={margin:0,fontSize:11,fontWeight:800,letterSpacing:1.4,textTransform:"uppercase" as const,color:"#667085"};
