import type { BlogBlock } from "@/lib/content/blog";

export function ArticleBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="mx-auto max-w-[68ch] text-[18px] leading-[1.75] text-ink">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "h2":
            return (
              <h2
                key={`${block.type}-${index}`}
                className="mt-14 scroll-mt-24 font-display text-[clamp(1.8rem,3vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink first:mt-0"
              >
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={`${block.type}-${index}`}
                className="mt-10 font-display text-[clamp(1.35rem,2vw,1.75rem)] font-bold leading-[1.1] tracking-[-0.025em] text-ink"
              >
                {block.text}
              </h3>
            );
          case "quote":
            return (
              <blockquote
                key={`${block.type}-${index}`}
                className="my-10 border-l-2 border-sky-ink pl-5 text-[1.15em] leading-[1.55] text-slate-ink"
              >
                {block.text}
              </blockquote>
            );
          case "list": {
            const List = block.ordered ? "ol" : "ul";
            return (
              <List
                key={`${block.type}-${index}`}
                className={`${block.ordered ? "list-decimal" : "list-disc"} my-7 space-y-3 pl-6 marker:text-sky-ink`}
              >
                {block.items.map((item) => (
                  <li key={item} className="pl-2">
                    {item}
                  </li>
                ))}
              </List>
            );
          }
          case "code":
            return (
              <figure
                key={`${block.type}-${index}`}
                className="my-10 overflow-hidden rounded-2xl bg-night-2 text-snow"
              >
                <figcaption className="border-b border-white/10 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-mist">
                  {block.language}
                </figcaption>
                <pre className="overflow-x-auto p-5 text-[13px] leading-[1.7] text-snow/90">
                  <code>{block.code}</code>
                </pre>
              </figure>
            );
          case "p":
            return (
              <p key={`${block.type}-${index}`} className="my-7 first:mt-0">
                {block.text}
              </p>
            );
        }
      })}
    </div>
  );
}
