import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { LayoutAnimations } from "./components/LayoutAnimations";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PublicShell } from "@/components/public-shell";
import { ChatWidget } from "@/components/chat/ChatWidget";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <PublicShell>
      <LayoutAnimations>
        <Navbar session={session?.session || null} />
        {/* Main Content Area */}
        <main className="flex-1">{children}</main>
        <ChatWidget />
        <Footer />
      </LayoutAnimations>
    </PublicShell>
  );
}
