export default function SuggestedQuestions() {
  const questions=["Which region has the highest revenue?","Which product contributes most to profit?","Are there unusual values?","What is the revenue trend?","What should we investigate next?"];
  return <section style={cardStyle}><div style={eyebrowStyle}>Suggested Questions</div><h2 style={{margin:"8px 0 12px"}}>Start with a business question</h2><div style={{display:"flex",gap:8,flexWrap:"wrap" as const}}>{questions.map(q=><span key={q} style={chipStyle}>{q}</span>)}</div></section>;
}
const cardStyle={background:"white",borderRadius:20,padding:26,border:"1px solid #e7ebf2"};
const eyebrowStyle={margin:0,fontSize:11,fontWeight:800,letterSpacing:1.4,textTransform:"uppercase" as const,color:"#667085"};
const chipStyle={padding:"8px 11px",borderRadius:999,background:"#f6f8fb",border:"1px solid #e7ebf2",fontSize:12,color:"#475467"};
