import Image from "next/image";

/**
 * Rendered lockup size (height 36px, true ratio 1064:328). Declaring the
 * *display* size rather than the 1064px source keeps next/image from serving a
 * 1080px-wide file for a 117px slot.
 */
const LOGO_SIZE = { width: 117, height: 36 } as const;

interface LogoProps {
  /** `light` is the white lockup used on the dark footer. */
  variant?: "dark" | "light";
  className?: string;
  priority?: boolean;
}

export function Logo({ variant = "dark", className, priority = false }: LogoProps) {
  return (
    <Image
      src={variant === "light" ? "/images/logo-belleva-white.png" : "/images/logo-belleva.png"}
      alt="Belleva"
      width={LOGO_SIZE.width}
      height={LOGO_SIZE.height}
      priority={priority}
      className={className}
    />
  );
}
