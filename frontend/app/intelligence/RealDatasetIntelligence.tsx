"use client";

import { useEffect, useState } from "react";
import BusinessCharts from "../components/BusinessCharts";
import IntelligenceSummary from "../components/IntelligenceSummary";
import SuggestedQuestions from "../components/SuggestedQuestions";
import InsightActions from "../components/InsightActions";
import { DatasetResult, loadDataset } from "../lib/dataset-session";

export default function RealDatasetIntelligence() {
  const [dataset, setDataset] = useState<DatasetResult | null>(null);
  useEffect(() => setDataset(loadDataset()), []);

  if (!dataset) return <section style={cardStyle}><h2>No dataset loaded</h2><p style={{color:"#667085"}}>Return to the dashboard and load a CSV/XLSX file or the demo dataset first.</p></section>;

  return <div style={{display:"grid",gap:14}}><section style={cardStyle}><div style={eyebrowStyle}>Active dataset</div><h2 style={{margin:"8px 0 4px"}}>{dataset.filename}</h2><p style={{margin:0,color:"#667085"}}>{dataset.profile.rows} rows · {dataset.profile.columns} columns · quality {dataset.profile.quality_score}/100</p></section><IntelligenceSummary rows={dataset.preview}/><BusinessCharts rows={dataset.preview}/><SuggestedQuestions/><InsightActions/></div>;
}
const cardStyle={background:"white",borderRadius:20,padding:26,border:"1px solid #e7ebf2"};
const eyebrowStyle={margin:0,fontSize:11,fontWeight:800,letterSpacing:1.4,textTransform:"uppercase" as const,color:"#667085"};
