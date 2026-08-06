import Link from "next/link";
import { Building2, FilePlus2, FileText, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACTIONS = [
  { title: "Tambah Mahasiswa", href: "/mahasiswa/create", icon: UserPlus },
  { title: "Cetak Transkrip", href: "/transkrip/generate", icon: FilePlus2 },
  { title: "Lihat Nilai", href: "/nilai", icon: FileText },
  { title: "Tambah Fakultas", href: "/fakultas/create", icon: Building2 },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aksi Cepat</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(buttonVariants({ variant: "outline" }), "h-auto flex-col gap-2 py-4")}
          >
            <action.icon className="size-5" />
            <span className="text-xs font-medium">{action.title}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
