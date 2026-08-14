import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/sidebar-context";
import { ClientSidebar } from "./components/ClientSidebar";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans antialiased">
        {/* Client Sidebar Console Wrapper — sticky, always in view */}
        <ClientSidebar session={session} />

        {/* Main Studio Work Area — scrolls independently */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
