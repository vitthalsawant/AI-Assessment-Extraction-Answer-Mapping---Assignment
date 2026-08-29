import type { ReactNode, SVGProps } from "react";

export const VEDA_ICON_COLORS = {
  navInactive: "#5E5E5E",
  navActive: "#303030",
  breadcrumb: "#A9A9A9",
  primary: "#303030",
  white: "#FFFFFF",
  orange: "#FF5623",
} as const;

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function IconBase({
  size = 20,
  children,
  ...props
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconHome({ size = 20, ...props }: IconProps) {
  return (
    <IconBase size={size} {...props}>
      <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </IconBase>
  );
}

export function IconClassroom({ size = 20, ...props }: IconProps) {
  return (
    <IconBase size={size} {...props}>
      <rect x="2.5" y="4" width="15" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 15.5H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 14.5V15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 11.5C8 10.5 9 10 10 10C11 10 12 10.5 12.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </IconBase>
  );
}

export function IconAssignments({ size = 20, ...props }: IconProps) {
  return (
    <IconBase size={size} {...props}>
      <path
        d="M6 3.5H12.2L15.5 6.8V16.5C15.5 17.05 15.05 17.5 14.5 17.5H6C5.45 17.5 5 17.05 5 16.5V4.5C5 3.95 5.45 3.5 6 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 3.5V7H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7.5 10H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7.5 13H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </IconBase>
  );
}

export function IconExams({ size = 20, ...props }: IconProps) {
  return (
    <IconBase size={size} {...props}>
      <rect x="5.5" y="3.5" width="9" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 3.5V2.5C7.5 2.22 7.72 2 8 2H12C12.28 2 12.5 2.22 12.5 2.5V3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 8H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7.5 11H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7.5 14H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </IconBase>
  );
}

export function IconLibrary({ size = 20, ...props }: IconProps) {
  return (
    <IconBase size={size} {...props}>
      <circle cx="10" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 7V10.5L12.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 4.5C5.2 3.2 7 2.5 10 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </IconBase>
  );
}

export function IconPanelClose({ size = 20, ...props }: IconProps) {
  return (
    <IconBase size={size} {...props}>
      <rect x="3" y="4" width="5" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="12" y="4" width="5" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 8L8 10L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function IconChevronsRight({ size = 20, ...props }: IconProps) {
  return (
    <IconBase size={size} {...props}>
      <path d="M7 6L11 10L7 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 6L15 10L11 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function IconToolkitSparkles({ size = 18, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 1.5L10.1 5.9L14.5 7L10.1 8.1L9 12.5L7.9 8.1L3.5 7L7.9 5.9L9 1.5Z" fill="currentColor" />
      <path d="M14.5 11.5L15 13.3L16.8 13.8L15 14.3L14.5 16.1L14 14.3L12.2 13.8L14 13.3L14.5 11.5Z" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

export function IconArrowLeft({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M14.5 6.5L9 12L14.5 17.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconArrowRight({ size = 20, ...props }: IconProps) {
  return (
    <IconBase size={size} {...props}>
      <path d="M5 10H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11.5 6.5L15 10L11.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function IconClipboard({ size = 20, ...props }: IconProps) {
  return <IconExams size={size} {...props} />;
}

export function IconHelp({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M9.5 9.25C9.75 7.95 10.85 7 12.25 7C13.8 7 15 8.05 15 9.5C15 10.65 14.2 11.45 13.05 12C12.45 12.35 12 13 12 13.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="16.75" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconBell({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M9.5 18.5H14.5M6.5 10.5C6.5 7.46 8.96 5 12 5C15.04 5 17.5 7.46 17.5 10.5C17.5 13.5 18.5 15.5 19.5 16.5H4.5C5.5 15.5 6.5 13.5 6.5 10.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSparkle({ size = 20, ...props }: IconProps) {
  return (
    <IconBase size={size} {...props}>
      <path d="M10 2L11.35 7.15L16.5 8.5L11.35 9.85L10 15L8.65 9.85L3.5 8.5L8.65 7.15L10 2Z" fill="currentColor" />
    </IconBase>
  );
}

export function IconChevronDown({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M7.5 9.5L12 14L16.5 9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconUpload({ size = 32, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M16 7V19" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M11.5 11.5L16 7L20.5 11.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 22H24" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M10 25H22" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function IconClose({ size = 16, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M4.5 4.5L11.5 11.5M11.5 4.5L4.5 11.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function IconChevronUp({ size = 20, ...props }: IconProps) {
  return (
    <IconBase size={size} {...props}>
      <path d="M5.5 12.5L10 8L14.5 12.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function IconChevronDownSmall({ size = 20, ...props }: IconProps) {
  return (
    <IconBase size={size} {...props}>
      <path d="M5.5 7.5L10 12L14.5 7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function IconChevronLeft({ size = 16, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M10 4.5L6 8L10 11.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronRight({ size = 16, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M6 4.5L10 8L6 11.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconAlertTriangle({ size = 48, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M10 3.5L17 16.5H3L10 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 8V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="14" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function IconMinus({ size = 16, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M4 8H12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function IconPlus({ size = 16, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function IconBadgeCheck({ size = 7, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M1.5 3.5L3 5L5.5 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconBadgeShare({ size = 7, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <circle cx="5" cy="1.5" r="1" fill="currentColor" />
      <circle cx="1.5" cy="3.5" r="1" fill="currentColor" />
      <circle cx="5" cy="5.5" r="1" fill="currentColor" />
      <path d="M2.2 3.1L4.4 2M2.2 3.9L4.4 5" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

export function IconBadgeGear({ size = 7, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <circle cx="3.5" cy="3.5" r="1.2" stroke="currentColor" strokeWidth="0.9" />
      <path d="M3.5 1.2V1.8M3.5 5.2V5.8M1.2 3.5H1.8M5.2 3.5H5.8M2 2L2.4 2.4M4.6 4.6L5 5M2 5L2.4 4.6M4.6 2.4L5 2" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconBadgeClock({ size = 7, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <circle cx="3.5" cy="3.5" r="2.3" stroke="currentColor" strokeWidth="0.9" />
      <path d="M3.5 2.2V3.5L4.6 4.2" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}
