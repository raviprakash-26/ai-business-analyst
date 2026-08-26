export default function RecommendationPanel({ recommendations }: { recommendations: any[] }) {
  if (!recommendations.length) return null;
  return <section style={cardStyle}><div style={eyebrowStyle}>Decision Support</div><h2 style={{margin:"8px 0 14px"}}>Recommended actions</h2>{recommendations.map((item,index)=><article key={index} style={itemStyle}><div style={{display:"flex",justifyContent:"space-between",gap:12}}><strong>{item.finding}</strong><span style={badgeStyle}>{item.priority}</span></div><p style={{margin:"8px 0 0",color:"#475467",lineHeight:1.5}}>{item.action}</p></article>)}</section>;
}
const cardStyle={background:"white",borderRadius:20,padding:26,border:"1px solid #e7ebf2"};
const itemStyle={padding:"14px 0",borderTop:"1px solid #e7ebf2"};
const badgeStyle={fontSize:11,fontWeight:800,padding:"5px 8px",borderRadius:999,background:"#f2f4f7",color:"#344054",whiteSpace:"nowrap" as const};
const eyebrowStyle={margin:0,fontSize:11,fontWeight:800,letterSpacing:1.4,textTransform:"uppercase" as const,color:"#667085"};
