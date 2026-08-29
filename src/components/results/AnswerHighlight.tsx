interface AnswerHighlightProps {
  label: string;
}

export default function AnswerHighlight({ label }: AnswerHighlightProps) {
  return (
    <div className="pointer-events-none relative h-full w-full">
      <div className="absolute left-3.5 top-0 z-10 -translate-y-[42%] rounded-t-[10px] bg-[#34AC15] px-3 pb-1.5 pt-1">
        <span className="text-base font-bold leading-none tracking-[-0.04em] text-white">
          Q{label}
        </span>
      </div>

      <svg
        className="h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <rect
          x="1"
          y="1"
          width="98"
          height="98"
          rx="10"
          ry="10"
          fill="rgba(94, 255, 53, 0.12)"
          stroke="#3DD218"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
