"use client";

import * as React from "react";
import { RealtimeProvider as UpstashRealtimeProvider } from "@upstash/realtime/client";

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  return (
    <UpstashRealtimeProvider api={{ url: "/api/realtime" }}>
      {children}
    </UpstashRealtimeProvider>
  );
}
