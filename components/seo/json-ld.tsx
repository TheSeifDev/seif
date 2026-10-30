type JsonLdProps = {
  data: unknown;
};

/**
 * Serialize JSON-LD for an inline script while neutralizing HTML-significant
 * characters. In particular, `<` cannot begin an HTML tag inside the script.
 */
export function serializeJsonLd(data: unknown): string {
  return (JSON.stringify(data) ?? "null")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
