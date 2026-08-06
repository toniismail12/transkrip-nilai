import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-full">
        <FileQuestion className="size-8" />
      </div>
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">404</h1>
        <p className="text-muted-foreground">
          Halaman yang Anda cari tidak ditemukan atau sudah dipindahkan.
        </p>
      </div>
      <Button nativeButton={false} render={<Link href="/dashboard" />}>
        Kembali ke Dashboard
      </Button>
    </div>
  );
}
