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

  const isUpload = variant === "upload";

  return (
    <div
      className={`h-screen overflow-hidden p-3 ${
        isUpload ? "veda-gradient-bg" : "veda-gradient-bg-alt"
      }`}
    >
      <div className="flex h-full gap-3">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />

        <div className="flex min-h-0 flex-1 flex-col gap-3 min-w-0">
          <Header
            showBack={showBack || isUpload}
            backHref={backHref}
          />

          <main
            className={`min-h-0 flex-1 ${
              isUpload ? "overflow-hidden" : "overflow-auto"
            } ${fullBleed ? "" : "rounded-[40px]"}`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
