import Image from "next/image";
import {
  IconBadgeCheck,
  IconBadgeClock,
  IconBadgeGear,
  IconBadgeShare,
} from "@/components/icons/VedaIcons";

function SparkleBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`absolute flex h-[13px] w-[13px] items-center justify-center rounded-full bg-gradient-to-br from-[#FB975D] to-[#FC5E24] shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default function TeacherIllustration() {
  return (
    <div className="relative h-[138px] w-[137px] shrink-0">
      <div className="absolute inset-0 rounded-full bg-[rgba(255,86,35,0.1)]" />
      <div className="absolute left-1/2 top-[15px] h-[108px] w-[108px] -translate-x-1/2 rounded-full bg-[rgba(255,86,35,0.26)]" />

      {/* White circle — behind character */}
      <div
        className="absolute z-[1] bg-white"
        style={{
          width: "78.61744689941406px",
          height: "77.78010559082031px",
          top: "30.33px",
          left: "30.21px",
          borderRadius: "50%",
        }}
      />

      {/* Character — in front, no image background */}
      <div
        className="absolute z-[2] overflow-hidden"
        style={{
          width: "78.61744689941406px",
          height: "96.82148742675781px",
          top: "11.4px",
          left: "30.21px",
          borderRadius: "52.75px",
        }}
      >
        <Image
          src="/images/slazzer-preview-jljor.png"
          alt="Teacher illustration"
          width={79}
          height={97}
          className="h-full w-full object-cover object-top"
          priority
        />
      </div>

      <SparkleBadge className="right-[6px] top-[6px]">
        <IconBadgeClock size={7} className="text-white" />
      </SparkleBadge>
      <SparkleBadge className="left-[2px] top-[34px]">
        <IconBadgeCheck size={7} className="text-white" />
      </SparkleBadge>
      <SparkleBadge className="right-[2px] top-[70px]">
        <IconBadgeShare size={7} className="text-white" />
      </SparkleBadge>
      <SparkleBadge className="bottom-[4px] left-[28px]">
        <IconBadgeGear size={7} className="text-white" />
      </SparkleBadge>
    </div>
  );
}
