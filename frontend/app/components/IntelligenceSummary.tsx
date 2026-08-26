"use client";

import { useMemo } from "react";

type Row = Record<string, unknown>;

function value(row: Row, key: string) {
  const n = Number(String(row[key] ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function money(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export default function IntelligenceSummary({ rows }: { rows: Row[] }) {
  const result = useMemo(() => {
    if (!rows.length) return null;
    const revenue = rows.reduce((s, r) => s + value(r, "Revenue"), 0);
    const profit = rows.reduce((s, r) => s + value(r, "Profit"), 0);
    const regionRevenue = new Map<string, number>();
    const productProfit = new Map<string, number>();
    rows.forEach((r) => {
      const region = String(r.Region ?? "Unknown");
      const product = String(r.Product ?? "Unknown");
      regionRevenue.set(region, (regionRevenue.get(region) ?? 0) + value(r, "Revenue"));
      productProfit.set(product, (productProfit.get(product) ?? 0) + value(r, "Profit"));
    });
    const topRegion = [...regionRevenue.entries()].sort((a, b) => b[1] - a[1])[0];
    const topProduct = [...productProfit.entries()].sort((a, b) => b[1] - a[1])[0];
    const margin = revenue ? (profit / revenue) * 100 : 0;
    return { revenue, profit, margin, topRegion, topProduct };
  }, [rows]);

  if (!result) return null;
  return (
    <section style={cardStyle}>
      <div style={eyebrowStyle}>Business Intelligence</div>
      <h2 style={{ margin: "8px 0" }}>What stands out?</h2>
      <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
        <p style={insightStyle}><strong>Revenue:</strong> {money(result.revenue)} across the loaded preview.</p>
        <p style={insightStyle}><strong>Profit:</strong> {money(result.profit)} with a {result.margin.toFixed(1)}% calculated margin.</p>
        {result.topRegion && <p style={insightStyle}><strong>Leading region:</strong> {result.topRegion[0]} contributes {money(result.topRegion[1])} of revenue.</p>}
        {result.topProduct && <p style={insightStyle}><strong>Leading profit product:</strong> {result.topProduct[0]} contributes {money(result.topProduct[1])} of profit.</p>}
      </div>
      <p style={{ color: "#667085", fontSize: 12, marginBottom: 0 }}>These are descriptive findings from the loaded preview. They are not causal claims or forecasts.</p>
    </section>
  );
}

const cardStyle = { background: "white", borderRadius: 20, padding: 26, border: "1px solid #e7ebf2" };
const eyebrowStyle = { margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase" as const, color: "#667085" };
const insightStyle = { margin: 0, lineHeight: 1.6, color: "#344054" };
