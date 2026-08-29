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
      className={`absolute flex items-center justify-center w-[13px] h-[13px] rounded-full bg-gradient-to-br from-[#FB975D] to-[#FC5E24] shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default function TeacherIllustration() {
  return (
    <div className="relative w-[137px] h-[138px] flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-[rgba(255,86,35,0.1)]" />
      <div className="absolute w-[108px] h-[108px] top-[15px] left-1/2 -translate-x-1/2 rounded-full bg-[rgba(255,86,35,0.26)]" />

      <div
        className="absolute z-10 overflow-hidden rounded-full bg-[#FFFFFF]"
        style={{
          width: "78.61744689941406px",
          height: "77.78010559082031px",
          top: "30.33px",
          left: "30.21px",
        }}
      >
        <Image
          src="/images/teacher.png"
          alt="Teacher illustration"
          width={79}
          height={78}
          className="h-full w-full object-cover object-top"
          priority
        />
      </div>

      <SparkleBadge className="left-0 top-8">
        <IconBadgeCheck size={7} className="text-white" />
      </SparkleBadge>
      <SparkleBadge className="right-0 top-[70px]">
        <IconBadgeShare size={7} className="text-white" />
      </SparkleBadge>
      <SparkleBadge className="right-2 top-0">
        <IconBadgeClock size={7} className="text-white" />
      </SparkleBadge>
      <SparkleBadge className="left-7 bottom-1">
        <IconBadgeGear size={7} className="text-white" />
      </SparkleBadge>
    </div>
  );
}
