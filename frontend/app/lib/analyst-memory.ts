export type AnalystMessage = {
  role: "user" | "assistant";
  content: string;
  tools?: string[];
};

const key = "ai-business-analyst:conversation";

export function loadAnalystMemory(): AnalystMessage[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(sessionStorage.getItem(key) ?? "[]"); } catch { return []; }
}

export function saveAnalystMemory(messages: AnalystMessage[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, JSON.stringify(messages.slice(-20)));
}

export function clearAnalystMemory() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(key);
}
