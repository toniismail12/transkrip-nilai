"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NilaiSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [npm, setNpm] = useState(searchParams.get("npm") ?? "");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!npm.trim()) return;
    router.push(`/nilai?npm=${encodeURIComponent(npm.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Masukkan NPM mahasiswa..."
        value={npm}
        onChange={(event) => setNpm(event.target.value)}
        className="max-w-xs"
      />
      <Button type="submit">
        <Search />
        Cari
      </Button>
    </form>
  );
}
