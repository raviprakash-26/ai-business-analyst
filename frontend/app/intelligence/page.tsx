"use client";

import IntelligenceSummary from "../components/IntelligenceSummary";
import SuggestedQuestions from "../components/SuggestedQuestions";
import InsightActions from "../components/InsightActions";
import Link from "next/link";

const demoRows = [
  { Region: "South", Product: "Laptop", Revenue: 140000, Profit: 28000 },
  { Region: "South", Product: "Office Chair", Revenue: 50000, Profit: 15000 },
  { Region: "West", Product: "Monitor", Revenue: 72000, Profit: 18000 },
  { Region: "North", Product: "Desk", Revenue: 45000, Profit: 15000 },
  { Region: "East", Product: "Printer", Revenue: 36000, Profit: 9000 },
];

export default function IntelligencePage() {
  return <main style={{ maxWidth: 1050, margin: "0 auto", padding: "48px 24px" }}>
    <Link href="/dashboard" style={{ color: "#667085", textDecoration: "none", fontSize: 13 }}>← Executive Dashboard</Link>
    <section style={{ margin: "18px 0 16px" }}><p style={eyebrowStyle}>Business Intelligence</p><h1 style={{ fontSize: 48, margin: "8px 0" }}>From data to business understanding.</h1><p style={{ color: "#667085", fontSize: 17, maxWidth: 720, lineHeight: 1.6 }}>Start with descriptive findings, then move into diagnostic, predictive and decision-support workflows.</p></section>
    <div style={{ display: "grid", gap: 14 }}><IntelligenceSummary rows={demoRows} /><SuggestedQuestions /><InsightActions /></div>
  </main>;
}
const eyebrowStyle = { margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase" as const, color: "#667085" };
