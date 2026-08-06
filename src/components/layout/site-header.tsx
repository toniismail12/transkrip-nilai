import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { BreadcrumbNav } from "@/components/layout/breadcrumb-nav";
import { UserMenu } from "@/components/layout/user-menu";
import type { Role } from "@/types/auth";

interface SiteHeaderProps {
  name: string;
  role: Role;
}

export function SiteHeader({ name, role }: SiteHeaderProps) {
  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b backdrop-blur-sm">
      <div className="flex w-full items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <BreadcrumbNav />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <UserMenu name={name} role={role} />
        </div>
      </div>
    </header>
  );
}
