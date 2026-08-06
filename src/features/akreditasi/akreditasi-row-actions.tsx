"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteDialog } from "@/components/feedback/confirm-delete-dialog";
import type { Akreditasi } from "@/generated/prisma/client";
import type { ApiEnvelope } from "@/lib/api/response";

interface AkreditasiRowActionsProps {
  akreditasi: Akreditasi;
}

export function AkreditasiRowActions({ akreditasi }: AkreditasiRowActionsProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleActivate() {
    setMenuOpen(false);
    const res = await fetch(`/api/akreditasi/${akreditasi.id}/activate`, { method: "POST" });
    const json: ApiEnvelope<unknown> = await res.json();

    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal mengaktifkan akreditasi");
      return;
    }

    toast.success(json.message || "Akreditasi berhasil diaktifkan");
    router.refresh();
  }

  async function handleDelete() {
    const res = await fetch(`/api/akreditasi/${akreditasi.id}`, { method: "DELETE" });
    const json: ApiEnvelope<unknown> = await res.json();

    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal menghapus akreditasi");
      throw new Error(json.message);
    }

    toast.success("Akreditasi berhasil dihapus");
    router.refresh();
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!akreditasi.isActive ? (
            <DropdownMenuItem onClick={handleActivate}>
              <CheckCircle2 />
              Jadikan Aktif
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem render={<Link href={`/akreditasi/${akreditasi.id}/edit`} />}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              setMenuOpen(false);
              setDialogOpen(true);
            }}
          >
            <Trash2 />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Hapus akreditasi ini?"
        description={`Akreditasi "${akreditasi.nama}" akan dihapus secara permanen dari daftar aktif.`}
        onConfirm={handleDelete}
      />
    </>
  );
}
