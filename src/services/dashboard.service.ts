import { dashboardRepository } from "@/repositories/dashboard.repository";
import { listRecentActivity } from "@/services/activity-log.service";

export interface DashboardChartPoint {
  month: string;
  label: string;
  total: number;
}

export interface DashboardActivity {
  id: number;
  title: string;
  description: string;
  timestamp: Date;
}

export interface DashboardStats {
  totalMahasiswa: number;
  totalFakultas: number;
  totalProgramStudi: number;
  totalAkreditasi: number;
  totalTranskrip: number;
  mahasiswaSudahCetak: number;
  mahasiswaBelumCetak: number;
  chart: DashboardChartPoint[];
  recentActivity: DashboardActivity[];
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function buildLastMonths(count: number, reference: Date) {
  return Array.from({ length: count }, (_, index) => {
    const offset = count - 1 - index;
    const date = new Date(reference.getFullYear(), reference.getMonth() - offset, 1);
    return { key: monthKey(date), label: `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}` };
  });
}

export async function getDashboardStats(referenceDate: Date): Promise<DashboardStats> {
  const sixMonthsAgo = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 5, 1);

  const [
    totalMahasiswa,
    totalFakultas,
    totalProgramStudi,
    totalAkreditasi,
    totalTranskrip,
    statusGroups,
    recentLogs,
    transkripForChart,
  ] = await Promise.all([
    dashboardRepository.countMahasiswa(),
    dashboardRepository.countFakultas(),
    dashboardRepository.countProgramStudi(),
    dashboardRepository.countAkreditasi(),
    dashboardRepository.countTranskrip(),
    dashboardRepository.countMahasiswaByStatusCetak(),
    listRecentActivity(6),
    dashboardRepository.findTranskripSince(sixMonthsAgo),
  ]);

  const mahasiswaSudahCetak =
    statusGroups.find((group) => group.statusCetak === "SUDAH_CETAK")?._count._all ?? 0;
  const mahasiswaBelumCetak =
    statusGroups.find((group) => group.statusCetak === "BELUM_CETAK")?._count._all ?? 0;

  const months = buildLastMonths(6, referenceDate);
  const chart = months.map(({ key, label }) => ({
    month: key,
    label,
    total: transkripForChart.filter((t) => monthKey(t.tanggalCetak) === key).length,
  }));

  const recentActivity = recentLogs.map((log) => ({
    id: log.id,
    title: log.description,
    description: log.userNama ? `oleh ${log.userNama}` : "oleh sistem",
    timestamp: log.createdAt,
  }));

  return {
    totalMahasiswa,
    totalFakultas,
    totalProgramStudi,
    totalAkreditasi,
    totalTranskrip,
    mahasiswaSudahCetak,
    mahasiswaBelumCetak,
    chart,
    recentActivity,
  };
}
