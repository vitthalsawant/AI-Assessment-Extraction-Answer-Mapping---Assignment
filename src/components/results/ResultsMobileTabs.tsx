"use client";

type ResultsTab = "questions" | "sheet";

interface ResultsMobileTabsProps {
  activeTab: ResultsTab;
  onChange: (tab: ResultsTab) => void;
}

export default function ResultsMobileTabs({
  activeTab,
  onChange,
}: ResultsMobileTabsProps) {
  return (
    <div className="shrink-0 lg:hidden">
      <div className="relative flex h-11 w-full rounded-full bg-white p-1 shadow-[0px_2px_12px_rgba(0,0,0,0.08)]">
        <div
          aria-hidden="true"
          className="absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-full bg-veda-text shadow-[0px_2px_8px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out"
          style={{
            transform:
              activeTab === "sheet" ? "translateX(100%)" : "translateX(0)",
          }}
        />

        <button
          type="button"
          onClick={() => onChange("questions")}
          className={`relative z-10 flex flex-1 items-center justify-center rounded-full px-4 text-sm font-semibold tracking-[-0.04em] transition-colors duration-300 ${
            activeTab === "questions" ? "text-white" : "text-veda-text-muted"
          }`}
        >
          Questions
        </button>

        <button
          type="button"
          onClick={() => onChange("sheet")}
          className={`relative z-10 flex flex-1 items-center justify-center rounded-full px-4 text-sm font-semibold tracking-[-0.04em] transition-colors duration-300 ${
            activeTab === "sheet" ? "text-white" : "text-veda-text-muted"
          }`}
        >
          Answer Sheet
        </button>
      </div>
    </div>
  );
}

export type { ResultsTab };
