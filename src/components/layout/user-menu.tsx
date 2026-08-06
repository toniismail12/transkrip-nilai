"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Role } from "@/types/auth";

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrator",
  OPERATOR: "Operator",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

interface UserMenuProps {
  name: string;
  role: Role;
}

export function UserMenu({ name, role }: UserMenuProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Gagal keluar, coba lagi");
      setIsLoggingOut(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="h-auto gap-2 px-1.5" />}>
        <Avatar size="sm">
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="hidden text-left leading-tight sm:grid">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-muted-foreground text-xs">{ROLE_LABEL[role]}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* GroupLabel milik Base UI wajib berada di dalam Menu.Group, kalau tidak
            akan melempar "MenuGroupContext is missing" di console. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="grid">
              <span className="font-medium">{name}</span>
              <span className="text-muted-foreground text-xs font-normal">{ROLE_LABEL[role]}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/profile" />}>
          <UserIcon />
          Profil Saya
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? <Loader2 className="animate-spin" /> : <LogOut />}
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
