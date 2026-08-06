const JENJANG_LABEL: Record<string, string> = {
  D3: "Diploma III (D3)",
  D4: "Diploma IV (D4)",
  S1: "Sarjana (S1)",
  S2: "Magister (S2)",
  S3: "Doktor (S3)",
  PROFESI: "Profesi",
};

export function formatProgramPendidikan(jenjang: string) {
  return JENJANG_LABEL[jenjang] ?? jenjang;
}

export function formatDateIndonesian(date: Date | null | undefined) {
  if (!date) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Builds the transcript signature line ("Dekan Fakultas Teknik").
 * Faculty names in this system already carry the "Fakultas" prefix, so prepending
 * the word again would render "Dekan Fakultas Fakultas Teknik".
 */
export function formatDekanTitle(fakultasNama: string) {
  const trimmed = fakultasNama.trim();
  return /^fakultas\b/i.test(trimmed) ? `Dekan ${trimmed}` : `Dekan Fakultas ${trimmed}`;
}
