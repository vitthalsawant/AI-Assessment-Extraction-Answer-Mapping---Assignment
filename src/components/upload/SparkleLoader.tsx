import Image from "next/image";

export default function SparkleLoader() {
  return (
    <Image
      src="/images/extracting-sparkle.png"
      alt=""
      width={129}
      height={135}
      className="h-[72px] w-auto object-contain"
      aria-hidden="true"
      priority
      unoptimized
    />
  );
}
