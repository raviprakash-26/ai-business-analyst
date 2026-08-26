"use client";

import { useState } from "react";

const modes = [
  ["Describe", "What happened?"],
  ["Diagnose", "Why did it happen?"],
  ["Predict", "What may happen next?"],
  ["Decide", "What should we do?"],
];

export default function AnalysisMode() {
  const [active, setActive] = useState("Describe");
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8 }}>{modes.map(([name, question]) => <button key={name} onClick={() => setActive(name)} type="button" style={{ ...buttonStyle, ...(active === name ? activeStyle : {}) }}><strong>{name}</strong><span>{question}</span></button>)}</div>;
}
const buttonStyle={border:"1px solid #e4e7ec",background:"white",borderRadius:12,padding:"12px",display:"grid",gap:4,textAlign:"left" as const,cursor:"pointer",color:"#344054"};
const activeStyle={background:"#172033",color:"white",borderColor:"#172033"};
