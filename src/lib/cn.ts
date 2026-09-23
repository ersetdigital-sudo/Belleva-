export type ClassValue = string | false | null | undefined;

/** Minimal class-name joiner — avoids pulling in clsx/tailwind-merge. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
