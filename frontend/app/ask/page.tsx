"use client";

import { FormEvent, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function AskPage() {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<{ tool?: string; answer?: string; result?: unknown } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ask(event: FormEvent) {
    event.preventDefault();
    if (!file || !question.trim()) {
      setError("Upload a dataset and enter a business question.");
      return;
    }
    setLoading(true);
    setError("");
    setAnswer(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("question", question);
      const response = await fetch(`${apiUrl}/ai/analyze`, { method: "POST", body: form });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail ?? "Unable to answer the question.");
      setAnswer(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to answer the question.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px" }}>
      <section style={cardStyle}>
        <p style={eyebrowStyle}>AI Business Analyst</p>
        <h1 style={{ fontSize: "clamp(38px, 6vw, 64px)", margin: "10px 0" }}>Ask Your Data</h1>
        <p style={{ color: "#667085", lineHeight: 1.6, fontSize: 18 }}>
          Ask a business question and receive an answer from verified analytics tools.
        </p>

        <form onSubmit={ask} style={{ display: "grid", gap: 14, marginTop: 28 }}>
          <label style={labelStyle}>Dataset
            <input type="file" accept=".csv,.xlsx" onChange={(event) => setFile(event.target.files?.[0] ?? null)} style={inputStyle} />
          </label>
          <label style={labelStyle}>Business question
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Which region generated the highest revenue?" rows={4} style={{ ...inputStyle, resize: "vertical" }} />
          </label>
          <button type="submit" disabled={loading} style={buttonStyle}>{loading ? "Analyzing…" : "Ask Analyst"}</button>
        </form>
        {error && <p style={{ color: "#b42318" }}>{error}</p>}
      </section>

      {answer && (
        <section style={{ ...cardStyle, marginTop: 18 }}>
          <div style={tagStyle}>Tool: {answer.tool}</div>
          <h2 style={{ margin: "12px 0" }}>Analyst Answer</h2>
          <p style={{ fontSize: 20, lineHeight: 1.6 }}>{answer.answer}</p>
          {answer.result !== undefined && <pre style={resultStyle}>{JSON.stringify(answer.result, null, 2)}</pre>}
        </section>
      )}
    </main>
  );
}

const cardStyle = { background: "white", borderRadius: 24, padding: 32, border: "1px solid #e7ebf2" };
const eyebrowStyle = { margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" as const, color: "#667085" };
const labelStyle = { display: "grid", gap: 8, fontWeight: 700 };
const inputStyle = { width: "100%", padding: 13, borderRadius: 12, border: "1px solid #d0d5dd", background: "white" };
const buttonStyle = { border: 0, borderRadius: 12, padding: "14px 18px", background: "#172033", color: "white", cursor: "pointer", fontWeight: 800 };
const tagStyle = { display: "inline-block", padding: "5px 9px", borderRadius: 999, background: "#eef2f7", color: "#475467", fontSize: 11, fontWeight: 800 };
const resultStyle = { padding: 16, borderRadius: 12, background: "#f6f8fb", overflowX: "auto" as const };
