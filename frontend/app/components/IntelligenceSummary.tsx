"use client";

export default function IntelligenceSummary({ rows }: { rows: Record<string, unknown>[] }) {
  const numeric = rows.reduce((sum, row) => sum + Number(String(row.Revenue ?? 0).replace(/,/g, "")), 0);
  const profit = rows.reduce((sum, row) => sum + Number(String(row.Profit ?? 0).replace(/,/g, "")), 0);
  const quantity = rows.reduce((sum, row) => sum + Number(String(row.Quantity ?? 0).replace(/,/g, "")), 0);
  return <section style={cardStyle}><div style={eyebrowStyle}>Preview Intelligence</div><h2 style={{margin:"8px 0 4px"}}>Loaded-data snapshot</h2><p style={{color:"#667085",marginTop:0}}>Quick metrics from the active preview while the backend completes its analysis.</p><div style={gridStyle}>{[["Preview Revenue",numeric],["Preview Profit",profit],["Preview Quantity",quantity],["Preview Rows",rows.length]].map(([label,value])=><div key={String(label)} style={metricStyle}><span>{label}</span><strong>{Number(value).toLocaleString("en-IN")}</strong></div>)}</div></section>;
}
const cardStyle={background:"white",borderRadius:20,padding:26,border:"1px solid #e7ebf2"};
const eyebrowStyle={margin:0,fontSize:11,fontWeight:800,letterSpacing:1.4,textTransform:"uppercase" as const,color:"#667085"};
const gridStyle={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginTop:14};
const metricStyle={background:"#f6f8fb",borderRadius:12,padding:14,display:"grid",gap:5,color:"#667085",fontSize:12};
