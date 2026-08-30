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
      className={`flex h-[100dvh] flex-col overflow-hidden lg:h-screen ${
        isUpload
          ? "veda-gradient-bg p-0 lg:p-3"
          : "veda-gradient-bg-alt p-0 lg:p-3"
      }`}
    >
      <div className="flex min-h-0 flex-1 gap-3">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-0 lg:gap-3">
          <Header
            showBack={showBack}
            backHref={backHref}
            mobileVariant={isUpload ? "upload" : "default"}
          />

          <main
            className={`min-h-0 flex-1 ${
              isUpload ? "overflow-hidden" : "overflow-auto"
            } ${fullBleed ? "" : "rounded-none lg:rounded-[40px]"}`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
