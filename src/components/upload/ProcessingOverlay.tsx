"use client";

import SparkleLoader from "./SparkleLoader";

function ExtractingContent() {
  return (
    <div className="flex flex-col items-center gap-3 px-2 sm:gap-4 sm:px-4">
      <div className="overflow-visible py-1 sm:py-2">
        <SparkleLoader />
      </div>

      <div className="flex flex-col items-center text-center">
        <h2 className="veda-extracting-shimmer text-2xl font-bold leading-8 tracking-[-0.04em] sm:text-[28px] sm:leading-9 lg:text-[30px]">
          Extracting...
        </h2>
        <p className="text-base leading-7 tracking-[-0.04em] text-[rgba(70,70,70,0.75)] sm:text-lg sm:leading-8 lg:text-xl lg:leading-9">
          This may take a while
        </p>
      </div>
    </div>
  );
}

export default function ProcessingOverlay() {
  return (
    <div className="flex h-full flex-col px-3 pb-3 pt-1 sm:px-4 lg:p-0">
      <div className="flex flex-1 flex-col items-center justify-center overflow-visible rounded-[20px] bg-white px-4 sm:rounded-[28px] sm:px-6 lg:rounded-[40px]">
        <ExtractingContent />
      </div>
    </div>
  );
}
