import { getPredikatThresholds } from "@/services/setting.service";

export async function computePredikat(ipk: number): Promise<string> {
  const thresholds = await getPredikatThresholds();
  const sorted = [...thresholds].sort((a, b) => b.minIpk - a.minIpk);

  const match = sorted.find((threshold) => ipk >= threshold.minIpk && ipk <= threshold.maxIpk);
  if (match) return match.label;

  const highest = sorted[0];
  if (highest && ipk > highest.maxIpk) return highest.label;

  const lowest = sorted[sorted.length - 1];
  return lowest?.label ?? "-";
}
