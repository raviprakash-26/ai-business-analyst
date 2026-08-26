"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/analyst", label: "AI Analyst", icon: "✦", badge: "AI" },
  { href: "/forecast", label: "Forecast", icon: "↗" },
  { href: "/anomalies", label: "Anomalies", icon: "!" },
  { href: "/root-cause", label: "Root Cause", icon: "⌁" },
  { href: "/recommendations", label: "Recommendations", icon: "✓" },
  { href: "/what-if", label: "What-If", icon: "≈" },
  { href: "/intelligence", label: "Dataset Intelligence", icon: "▤" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("ai-business-analyst-theme");
    const isDark = saved !== "light";
    setDark(isDark);
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.dataset.theme = nextDark ? "dark" : "light";
    localStorage.setItem("ai-business-analyst-theme", nextDark ? "dark" : "light");
  }

  return <div className="app-shell" style={shellStyle}>
    <aside className="app-sidebar" style={sidebarStyle}>
      <Link href="/dashboard" style={brandStyle}><span style={logoStyle}>AIBA</span><span className="brand-copy" style={{display:"grid",gap:2}}><strong>Business Analyst</strong><small className="muted" style={{color:"#8294ae"}}>Decision Intelligence</small></span></Link>
      <nav style={navStyle}>{navigation.map(item => { const active=pathname===item.href||pathname.startsWith(`${item.href}/`); return <Link key={item.href} href={item.href} style={{...navItemStyle,...(active?activeStyle:{})}}><span style={{width:22,textAlign:"center",fontSize:17}}>{item.icon}</span><span className="nav-label" style={{flex:1}}>{item.label}</span>{item.badge&&<span className="nav-label" style={badgeStyle}>{item.badge}</span>}</Link>; })}</nav>
      <div className="dataset-card" style={datasetCardStyle}><div className="muted" style={{color:"#8294ae",fontSize:10,textTransform:"uppercase",letterSpacing:1.1}}>Current Dataset</div><div style={{display:"flex",gap:10,alignItems:"center",marginTop:10}}><span style={fileIconStyle}>▤</span><div className="nav-label"><strong style={{display:"block",fontSize:12}}>Business dataset</strong><span className="muted" style={{color:"#8294ae",fontSize:10}}>Ready for analysis</span></div></div></div>
      <div style={specialistStyle}><div style={{color:"#c4b5fd",fontWeight:800,fontSize:11}}>AI SPECIALIST GPT</div><p style={{margin:"8px 0 12px",color:"#d6def0",fontSize:11,lineHeight:1.45}}>Ask questions, discover insights and get management actions.</p><Link href="/analyst" className="glow-button" style={specialistButton}>Open Specialist →</Link></div>
      <div className="status-box" style={statusStyle}><span style={dotStyle}/><span className="status-copy">Analytics engine online</span></div>
    </aside>
    <div className="app-content" style={contentStyle}>
      <header className="app-header" style={headerStyle}><div><strong>AI Business Analyst</strong><span className="muted" style={{marginLeft:10,color:"#7f91aa",fontSize:11}}>Decision Intelligence</span></div><div style={{display:"flex",alignItems:"center",gap:10}}><div className="search-box" style={searchStyle}>⌕ <span>Search insights, metrics, reports…</span><kbd style={kbdStyle}>Ctrl K</kbd></div><button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} title={dark ? "Light theme" : "Dark theme"}><span>{dark ? "☀" : "☾"}</span><span className="theme-label">{dark ? "Light" : "Dark"}</span></button><span className="verified" style={verifiedStyle}>● Verified analytics</span></div></header>
      <main>{children}</main>
    </div>
  </div>;
}

const shellStyle={minHeight:"100vh",background:"transparent",color:"var(--text)",display:"flex"};
const sidebarStyle={width:258,padding:"22px 16px",background:"var(--sidebar)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column" as const,gap:22,position:"fixed" as const,inset:"0 auto 0 0",zIndex:20,backdropFilter:"blur(24px)"};
const brandStyle={display:"flex",alignItems:"center",gap:11,padding:"4px 8px",color:"var(--text)"};
const logoStyle={width:40,height:40,borderRadius:12,display:"grid",placeItems:"center",background:"linear-gradient(135deg,#2563eb,#8b5cf6)",color:"white",fontWeight:900,fontSize:10,letterSpacing:"-.5px",boxShadow:"0 0 28px rgba(99,102,241,.35)"};
const navStyle={display:"grid",gap:5};
const navItemStyle={display:"flex",alignItems:"center",gap:10,padding:"11px 12px",borderRadius:12,color:"var(--muted)",fontWeight:650,fontSize:13,border:"1px solid transparent"};
const activeStyle={background:"linear-gradient(90deg,rgba(79,70,229,.85),rgba(124,58,237,.72))",color:"#fff",borderColor:"rgba(167,139,250,.35)",boxShadow:"0 8px 24px rgba(79,70,229,.2)"};
const badgeStyle={padding:"2px 6px",borderRadius:999,background:"rgba(45,212,191,.15)",color:"#5eead4",fontSize:9,fontWeight:800};
const datasetCardStyle={padding:13,borderRadius:14,background:"var(--panel)",border:"1px solid var(--border)"};
const fileIconStyle={width:32,height:32,borderRadius:9,display:"grid",placeItems:"center",background:"rgba(45,212,191,.12)",color:"#2dd4bf"};
const specialistStyle={padding:15,borderRadius:16,background:"linear-gradient(145deg,rgba(91,33,182,.35),rgba(30,64,175,.25))",border:"1px solid rgba(139,92,246,.3)"};
const specialistButton={display:"block",textAlign:"center" as const,padding:"9px 10px",borderRadius:10,color:"white",fontWeight:750,fontSize:12};
const statusStyle={marginTop:"auto",padding:"10px 12px",borderRadius:12,background:"var(--panel)",color:"var(--muted)",fontSize:10,display:"flex",gap:8,alignItems:"center",border:"1px solid var(--border)"};
const dotStyle={width:7,height:7,borderRadius:"50%",background:"#2dd4bf",boxShadow:"0 0 10px rgba(45,212,191,.7)"};
const contentStyle={marginLeft:258,width:"calc(100% - 258px)",minHeight:"100vh"};
const headerStyle={height:68,padding:"0 28px",background:"var(--header)",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:20,position:"sticky" as const,top:0,zIndex:10,backdropFilter:"blur(20px)"};
const searchStyle={minWidth:280,maxWidth:440,width:"32vw",height:38,display:"flex",alignItems:"center",gap:9,padding:"0 11px",borderRadius:11,background:"var(--search)",border:"1px solid var(--border)",color:"var(--muted)",fontSize:12};
const kbdStyle={marginLeft:"auto",padding:"3px 6px",borderRadius:6,background:"rgba(127,145,170,.12)",color:"var(--muted)",fontSize:9};
const verifiedStyle={color:"var(--muted)",fontSize:10,whiteSpace:"nowrap" as const};
