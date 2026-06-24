export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  // Auto-detect separator — tab or comma
  const firstLine = lines[0];
  const separator = firstLine.includes("\t") ? "\t" : ",";

  const headers = firstLine
    .split(separator)
    .map((h) => h.trim().toLowerCase().replace(/\s+/g, ""));

  return lines.slice(1).map((line) => {
    const values = line.split(separator).map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = values[i] ?? "";
    });
    return row;
  });
}