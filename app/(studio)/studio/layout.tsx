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
      <div className="flex min-h-screen bg-background text-foreground font-sans antialiased">
        {/* Client Sidebar Console Wrapper */}
        <ClientSidebar session={session} />

        {/* Main Studio Work Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Mobile Bar */}
          <header className="md:hidden flex items-center justify-between border-b border-border/40 p-4 bg-muted/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-serif text-lg font-normal">Favurr Studio</span>
            </div>
            <a
              href="/"
              className="font-mono text-xs uppercase tracking-wider text-foreground inline-flex items-center gap-1.5 border border-border px-3 py-1.5 rounded-md"
            >
              <span>Public</span>
            </a>
          </header>

          <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
