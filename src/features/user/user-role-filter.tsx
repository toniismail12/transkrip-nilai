"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_VALUE = "__all__";

const ROLE_ITEMS: Record<string, string> = {
  [ALL_VALUE]: "Semua Role",
  ADMIN: "Administrator",
  OPERATOR: "Operator",
};

export function UserRoleFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRole = searchParams.get("role") ?? "";

  function updateParam(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL_VALUE || !value) {
      params.delete("role");
    } else {
      params.set("role", value);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  return (
    <Select
      items={ROLE_ITEMS}
      value={currentRole || ALL_VALUE}
      onValueChange={(value) => updateParam(value ?? "")}
    >
      <SelectTrigger className="w-full sm:w-48">
        <SelectValue placeholder="Semua Role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>Semua Role</SelectItem>
        <SelectItem value="ADMIN">Administrator</SelectItem>
        <SelectItem value="OPERATOR">Operator</SelectItem>
      </SelectContent>
    </Select>
  );
}
