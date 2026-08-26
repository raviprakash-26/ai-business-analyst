export default function InsightActions() {
  return <section style={cardStyle}><div style={eyebrowStyle}>Analyst Workflow</div><h2 style={{margin:"8px 0 6px"}}>Validate before acting</h2><p style={{color:"#667085",margin:0,lineHeight:1.55}}>Use the evidence, validate important findings against source records, then prioritize the highest-impact action.</p></section>;
}
const cardStyle={background:"white",borderRadius:20,padding:26,border:"1px solid #e7ebf2"};
const eyebrowStyle={margin:0,fontSize:11,fontWeight:800,letterSpacing:1.4,textTransform:"uppercase" as const,color:"#667085"};
