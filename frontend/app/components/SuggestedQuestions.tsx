"use client";

export default function SuggestedQuestions({ onSelect }: { onSelect?: (question: string) => void }) {
  const questions = [
    "What is total revenue?",
    "Which region has the highest revenue?",
    "Which product contributes most to profit?",
    "What business drivers should management investigate?",
  ];
  return (
    <section style={cardStyle}>
      <div style={eyebrowStyle}>Ask the Analyst</div>
      <h2 style={{ margin: "8px 0 14px" }}>Start with a business question</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {questions.map((question) => <button key={question} type="button" onClick={() => onSelect?.(question)} style={chipStyle}>{question}</button>)}
      </div>
    </section>
  );
}

const cardStyle = { background: "white", borderRadius: 20, padding: 26, border: "1px solid #e7ebf2" };
const eyebrowStyle = { margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase" as const, color: "#667085" };
const chipStyle = { border: "1px solid #d0d5dd", borderRadius: 999, background: "#fff", padding: "9px 12px", cursor: "pointer", color: "#344054", fontSize: 13 };
