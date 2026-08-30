"use client";

import SparkleLoader from "./SparkleLoader";

function ExtractingContent() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="overflow-visible px-4 py-2">
        <SparkleLoader />
      </div>

      <div className="flex flex-col items-center text-center">
        <h2 className="veda-extracting-shimmer text-[30px] font-bold leading-9 tracking-[-0.04em]">
          Extracting...
        </h2>
        <p className="text-xl leading-9 tracking-[-0.04em] text-[rgba(70,70,70,0.75)]">
          This may take a while
        </p>
      </div>
    </div>
  );
}

export default function ProcessingOverlay() {
  return (
    <div className="flex h-full flex-col px-3 pb-3 pt-1 lg:p-0">
      <div className="flex flex-1 flex-col items-center justify-center overflow-visible rounded-[28px] bg-white px-6 lg:rounded-[40px]">
        <ExtractingContent />
      </div>
    </div>
  );
}
