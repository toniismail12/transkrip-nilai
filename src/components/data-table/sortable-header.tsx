"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SortableHeaderProps {
  label: string;
  sortKey: string;
}

export function SortableHeader({ label, sortKey }: SortableHeaderProps) {
  const searchParams = useSearchParams();
  const currentSortBy = searchParams.get("sortBy");
  const currentSortOrder = searchParams.get("sortOrder") ?? "asc";
  const isActive = currentSortBy === sortKey;
  const nextOrder = isActive && currentSortOrder === "asc" ? "desc" : "asc";

  const params = new URLSearchParams(searchParams.toString());
  params.set("sortBy", sortKey);
  params.set("sortOrder", nextOrder);
  params.set("page", "1");

  const Icon = !isActive ? ArrowUpDown : currentSortOrder === "asc" ? ArrowUp : ArrowDown;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      nativeButton={false}
      render={<Link href={`?${params.toString()}`} scroll={false} />}
    >
      {label}
      <Icon className="ml-1.5 size-3.5" />
    </Button>
  );
}
