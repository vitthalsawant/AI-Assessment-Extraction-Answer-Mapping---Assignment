"use client";

import Image from "next/image";
import Link from "next/link";
import {
  IconArrowLeft,
  IconBell,
  IconChevronDown,
  IconClipboard,
  IconHelp,
  IconSparkle,
} from "@/components/icons/VedaIcons";

interface HeaderProps {
  showBack?: boolean;
  backHref?: string;
}

export default function Header({ showBack = false, backHref = "/" }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-0 h-14 bg-white/75 backdrop-blur-sm rounded-2xl shrink-0">
      <div className="flex items-center gap-3">
        {showBack && (
          <Link
            href={backHref}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full hover:bg-veda-bg-off-white transition-colors"
          >
            <IconArrowLeft size={24} className="text-veda-text" />
          </Link>
        )}
        <div className="flex items-center gap-2">
          <IconClipboard size={20} className="text-veda-disabled" />
          <span className="text-base font-semibold tracking-[-0.04em] text-veda-disabled">
            Exams
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button className="w-9 h-9 flex items-center justify-center bg-veda-bg-off-white rounded-full">
          <IconHelp size={24} className="text-veda-text" />
        </button>

        <button className="relative w-9 h-9 flex items-center justify-center bg-veda-bg-off-white rounded-full">
          <IconBell size={24} className="text-veda-text" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-veda-orange rounded-full" />
        </button>

        <button className="w-9 h-9 flex items-center justify-center bg-white rounded-full">
          <IconSparkle size={20} className="text-veda-dark" />
        </button>

        <button className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl hover:bg-veda-bg-off-white/50 transition-colors">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-veda-bg-off-white shrink-0">
            <Image
              src="/images/user-avatar.png"
              alt="Madhur Rastogi"
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-base font-semibold tracking-[-0.04em] text-veda-text hidden md:block">
            Madhur Rastogi
          </span>
          <IconChevronDown size={24} className="text-veda-text hidden md:block" />
        </button>
      </div>
    </header>
  );
}
