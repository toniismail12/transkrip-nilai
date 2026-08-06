// Wording follows the printed transcript form, which spells the level out
// ("Strata 1") rather than using the academic-degree name ("Sarjana (S1)").
const JENJANG_LABEL: Record<string, string> = {
  D3: "Diploma 3",
  D4: "Diploma 4",
  S1: "Strata 1",
  S2: "Strata 2",
  S3: "Strata 3",
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

/**
 * Value for the transcript's "Fakultas" biodata row. The row is already labelled
 * "Fakultas", so the stored name's own prefix would read "Fakultas : Fakultas Teknik".
 */
export function formatFakultasValue(fakultasNama: string) {
  return fakultasNama.trim().replace(/^fakultas\s+/i, "");
}

/** Indonesian decimal notation — the printed transcript writes the GPA as "3,88". */
export function formatDecimalIndonesian(value: number, fractionDigits: number) {
  return value.toFixed(fractionDigits).replace(".", ",");
}
