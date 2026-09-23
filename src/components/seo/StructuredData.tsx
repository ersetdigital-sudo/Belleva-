import { buildStructuredData } from "@/lib/structured-data";

/**
 * JSON-LD is structured data, not executable code, so it is rendered with a
 * native <script> tag. `<` is escaped to `\u003c` to keep the payload XSS-safe
 * (see the JSON-LD guide in the bundled Next.js docs).
 */
export function StructuredData() {
  const json = JSON.stringify(buildStructuredData()).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
