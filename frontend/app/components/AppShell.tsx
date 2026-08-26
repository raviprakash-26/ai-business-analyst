"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/analyst", label: "AI Analyst", icon: "✦" },
  { href: "/forecast", label: "Forecast", icon: "↗" },
  { href: "/anomalies", label: "Anomalies", icon: "!" },
  { href: "/root-cause", label: "Root Cause", icon: "⌁" },
  { href: "/recommendations", label: "Recommendations", icon: "✓" },
  { href: "/what-if", label: "What-If", icon: "≈" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={shellStyle}>
      <aside style={sidebarStyle}>
        <Link href="/analyst" style={brandStyle}>
          <span style={logoStyle}>AI</span>
          <span><strong>Business Analyst</strong><small>Decision Intelligence</small></span>
        </Link>
        <nav style={navStyle}>
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return <Link key={item.href} href={item.href} style={{ ...navItemStyle, ...(active ? activeStyle : {}) }}><span>{item.icon}</span>{item.label}</Link>;
          })}
        </nav>
        <div style={statusStyle}><span style={dotStyle} />Analytics engine online</div>
      </aside>
      <div style={contentStyle}>
        <header style={headerStyle}><span>AI Business Analyst</span><span style={{ color: "#667085", fontSize: 13 }}>Verified analytics · Decision support</span></header>
        <main>{children}</main>
      </div>
    </div>
  );
}

const shellStyle = { minHeight: "100vh", background: "#f6f8fb", color: "#172033", display: "flex" };
const sidebarStyle = { width: 250, padding: "24px 16px", background: "#fff", borderRight: "1px solid #e7ebf2", display: "flex", flexDirection: "column" as const, gap: 28, position: "fixed" as const, inset: "0 auto 0 0" };
const brandStyle = { display: "flex", alignItems: "center", gap: 11, textDecoration: "none", color: "#172033", padding: "4px 8px" };
const logoStyle = { width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", background: "#172033", color: "#fff", fontWeight: 900, fontSize: 12 };
const navStyle = { display: "grid", gap: 5 };
const navItemStyle = { display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, textDecoration: "none", color: "#475467", fontWeight: 650, fontSize: 14 };
const activeStyle = { background: "#eef2f7", color: "#172033" };
const statusStyle = { marginTop: "auto", padding: 12, borderRadius: 12, background: "#f6f8fb", color: "#667085", fontSize: 11, display: "flex", gap: 8, alignItems: "center" };
const dotStyle = { width: 7, height: 7, borderRadius: "50%", background: "#12b76a" };
const contentStyle = { marginLeft: 250, width: "calc(100% - 250px)" };
const headerStyle = { height: 64, padding: "0 28px", background: "rgba(255,255,255,.9)", borderBottom: "1px solid #e7ebf2", display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 800 };
