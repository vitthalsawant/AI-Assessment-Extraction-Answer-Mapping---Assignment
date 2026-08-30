"use client";

import Image from "next/image";
import Link from "next/link";
import {
  IconArrowLeft,
  IconBell,
  IconChevronDown,
  IconClipboard,
  IconHelp,
  IconMenu,
  IconSparkle,
} from "@/components/icons/VedaIcons";

interface HeaderProps {
  showBack?: boolean;
  backHref?: string;
  mobileVariant?: "upload" | "default";
}

function MobileBackArrow() {
  return (
    <Image
      src="/images/arrow-back.png"
      alt=""
      width={24}
      height={24}
      className="h-6 w-6 object-contain"
      aria-hidden="true"
    />
  );
}

export default function Header({
  showBack = false,
  backHref = "/",
  mobileVariant = "default",
}: HeaderProps) {
  const isUploadMobile = mobileVariant === "upload";
  const showMobileBack = showBack || isUploadMobile;

  return (
    <>
      <div className="shrink-0 px-3 pt-3 sm:px-4 lg:hidden">
        <header className="flex h-14 w-full items-center justify-between rounded-2xl bg-white pl-3 pr-3 shadow-[0px_2px_12px_rgba(0,0,0,0.06)] sm:pl-4 sm:pr-4">
          <div className="flex min-w-0 items-center gap-2">
            {showMobileBack && (
              <Link
                href={backHref}
                className="flex h-6 w-6 shrink-0 items-center justify-center"
                aria-label="Go back"
              >
                <MobileBackArrow />
              </Link>
            )}
            <span className="text-xl font-bold leading-none tracking-[-0.06em] text-veda-text">
              VedaAI
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-veda-bg-off-white"
              aria-label="Notifications"
            >
              <IconBell size={18} className="text-veda-text" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-veda-orange" />
            </button>

            <button
              type="button"
              className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-veda-bg-off-white"
              aria-label="User profile"
            >
              <Image
                src="/images/user-avatar.png"
                alt="Madhur Rastogi"
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            </button>

            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center"
              aria-label="Open menu"
            >
              <IconMenu size={20} className="text-veda-text" />
            </button>
          </div>
        </header>
      </div>

      <header className="hidden h-14 shrink-0 items-center justify-between rounded-2xl bg-white/75 px-6 backdrop-blur-sm lg:flex">
        <div className="flex items-center gap-3">
          {showBack && (
            <Link
              href={backHref}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white transition-colors hover:bg-veda-bg-off-white"
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
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-veda-bg-off-white"
          >
            <IconHelp size={24} className="text-veda-text" />
          </button>

          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-veda-bg-off-white"
          >
            <IconBell size={24} className="text-veda-text" />
            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-veda-orange" />
          </button>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white"
          >
            <IconSparkle size={20} className="text-veda-dark" />
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-3 transition-colors hover:bg-veda-bg-off-white/50"
          >
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-veda-bg-off-white">
              <Image
                src="/images/user-avatar.png"
                alt="Madhur Rastogi"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="hidden text-base font-semibold tracking-[-0.04em] text-veda-text md:block">
              Madhur Rastogi
            </span>
            <IconChevronDown size={24} className="hidden text-veda-text md:block" />
          </button>
        </div>
      </header>
    </>
  );
}
