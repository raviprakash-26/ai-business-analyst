export type DatasetResult = {
  filename: string;
  profile: {
    rows: number;
    columns: number;
    column_names: string[];
    missing_cells: number;
    duplicate_rows: number;
    quality_score: number;
  };
  preview: Record<string, unknown>[];
};

const STORAGE_KEY = "ai-business-analyst:dataset";

export function saveDataset(dataset: DatasetResult) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
}

export function loadDataset(): DatasetResult | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as DatasetResult; } catch { return null; }
}

export function clearDataset() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}
