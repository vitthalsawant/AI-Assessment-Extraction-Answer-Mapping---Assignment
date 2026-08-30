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
    <div className="shrink-0 xl:hidden">
      <div className="flex rounded-full bg-[#E8E8E8] p-1">
        <button
          type="button"
          onClick={() => onChange("questions")}
          className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold tracking-[-0.04em] transition-colors ${
            activeTab === "questions"
              ? "bg-veda-text text-white shadow-sm"
              : "text-veda-text-muted"
          }`}
        >
          Questions
        </button>
        <button
          type="button"
          onClick={() => onChange("sheet")}
          className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold tracking-[-0.04em] transition-colors ${
            activeTab === "sheet"
              ? "bg-veda-text text-white shadow-sm"
              : "text-veda-text-muted"
          }`}
        >
          Answer Sheet
        </button>
      </div>
    </div>
  );
}

export type { ResultsTab };
