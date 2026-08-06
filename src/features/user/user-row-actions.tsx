"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, MoreHorizontal, Pencil, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteDialog } from "@/components/feedback/confirm-delete-dialog";
import type { SafeUser } from "@/services/user.service";
import type { ApiEnvelope } from "@/lib/api/response";

interface UserRowActionsProps {
  user: SafeUser;
  isCurrentUser: boolean;
}

export function UserRowActions({ user, isCurrentUser }: UserRowActionsProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleToggleActive() {
    setMenuOpen(false);
    const res = await fetch(`/api/user/${user.id}/toggle-active`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    const json: ApiEnvelope<unknown> = await res.json();

    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal memperbarui status user");
      return;
    }

    toast.success(json.message || "Status user berhasil diperbarui");
    router.refresh();
  }

  async function handleDelete() {
    const res = await fetch(`/api/user/${user.id}`, { method: "DELETE" });
    const json: ApiEnvelope<unknown> = await res.json();

    if (!res.ok || !json.success) {
      toast.error(json.message || "Gagal menghapus user");
      throw new Error(json.message);
    }

    toast.success("User berhasil dihapus");
    router.refresh();
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/user/${user.id}/edit`} />}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleActive}>
            {user.isActive ? <XCircle /> : <CheckCircle2 />}
            {user.isActive ? "Nonaktifkan" : "Aktifkan"}
          </DropdownMenuItem>
          {!isCurrentUser ? (
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
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Hapus user ini?"
        description={`User "${user.name}" (${user.username}) akan dihapus secara permanen dari daftar aktif.`}
        onConfirm={handleDelete}
      />
    </>
  );
}
