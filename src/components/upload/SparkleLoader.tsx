import Image from "next/image";

export default function SparkleLoader() {
  return (
    <Image
      src="/images/extracting-sparkle.png"
      alt=""
      width={129}
      height={135}
      className="h-14 w-auto object-contain sm:h-16 md:h-[72px]"
      aria-hidden="true"
      priority
      unoptimized
    />
  );
}
