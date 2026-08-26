import Link from "next/link";

export default function InsightActions() {
  return (
    <section style={cardStyle}>
      <div style={eyebrowStyle}>Next Analysis</div>
      <h2 style={{ margin: "8px 0 14px" }}>Move from description to diagnosis</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Link href="/analyst" style={linkStyle}>Ask AI Analyst</Link>
        <Link href="/forecast" style={secondaryStyle}>Forecast</Link>
        <Link href="/anomalies" style={secondaryStyle}>Find anomalies</Link>
        <Link href="/root-cause" style={secondaryStyle}>Investigate drivers</Link>
        <Link href="/recommendations" style={secondaryStyle}>Get recommendations</Link>
      </div>
    </section>
  );
}
const cardStyle = { background: "white", borderRadius: 20, padding: 26, border: "1px solid #e7ebf2" };
const eyebrowStyle = { margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase" as const, color: "#667085" };
const linkStyle = { background: "#172033", color: "white", textDecoration: "none", padding: "10px 14px", borderRadius: 10, fontWeight: 750, fontSize: 13 };
const secondaryStyle = { background: "#f6f8fb", color: "#344054", textDecoration: "none", padding: "10px 14px", borderRadius: 10, fontWeight: 700, fontSize: 13 };
