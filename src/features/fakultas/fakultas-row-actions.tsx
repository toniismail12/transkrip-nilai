"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteDialog } from "@/components/feedback/confirm-delete-dialog";
import type { Fakultas } from "@/generated/prisma/client";
import type { ApiEnvelope } from "@/lib/api/response";

interface FakultasRowActionsProps {
  fakultas: Fakultas;
}

export function FakultasRowActions({ fakultas }: FakultasRowActionsProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleDelete() {
    const res = await fetch(`/api/fakultas/${fakultas.id}`, { method: "DELETE" });
    const json: ApiEnvelope<unknown> = await res.json();

    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal menghapus fakultas");
      throw new Error(json.message);
    }

    toast.success("Fakultas berhasil dihapus");
    router.refresh();
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/fakultas/${fakultas.id}/edit`} />}>
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
        title="Hapus fakultas ini?"
        description={`Fakultas "${fakultas.nama}" akan dihapus secara permanen dari daftar aktif.`}
        onConfirm={handleDelete}
      />
    </>
  );
}
