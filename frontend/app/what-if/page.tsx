"use client";

import { FormEvent, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
type Scenario = { baseline: { revenue: number; expenses: number; profit: number; profit_margin_pct: number }; scenario: { revenue: number; expenses: number; profit: number; profit_margin_pct: number }; impact: { profit_change: number; margin_change_pct_points: number } };

export default function WhatIfPage() {
  const [revenue, setRevenue] = useState(100000);
  const [expenses, setExpenses] = useState(70000);
  const [revenueChange, setRevenueChange] = useState(10);
  const [expenseChange, setExpenseChange] = useState(0);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(false);

  async function simulate(event: FormEvent) {
    event.preventDefault(); setLoading(true);
    const response = await fetch(`${apiUrl}/what-if/simulate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revenue, expenses, revenue_change_pct: revenueChange, expense_change_pct: expenseChange }) });
    const body = await response.json(); setScenario(body); setLoading(false);
  }

  return (
    <main style={{ maxWidth: 1050, margin: "0 auto", padding: "56px 24px" }}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>Decision Intelligence</p>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 62px)", margin: "10px 0" }}>What-If Simulator</h1>
        <p style={{ color: "#667085", lineHeight: 1.6, fontSize: 18 }}>Test revenue and expense assumptions and compare the scenario with the current business baseline.</p>
        <form onSubmit={simulate} style={{ display: "grid", gap: 14, marginTop: 24 }}>
          <label style={labelStyle}>Current revenue<input type="number" value={revenue} onChange={(e) => setRevenue(Number(e.target.value))} style={inputStyle} /></label>
          <label style={labelStyle}>Current expenses<input type="number" value={expenses} onChange={(e) => setExpenses(Number(e.target.value))} style={inputStyle} /></label>
          <label style={labelStyle}>Revenue change %<input type="number" value={revenueChange} onChange={(e) => setRevenueChange(Number(e.target.value))} style={inputStyle} /></label>
          <label style={labelStyle}>Expense change %<input type="number" value={expenseChange} onChange={(e) => setExpenseChange(Number(e.target.value))} style={inputStyle} /></label>
          <button type="submit" disabled={loading} style={buttonStyle}>{loading ? "Simulating…" : "Run Scenario"}</button>
        </form>
      </section>
      {scenario && <section style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <MetricCard title="Baseline" data={scenario.baseline} />
        <MetricCard title="Scenario" data={scenario.scenario} />
        <article style={{ ...cardStyle, gridColumn: "1 / -1" }}><p style={{ color: "#667085" }}>Profit impact</p><h2>{scenario.impact.profit_change.toLocaleString()}</h2><p>Margin impact: {scenario.impact.margin_change_pct_points.toFixed(2)} percentage points</p></article>
      </section>}
    </main>
  );
}

function MetricCard({ title, data }: { title: string; data: Scenario["baseline"] }) {
  return <article style={cardStyle}><div style={tagStyle}>{title}</div><p>Revenue <strong>{data.revenue.toLocaleString()}</strong></p><p>Expenses <strong>{data.expenses.toLocaleString()}</strong></p><p>Profit <strong>{data.profit.toLocaleString()}</strong></p><p>Margin <strong>{data.profit_margin_pct.toFixed(2)}%</strong></p></article>;
}

const cardStyle = { background: "white", borderRadius: 22, padding: 30, border: "1px solid #e7ebf2" };
const eyebrowStyle = { margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" as const, color: "#667085" };
const labelStyle = { display: "grid", gap: 8, fontWeight: 700 };
const inputStyle = { padding: 12, borderRadius: 10, border: "1px solid #d0d5dd" };
const buttonStyle = { border: 0, borderRadius: 12, padding: "14px 18px", background: "#172033", color: "white", cursor: "pointer", fontWeight: 800 };
const tagStyle = { display: "inline-block", padding: "5px 9px", borderRadius: 999, background: "#eef2f7", color: "#475467", fontSize: 11, fontWeight: 800, textTransform: "uppercase" as const };
