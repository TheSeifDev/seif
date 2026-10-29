// Drafts are private until explicitly approved; the dashboard must label origin "initial-draft".
// Keep draft entries out of public listings, routes, sitemap and search metadata.

export type BlogBlock =
  | { type: "p" | "h2" | "h3" | "quote"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "code"; language: string; code: string };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  status: "draft" | "published";
  origin: "initial-draft" | "author";
  reviewRequired: boolean;
  publishedAt?: string;
  updatedAt: string;
  readingMinutes: number;
  tags: string[];
  body: BlogBlock[];
};

export const posts: BlogPost[] = [
  {
    slug: "keep-the-interface-away-from-the-model",
    title: "Keep the interface away from the model",
    description:
      "A backend boundary gives a local-first assistant one place to validate requests, persist state, stream work and recover from failure.",
    status: "draft",
    origin: "initial-draft",
    reviewRequired: true,
    updatedAt: "2026-10-29T00:00:00.000Z",
    readingMinutes: 5,
    tags: ["Architecture", "AI systems", "Local-first"],
    body: [
      {
        type: "p",
        text: "An AI interface becomes easier to reason about when it is not responsible for knowing where the model lives. The UI should describe user intent and display state; a backend should own the boundary to speech-to-text, language-model and text-to-speech services. This is the shape documented by the public RAFIQ repository: rafiq-ai provides STT, LLM and TTS capabilities, HTTP connects it to rafiq-backend, and the backend connects to rafiq-gui through Server-Sent Events. The repository states the rule directly: the GUI never talks directly to AI.",
      },
      {
        type: "quote",
        text: "The interface should send an application request, not carry the knowledge of every AI provider and execution detail.",
      },
      {
        type: "h2",
        text: "The boundary is a product decision",
      },
      {
        type: "p",
        text: "The separation is more than a diagram. It defines who is allowed to make decisions. Electron and React can collect input, show connection state and render streamed output. The backend can validate the input, choose a workflow, record the conversation and translate service-specific failures into an application response. When a model changes, the interface does not need to learn a new SDK. When a desktop screen is replaced, persistence and orchestration remain in one place.",
      },
      {
        type: "p",
        text: "In a local-first product, this boundary also keeps the deployment story explicit. The assistant can use local services or configured remote services behind the same backend contract. HTTP is the request boundary to the AI layer; Fastify, SQLite, SSE and MQTT are part of the backend system described in RAFIQ. The GUI receives a stream from the backend rather than opening a second, hidden path to the model.",
      },
      {
        type: "h2",
        text: "One place for validation and persistence",
      },
      {
        type: "p",
        text: "A request that reaches an AI service is already a meaningful operation. It may create a conversation turn, consume a local resource, trigger device-aware behavior or produce data that the next request needs. Putting validation and persistence at the backend boundary means those concerns can be handled before the model call begins. The backend can reject an incomplete request, attach an identifier, save the accepted turn and then start work.",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Validate the application request rather than trusting values assembled by the UI.",
          "Persist the accepted input and the state needed to resume or inspect the operation.",
          "Run the selected AI workflow behind a stable HTTP contract.",
          "Stream progress and output to the GUI over SSE, with errors represented as application events.",
        ],
      },
      {
        type: "p",
        text: "This arrangement does not guarantee that every operation succeeds. It does make the failure location legible. A validation failure is different from a persistence failure, a model failure and a disconnected stream. That distinction gives the interface enough information to explain what happened without embedding backend policy in the client.",
      },
      {
        type: "h2",
        text: "Retries and streams need ownership",
      },
      {
        type: "p",
        text: "Retries are safest when the server owns them. A client retry can accidentally create duplicate conversation turns if it cannot tell whether the first request was persisted before the connection dropped. The backend can use an operation identifier, check existing state and decide whether a retry is safe. The exact policy depends on the operation, but the location of the policy should not be scattered across screens.",
      },
      {
        type: "p",
        text: "Streaming has the same property. SSE is a transport for updates, not a replacement for application state. The backend can emit a started event, incremental output and a completed or failed event while keeping the authoritative record in SQLite. If the GUI reconnects, the backend can decide whether to replay stored state, resume a stream or report that the operation ended. The UI remains focused on rendering those states.",
      },
      {
        type: "h3",
        text: "Keep contracts small and observable",
      },
      {
        type: "p",
        text: "A useful contract does not expose every internal service. It names the operation, its input, its current state and the events the interface can render. That keeps the architecture open to a different model provider, a different desktop shell or an additional client without making those changes a rewrite of the whole system.",
      },
      {
        type: "p",
        text: "The practical lesson is simple: let the interface own interaction and let the backend own the workflow. For a local-first assistant, that single boundary gives validation, persistence, retries and streaming a coherent home. It also makes the system easier to explain: the GUI talks to the backend, and the backend talks to AI and devices.",
      },
    ],
  },
  {
    slug: "validate-at-the-boundary",
    title: "Validate at the boundary",
    description:
      "Server-side schemas and honest response states turn a route handler into a dependable contract instead of a hopeful parser.",
    status: "draft",
    origin: "initial-draft",
    reviewRequired: true,
    updatedAt: "2026-10-29T00:00:00.000Z",
    readingMinutes: 5,
    tags: ["Next.js", "Validation", "APIs"],
    body: [
      {
        type: "p",
        text: "A browser form is a useful interface, but it is not a security or correctness boundary. A request can be sent without the form, with modified fields or with a content type the UI never produces. The route handler is the first place where the application can make a server-side decision about the shape and meaning of that request. That is why validation belongs at the boundary, before the request reaches persistence or an external service.",
      },
      {
        type: "h2",
        text: "Parse, do not just inspect",
      },
      {
        type: "p",
        text: "With a Next.js route handler, Zod can describe the accepted input and return a parsed value. The parsed value is more useful than a collection of ad hoc checks: downstream code receives the contract the schema established, while invalid input gets a deliberate response. The schema should be shaped around what the operation needs, not around every value a client happens to send.",
      },
      {
        type: "code",
        language: "ts",
        code: "import { NextResponse } from \"next/server\";\nimport { z } from \"zod\";\n\nconst contactSchema = z.object({\n  name: z.string().trim().min(2).max(80),\n  email: z.email(),\n  message: z.string().trim().min(20).max(5000),\n  website: z.string().max(0).optional(),\n});\n\nexport async function POST(request: Request) {\n  const input = contactSchema.safeParse(await request.json());\n\n  if (!input.success) {\n    return NextResponse.json(\n      { ok: false, outcome: \"invalid\" },\n      { status: 400 },\n    );\n  }\n\n  const saved = await saveContactMessage(input.data);\n  return NextResponse.json({ ok: true, outcome: saved ? \"saved\" : \"error\" });\n}",
      },
      {
        type: "p",
        text: "The example is intentionally small. In a production route, parsing is one step in a larger sequence: the handler can apply spam checks and rate limits, persist the message, then attempt a notification. Each step should have an outcome that matches what actually happened. A generic success response after a failed insert makes the API look healthy while losing the user’s message; accepting an empty honeypot value without checking it removes an important signal.",
      },
      {
        type: "p",
        text: "It is worth keeping this sequence visible in the handler instead of hiding it behind a single catch-all helper. A caller needs to know whether it should correct a form, wait and try again, or stop because the server rejected the operation. The server needs the same clarity when it is logging failures. Small, named outcomes make it possible to test those branches without pretending that every failure is equivalent.",
      },
      {
        type: "h2",
        text: "Saved is not the same as notified",
      },
      {
        type: "p",
        text: "This portfolio’s contact endpoint follows that distinction. The response vocabulary separates configuration, validation, rate limiting, rejection and internal errors. When a message is saved, notification status is reported separately as sent, failed or not configured. That is a small contract detail with a large effect on trust: the UI can tell a visitor that the message was stored even when an owner notification did not leave the system.",
      },
      {
        type: "quote",
        text: "An honest response describes the state the server can prove, not the state the user hoped would happen.",
      },
      {
        type: "h2",
        text: "Make invalid states boring",
      },
      {
        type: "p",
        text: "Boundary validation is also a way to keep the rest of the code boring. Once the handler has a parsed name, email and message, the persistence layer does not need to repeat every client assumption. It can still enforce database constraints, because defense in depth is valuable, but it is no longer responsible for interpreting arbitrary JSON. The notification layer receives a saved record or an explicit failure rather than an uncertain object.",
      },
      {
        type: "list",
        items: [
          "Validate JSON on the server even when the client already validates it.",
          "Trim and constrain user-controlled strings before persistence.",
          "Use the parsed value rather than the original untrusted payload.",
          "Return status codes and outcome fields that distinguish invalid, rejected, saved and failed work.",
          "Keep notification state separate from persistence state.",
        ],
      },
      {
        type: "p",
        text: "A response is part of the interface",
      },
      {
        type: "p",
        text: "That contract also gives the client a stable way to recover. It can keep the visitor's message visible after a rejected submission, ask for correction after invalid input, or explain that a saved message is awaiting notification. None of those states needs to be guessed from a generic status code or an empty response body.",
      },
      {
        type: "p",
        text: "The route handler is an interface for the frontend, even though it is not visual. Its response should be designed with the same care as a form: predictable states, clear language and no implication that an unperformed action succeeded. When the server validates at the boundary and reports its real outcome, the client can stay simple and accessible. It only needs to render the contract instead of reconstructing the server’s internal story.",
      },
      {
        type: "p",
        text: "The rule generalises beyond contact forms. File uploads, authentication, webhooks and AI requests all cross a trust boundary. Parse there, persist deliberately and report what is known. The result is not merely safer input handling; it is an API that tells the truth.",
      },
    ],
  },
  {
    slug: "scroll-animation-that-cleans-up-after-itself",
    title: "Scroll animation that cleans up after itself",
    description:
      "Scoped GSAP ScrollTrigger contexts, responsive matchMedia and route-aware refreshes keep a multi-page App Router site calm and reversible.",
    status: "draft",
    origin: "initial-draft",
    reviewRequired: true,
    updatedAt: "2026-10-29T00:00:00.000Z",
    readingMinutes: 6,
    tags: ["GSAP", "Next.js", "Motion"],
    body: [
      {
        type: "p",
        text: "Scroll animation is easy to start and surprisingly easy to leave behind. A trigger created on one route can retain references after navigation, a desktop measurement can be wrong on a narrow viewport, and a font swap can move every start position after the calculations have already run. In a multi-page Next.js App Router site, animation should therefore have a lifecycle: create it inside the component that owns it, scope its selectors, and revert it when that component leaves the tree.",
      },
      {
        type: "h2",
        text: "Give every animation an owner",
      },
      {
        type: "p",
        text: "The @gsap/react useGSAP hook provides a useful ownership boundary. A ref marks the component scope, and animations created in the callback can be reverted when the component unmounts. This avoids a global collection of triggers that must be remembered manually. It also makes a section portable: the section owns its selectors and its cleanup rather than relying on a page-level registry.",
      },
      {
        type: "code",
        language: "tsx",
        code: "\"use client\";\n\nimport gsap from \"gsap\";\nimport { ScrollTrigger } from \"gsap/ScrollTrigger\";\nimport { useGSAP } from \"@gsap/react\";\nimport { useRef } from \"react\";\n\ngsap.registerPlugin(ScrollTrigger);\n\nexport function RevealSection() {\n  const scope = useRef<HTMLElement>(null);\n\n  useGSAP(() => {\n    const media = gsap.matchMedia();\n\n    media.add(\"(prefers-reduced-motion: no-preference)\", () => {\n      gsap.from(\".reveal\", {\n        y: 24,\n        autoAlpha: 0,\n        duration: 0.7,\n        stagger: 0.08,\n        scrollTrigger: { trigger: \".reveal\", start: \"top 85%\" },\n      });\n    });\n\n    return () => media.revert();\n  }, { scope });\n\n  return <section ref={scope}>{/* .reveal content */}</section>;\n}",
      },
      {
        type: "p",
        text: "The important detail is not the particular reveal. It is that the selector is scoped and the media context has a cleanup path. In the real component, a selector such as .reveal should resolve only inside the section. A trigger created for a desktop composition should not keep operating after a route change or a breakpoint change.",
      },
      {
        type: "p",
        text: "A scope also makes review easier. Someone reading the component can see which nodes are animated and which lifecycle owns them, instead of searching the application for a selector that may be shared by unrelated routes. That clarity matters when an animation is adjusted: changing one section should not silently change another section with a matching class name.",
      },
      {
        type: "h2",
        text: "Respect motion and layout conditions",
      },
      {
        type: "p",
        text: "gsap.matchMedia gives responsive rules a clear home. A desktop timeline can be enabled only above a breakpoint, while a mobile layout uses a simpler enter animation or no animation at all. The same context can guard against prefers-reduced-motion. Reduced motion is not a visual preference to hide in a settings panel; it is a browser-provided instruction that the implementation should honor before creating movement.",
      },
      {
        type: "list",
        items: [
          "Keep pinned or scrubbed compositions behind a desktop media query when they depend on wide geometry.",
          "Use static or short opacity transitions when reduced motion is requested.",
          "Do not create triggers at module scope; create them from a mounted component.",
          "Return cleanup for any listeners, media contexts or custom resources the component creates.",
        ],
      },
      {
        type: "h2",
        text: "Refresh after the page settles",
      },
      {
        type: "p",
        text: "ScrollTrigger calculates positions from the layout it can see. App Router navigation changes that layout without a full document reload, and web fonts can change line wrapping after the first paint. A route-level motion coordinator can refresh ScrollTrigger after navigation, and a font-loading completion can request another refresh when typography is ready. The refresh belongs to lifecycle coordination; the triggers themselves still belong to their components.",
      },
      {
        type: "p",
        text: "Refresh is not a substitute for cleanup. If an old route has left triggers behind, refreshing only recalculates stale work. The right order is ownership first, then measurement: revert on unmount, create the next route’s contexts, and refresh after the new layout and fonts have settled. This keeps a route change from becoming an accumulation of invisible listeners.",
      },
      {
        type: "h3",
        text: "Avoid the global trigger trap",
      },
      {
        type: "p",
        text: "Global triggers are tempting because they make a demo quick. They also make it unclear which section controls a pin, who removes it and which breakpoint assumptions it carries. A component-scoped context is a modest constraint that pays back whenever the page is reused, navigated away from or rendered at a different width.",
      },
      {
        type: "quote",
        text: "Good motion is reversible: it explains the layout while the component exists, then leaves no hidden work behind.",
      },
      {
        type: "p",
        text: "The implementation pattern is therefore straightforward. Register GSAP once, create section work through useGSAP, branch with matchMedia, opt out for reduced motion and let the route lifecycle refresh measurements after navigation and fonts. The result is not animation for its own sake. It is a page that can move, resize and change routes without losing control of its own behavior.",
      },
    ],
  },
];

export function getPublishedPosts(): Array<BlogPost & { publishedAt: string }> {
  return posts
    .filter(
      (post): post is BlogPost & { publishedAt: string } =>
        post.status === "published" && Boolean(post.publishedAt),
    )
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
}

export function getPublishedPost(slug: string): (BlogPost & { publishedAt: string }) | undefined {
  return getPublishedPosts().find((post) => post.slug === slug);
}
