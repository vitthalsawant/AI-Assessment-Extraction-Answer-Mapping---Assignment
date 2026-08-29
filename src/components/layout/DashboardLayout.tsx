"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
  backHref?: string;
  collapsedSidebar?: boolean;
  variant?: "upload" | "default";
  fullBleed?: boolean;
}

export default function DashboardLayout({
  children,
  showBack = false,
  backHref = "/",
  collapsedSidebar = false,
  variant = "upload",
  fullBleed = false,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(collapsedSidebar);

  return (
    <div
      className={`min-h-screen p-3 ${
        variant === "upload" ? "veda-gradient-bg" : "veda-gradient-bg-alt"
      }`}
    >
      <div className="flex gap-3 min-h-[calc(100vh-24px)]">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />

        <div className="flex-1 flex flex-col min-w-0 gap-3">
          <Header
            showBack={showBack || variant === "upload"}
            backHref={backHref}
          />

          <main
            className={`flex-1 overflow-auto ${
              fullBleed ? "" : "rounded-[40px]"
            }`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
