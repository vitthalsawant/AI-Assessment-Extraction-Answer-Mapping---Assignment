"use client";

import SparkleLoader from "./SparkleLoader";

export default function ProcessingOverlay() {
  return (
    <>
      <div className="flex h-full flex-col px-3 pb-3 pt-1 lg:hidden">
        <div className="flex flex-1 flex-col items-center justify-center rounded-[28px] bg-white px-6">
          <div className="flex flex-col items-center gap-4">
            <SparkleLoader />

            <div className="flex flex-col items-center text-center">
              <h2 className="text-[30px] font-bold leading-9 tracking-[-0.04em] text-veda-text">
                Extracting...
              </h2>
              <p className="text-xl leading-9 tracking-[-0.04em] text-[rgba(70,70,70,0.75)]">
                This may take a while
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden h-full flex-col items-center justify-center overflow-hidden bg-white px-6 lg:flex">
        <div className="flex flex-col items-center gap-4">
          <SparkleLoader />

          <div className="flex flex-col items-center text-center">
            <h2
              className="text-[30px] font-bold leading-9 tracking-[-0.04em] veda-extracting-text animate-shimmer"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Extracting...
            </h2>
            <p className="text-xl leading-9 tracking-[-0.04em] text-[rgba(70,70,70,0.75)]">
              This may take a while
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
