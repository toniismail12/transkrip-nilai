import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default async function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar role={user.role} />
      <SidebarInset>
        <SiteHeader name={user.name} role={user.role} />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
