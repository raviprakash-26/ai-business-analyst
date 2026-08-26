"use client";

import { useMemo } from "react";

type Row = Record<string, unknown>;

function num(row: Row, key: string) {
  const value = Number(String(row[key] ?? "").replace(/,/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export default function BusinessCharts({ rows }: { rows: Row[] }) {
  const analysis = useMemo(() => {
    const byRegion = new Map<string, number>();
    const byCategory = new Map<string, number>();
    const byProduct = new Map<string, number>();
    const byDate = new Map<string, number>();

    rows.forEach((row) => {
      const revenue = num(row, "Revenue");
      const region = String(row.Region ?? "Unknown");
      const category = String(row.Category ?? "Unknown");
      const product = String(row.Product ?? "Unknown");
      const date = String(row.Date ?? "Unknown").slice(0, 7);
      byRegion.set(region, (byRegion.get(region) ?? 0) + revenue);
      byCategory.set(category, (byCategory.get(category) ?? 0) + revenue);
      byProduct.set(product, (byProduct.get(product) ?? 0) + num(row, "Profit"));
      byDate.set(date, (byDate.get(date) ?? 0) + revenue);
    });

    return {
      regions: [...byRegion.entries()].sort((a, b) => b[1] - a[1]),
      categories: [...byCategory.entries()].sort((a, b) => b[1] - a[1]),
      products: [...byProduct.entries()].sort((a, b) => b[1] - a[1]),
      months: [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    };
  }, [rows]);

  return (
    <section style={{ display: "grid", gap: 14, marginTop: 14 }}>
      <ChartCard title="Revenue Trend" subtitle="Monthly revenue from the loaded preview">
        <div style={barListStyle}>
          {analysis.months.map(([month, value]) => <Bar key={month} label={month} value={value} max={Math.max(...analysis.months.map(([, v]) => v), 1)} />)}
        </div>
      </ChartCard>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
        <ChartCard title="Revenue by Region" subtitle="Where revenue is concentrated">
          {analysis.regions.map(([label, value]) => <Bar key={label} label={label} value={value} max={Math.max(...analysis.regions.map(([, v]) => v), 1)} />)}
        </ChartCard>
        <ChartCard title="Revenue by Category" subtitle="Category contribution">
          {analysis.categories.map(([label, value]) => <Bar key={label} label={label} value={value} max={Math.max(...analysis.categories.map(([, v]) => v), 1)} />)}
        </ChartCard>
      </div>
      <ChartCard title="Profit by Product" subtitle="Highest profit contribution">
        {analysis.products.slice(0, 6).map(([label, value]) => <Bar key={label} label={label} value={value} max={Math.max(...analysis.products.map(([, v]) => v), 1)} />)}
      </ChartCard>
    </section>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <article style={cardStyle}><h2 style={{ margin: 0 }}>{title}</h2><p style={{ color: "#667085", margin: "6px 0 22px" }}>{subtitle}</p>{children}</article>;
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 100px", alignItems: "center", gap: 10, marginBottom: 12 }}><span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span><div style={{ height: 9, background: "#edf1f5", borderRadius: 99, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.max((value / max) * 100, 2)}%`, background: "#172033", borderRadius: 99 }} /></div><strong style={{ fontSize: 12, textAlign: "right" }}>{money(value)}</strong></div>;
}

const cardStyle = { background: "white", borderRadius: 20, padding: 26, border: "1px solid #e7ebf2" };
const barListStyle = { display: "grid", gap: 2 };
