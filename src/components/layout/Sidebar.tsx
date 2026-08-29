"use client";

import Image from "next/image";
import VedaLogo from "@/components/icons/VedaLogo";
import {
  IconAssignments,
  IconChevronsRight,
  IconClassroom,
  IconExams,
  IconHome,
  IconLibrary,
  IconPanelClose,
  IconToolkitSparkles,
} from "@/components/icons/VedaIcons";

const navItems = [
  { icon: IconHome, label: "Home", active: false },
  { icon: IconClassroom, label: "My Classroom", active: false },
  { icon: IconAssignments, label: "Assignments", active: false },
  { icon: IconExams, label: "Exams", active: true },
  { icon: IconLibrary, label: "My Library", active: false },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  return (
    <aside
      className={`hidden lg:flex h-full flex-col shrink-0 veda-sidebar-shadow bg-white rounded-2xl transition-all duration-300 ${
        collapsed ? "w-16 p-3" : "w-[304px] p-6"
      }`}
    >
      <div className="flex flex-col flex-1 gap-14">
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}
        >
          <div className="flex items-center gap-2">
            <VedaLogo size={40} />
            {!collapsed && (
              <span className="font-bold text-[28px] leading-5 tracking-[-0.06em] text-veda-text">
                VedaAI
              </span>
            )}
          </div>
          {!collapsed && onToggle && (
            <button
              onClick={onToggle}
              className="p-1 hover:opacity-80 transition-opacity"
              aria-label="Collapse sidebar"
            >
              <IconPanelClose size={20} className="shrink-0 text-[#5E5E5E]" />
            </button>
          )}
        </div>

        <div className={`${collapsed ? "inline-flex" : "w-full"} veda-toolkit-border`}>
          <button
            className={`flex items-center justify-center gap-2.5 bg-[#272727] text-white rounded-full veda-toolkit-shadow transition-all ${
              collapsed ? "w-[38px] h-[38px] px-0" : "w-full h-[42px] px-4"
            }`}
          >
            <IconToolkitSparkles size={18} className="shrink-0" />
            {!collapsed && (
              <span className="text-base font-medium tracking-[-0.04em]">
                AI Teacher&apos;s Toolkit
              </span>
            )}
          </button>
        </div>

        <nav className={`flex flex-col gap-2 ${collapsed ? "items-center" : ""}`}>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-xl transition-colors ${
                  collapsed ? "w-9 h-9 justify-center p-2" : "w-full gap-2 px-3 py-2"
                } ${
                  item.active
                    ? "veda-nav-active text-veda-text font-medium"
                    : "text-[#5E5E5E] hover:bg-veda-bg-gray/60"
                }`}
              >
                <Icon size={20} className="shrink-0" />
                {!collapsed && (
                  <span className="text-base tracking-[-0.04em]">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className={`mt-auto ${collapsed ? "flex flex-col items-center gap-2" : ""}`}>
        {collapsed ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-veda-bg-gray shrink-0">
            <Image
              src="/images/dps-school-card.png"
              alt="Delhi Public School"
              width={40}
              height={40}
              className="h-full w-full object-cover object-left"
            />
          </div>
        ) : (
          <Image
            src="/images/dps-school-card.png"
            alt="Delhi Public School, Bokaro Steel City"
            width={256}
            height={84}
            className="w-full h-auto rounded-2xl"
          />
        )}
        {collapsed && onToggle && (
          <button
            onClick={onToggle}
            className="w-11 h-9 flex items-center justify-center text-veda-dark"
            aria-label="Expand sidebar"
          >
            <IconChevronsRight size={20} className="text-veda-text" />
          </button>
        )}
      </div>
    </aside>
  );
}
