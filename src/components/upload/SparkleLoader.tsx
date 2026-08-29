export default function SparkleLoader() {
  return (
    <div className="relative h-[72px] w-[128px]">
      <svg
        viewBox="0 0 128 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="sparkle-main"
            x1="44"
            y1="8"
            x2="88"
            y2="52"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FF9360" />
            <stop offset="1" stopColor="#FF5623" />
          </linearGradient>
          <linearGradient
            id="sparkle-secondary"
            x1="34"
            y1="34"
            x2="68"
            y2="66"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FF9360" />
            <stop offset="1" stopColor="#FF5623" />
          </linearGradient>
        </defs>

        <circle
          cx="34"
          cy="22"
          r="5.5"
          fill="#FF5623"
          opacity="0.85"
          className="animate-sparkle"
        />

        <path
          d="M74 8C74 8 78.5 20.5 90 25C78.5 29.5 74 42 74 42C74 42 69.5 29.5 58 25C69.5 20.5 74 8 74 8Z"
          fill="url(#sparkle-main)"
          className="animate-sparkle"
        />

        <path
          d="M54 36C54 36 57 44.5 64.5 47.5C57 50.5 54 59 54 59C54 59 51 50.5 43.5 47.5C51 44.5 54 36 54 36Z"
          fill="url(#sparkle-secondary)"
          opacity="0.92"
          className="animate-sparkle"
          style={{ animationDelay: "0.25s" }}
        />

        <path
          d="M96 50C96 50 97.4 53.8 100.5 55C97.4 56.2 96 60 96 60C96 60 94.6 56.2 91.5 55C94.6 53.8 96 50 96 50Z"
          fill="#8B3E26"
          opacity="0.75"
          className="animate-sparkle"
          style={{ animationDelay: "0.5s" }}
        />
      </svg>
    </div>
  );
}
