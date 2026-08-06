"use client";

import { useState } from "react";
import Link from "next/link";
import { Ban, Eye, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VoidTranskripDialog } from "./void-transkrip-dialog";
import type { TranskripListItem } from "@/services/transkrip.service";

interface TranskripRowActionsProps {
  transkrip: TranskripListItem;
  canVoid: boolean;
}

export function TranskripRowActions({ transkrip, canVoid }: TranskripRowActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [voidOpen, setVoidOpen] = useState(false);

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/transkrip/${transkrip.id}`} />}>
            <Eye />
            Lihat / Cetak Ulang
          </DropdownMenuItem>
          {canVoid && transkrip.status === "GENERATED" ? (
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                setMenuOpen(false);
                setVoidOpen(true);
              }}
            >
              <Ban />
              Batalkan
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <VoidTranskripDialog transkripId={transkrip.id} open={voidOpen} onOpenChange={setVoidOpen} />
    </>
  );
}
