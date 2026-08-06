import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Masuk — Cetak Transkrip",
};

function LoginFormFallback() {
  return (
    <div className="bg-card w-full max-w-sm space-y-4 rounded-xl border p-6">
      <Skeleton className="mx-auto size-10 rounded-lg" />
      <Skeleton className="mx-auto h-6 w-48" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export default function LoginPage() {
  // LoginForm reads `redirectTo` via useSearchParams(), which opts the tree into
  // client-side rendering — without this boundary the production prerender fails.
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
