"use client";

export default function DemoDatasetButton({ onLoaded }: { onLoaded: (file: File) => void }) {
  async function loadDemo() {
    const response = await fetch("/demo/demo_retail_business.csv");
    const blob = await response.blob();
    onLoaded(new File([blob], "demo_retail_business.csv", { type: "text/csv" }));
  }

  return (
    <button type="button" onClick={loadDemo} style={buttonStyle}>
      Load Demo Dataset
    </button>
  );
}

const buttonStyle = {
  border: "1px solid #d0d5dd",
  borderRadius: 10,
  padding: "11px 14px",
  background: "white",
  color: "#172033",
  cursor: "pointer",
  fontWeight: 750,
};
