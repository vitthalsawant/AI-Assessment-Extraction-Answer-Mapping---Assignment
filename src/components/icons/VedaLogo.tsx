export default function VedaLogo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="10" fill="#303030" />
      <path
        d="M8 12 L16 28 L20 20 L24 28 L32 12 L28 12 L20 24 L12 12 Z"
        fill="white"
      />
    </svg>
  );
}
