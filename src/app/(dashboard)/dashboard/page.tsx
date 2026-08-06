import type { Metadata } from "next";
import { Award, BookOpen, Building2, FileClock, FileText, Users } from "lucide-react";

import { getDashboardStats } from "@/services/dashboard.service";
import { StatCard } from "@/features/dashboard/stat-card";
import { TranskripChart } from "@/features/dashboard/transkrip-chart";
import { RecentActivity } from "@/features/dashboard/recent-activity";
import { QuickActions } from "@/features/dashboard/quick-actions";

export const metadata: Metadata = {
  title: "Dashboard — Cetak Transkrip",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats(new Date());

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Ringkasan data akademik dan aktivitas pencetakan transkrip.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Mahasiswa" value={stats.totalMahasiswa} icon={Users} />
        <StatCard label="Total Fakultas" value={stats.totalFakultas} icon={Building2} />
        <StatCard label="Total Program Studi" value={stats.totalProgramStudi} icon={BookOpen} />
        <StatCard label="Total Akreditasi" value={stats.totalAkreditasi} icon={Award} />
        <StatCard label="Transkrip Dicetak" value={stats.totalTranskrip} icon={FileText} />
        <StatCard label="Belum Dicetak" value={stats.mahasiswaBelumCetak} icon={FileClock} />
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TranskripChart data={stats.chart} />
        </div>
        <RecentActivity activities={stats.recentActivity} />
      </div>
    </div>
  );
}
