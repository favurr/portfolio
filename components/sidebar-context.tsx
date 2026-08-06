"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isCompact: boolean;
  setIsCompact: (compact: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCompact, setIsCompact] = useState(false);

  // Sync custom local configuration preferences
  useEffect(() => {
    const stored = localStorage.getItem("studio-sidebar-compact");
    if (stored === "true") {
      setIsCompact(true);
    }
  }, []);

  const handleSetCompact = (compact: boolean) => {
    setIsCompact(compact);
    localStorage.setItem("studio-sidebar-compact", compact ? "true" : "false");
  };

  return (
    <SidebarContext.Provider value={{ isCompact, setIsCompact: handleSetCompact }}>
      {children}
    </SidebarContext.Provider>
  );
}
