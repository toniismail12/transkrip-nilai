import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Building2,
  BookOpen,
  ShieldCheck,
  Settings,
  UserCog,
} from "lucide-react";
import type { Role } from "@/types/auth";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Utama",
    items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Akademik",
    items: [
      { title: "Mahasiswa", href: "/mahasiswa", icon: Users },
      { title: "Nilai", href: "/nilai", icon: GraduationCap },
      { title: "Transkrip", href: "/transkrip", icon: FileText },
    ],
  },
  {
    title: "Data Master",
    items: [
      { title: "Fakultas", href: "/fakultas", icon: Building2 },
      { title: "Program Studi", href: "/program-studi", icon: BookOpen },
      { title: "Akreditasi", href: "/akreditasi", icon: ShieldCheck },
    ],
  },
  {
    title: "Pengaturan",
    items: [
      { title: "Setting", href: "/setting", icon: Settings, roles: ["ADMIN"] },
      { title: "Manajemen User", href: "/user", icon: UserCog, roles: ["ADMIN"] },
    ],
  },
];

const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  mahasiswa: "Mahasiswa",
  nilai: "Nilai",
  transkrip: "Transkrip",
  fakultas: "Fakultas",
  "program-studi": "Program Studi",
  akreditasi: "Akreditasi",
  setting: "Setting",
  user: "Manajemen User",
  profile: "Profil Admin",
  create: "Tambah",
  edit: "Edit",
  generate: "Cetak Baru",
  preview: "Preview",
};

export function getBreadcrumbLabel(segment: string): string {
  return BREADCRUMB_LABELS[segment] ?? segment;
}
