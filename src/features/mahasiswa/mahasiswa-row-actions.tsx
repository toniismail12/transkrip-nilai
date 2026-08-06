"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteDialog } from "@/components/feedback/confirm-delete-dialog";
import type { Mahasiswa } from "@/generated/prisma/client";
import type { ApiEnvelope } from "@/lib/api/response";

interface MahasiswaRowActionsProps {
  mahasiswa: Mahasiswa;
}

export function MahasiswaRowActions({ mahasiswa }: MahasiswaRowActionsProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleDelete() {
    const res = await fetch(`/api/mahasiswa/${mahasiswa.id}`, { method: "DELETE" });
    const json: ApiEnvelope<unknown> = await res.json();

    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal menghapus mahasiswa");
      throw new Error(json.message);
    }

    toast.success("Mahasiswa berhasil dihapus");
    router.refresh();
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/mahasiswa/${mahasiswa.id}`} />}>
            <Eye />
            Detail
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={`/mahasiswa/${mahasiswa.id}/edit`} />}>
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
        title="Hapus mahasiswa ini?"
        description={`Data mahasiswa "${mahasiswa.nama}" (${mahasiswa.npm}) akan dihapus secara permanen dari daftar aktif.`}
        onConfirm={handleDelete}
      />
    </>
  );
}
