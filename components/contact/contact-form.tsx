"use client";

import { useRef, useState } from "react";
import {
  contactSchema,
  fieldErrorsFromZod,
  type ContactFieldErrors,
} from "@/lib/contact/schema";
import { getCopy } from "@/lib/cms/copy";
import { useSiteContent } from "@/components/site/site-content-provider";
import { label } from "@/lib/ui/layout";

type ApiResponse = {
  status: string;
  notification?: string;
  fieldErrors?: unknown;
  retryAfterSeconds?: number;
};

type FormValues = {
  name: string;
  email: string;
  message: string;
  company: string;
};

const initialValues: FormValues = {
  name: "",
  email: "",
  message: "",
  company: "",
};

function createIdempotencyKey(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `contact-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function fieldErrorsFromResponse(value: unknown): ContactFieldErrors {
  if (!isRecord(value)) return {};
  const errors: ContactFieldErrors = {};
  for (const [field, messages] of Object.entries(value)) {
    if (Array.isArray(messages)) {
      const strings = messages.filter(
        (message): message is string => typeof message === "string",
      );
      if (strings.length > 0) errors[field] = strings;
    }
  }
  return errors;
}

function formErrorText(errors: ContactFieldErrors, field: keyof FormValues) {
  return errors[field]?.[0];
}

function expand(template: string, values: Record<string, string>) {
  return template.replace(
    /\{(\w+)\}/g,
    (_, key: string) => values[key] ?? `{${key}}`,
  );
}

export function ContactForm() {
  const { profile, copy } = useSiteContent();
  const email = profile.email;
  const [values, setValues] = useState<FormValues>(initialValues);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Synchronous in-flight lock prevents rapid double-clicks before React state re-renders
  const inFlightRef = useRef(false);
  // Per-submission idempotency key: preserved across network retries of the same form,
  // and rotated only after a submission is saved or when the user edits fields after a save.
  const idempotencyKeyRef = useRef<string>(createIdempotencyKey());

  const c = (key: string, fallback: string) => getCopy(copy, key, fallback);

  function updateValue(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setStatus("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlightRef.current || submitting) {
      return;
    }

    setStatus("");
    const currentIdempotencyKey = idempotencyKeyRef.current;
    const parsed = contactSchema.safeParse({
      ...values,
      startedAt,
      idempotencyKey: currentIdempotencyKey,
    });
    if (!parsed.success) {
      setErrors(fieldErrorsFromZod(parsed.error));
      setStatus(
        c(
          "contact.form.validationError",
          "Please correct the highlighted fields. Your message was not sent.",
        ),
      );
      return;
    }

    inFlightRef.current = true;
    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": currentIdempotencyKey,
        },
        body: JSON.stringify({
          ...values,
          startedAt,
          idempotencyKey: currentIdempotencyKey,
        }),
      });
      const body: unknown = await response.json();
      const result: ApiResponse =
        isRecord(body) && typeof body.status === "string"
          ? (body as ApiResponse)
          : { status: "error" };

      if (result.status === "saved") {
        const submittedEmail = values.email;
        // Always clear form fields, reset startedAt, and rotate the idempotency key
        // whenever the message is saved (regardless of downstream notification status).
        setValues(initialValues);
        setStartedAt(Date.now());
        idempotencyKeyRef.current = createIdempotencyKey();

        if (result.notification === "sent") {
          setStatus(
            expand(
              c(
                "contact.form.received",
                "Message received. Thank you I'll reply to {email} soon.",
              ),
              { email: submittedEmail },
            ),
          );
        } else if (result.notification === "not_configured") {
          setStatus(
            c(
              "contact.form.savedNotificationNotConfigured",
              "Your message was saved. The email notification is not configured, but your message is stored and will be reviewed.",
            ),
          );
        } else {
          setStatus(
            c(
              "contact.form.savedNotificationFailed",
              "Your message was saved. The email notification failed, but your message is stored and will be reviewed.",
            ),
          );
        }
      } else if (result.status === "invalid") {
        setErrors(fieldErrorsFromResponse(result.fieldErrors));
        setStatus(
          c(
            "contact.form.validationError",
            "Please correct the highlighted fields. Your message was not sent.",
          ),
        );
      } else if (result.status === "rejected") {
        setStatus(
          expand(
            c(
              "contact.form.rejected",
              "Your message was not sent. Please email {email} directly.",
            ),
            { email },
          ),
        );
      } else if (result.status === "rate_limited") {
        setStatus(
          expand(
            c(
              "contact.form.rateLimited",
              "Your message was not sent because there have been several recent attempts. Please email {email} directly.",
            ),
            { email },
          ),
        );
      } else if (result.status === "not_configured") {
        setStatus(
          expand(
            c(
              "contact.form.serviceNotConfigured",
              "Not sent. The contact service isn't configured yet, so your message was not saved. Please email {email} directly.",
            ),
            { email },
          ),
        );
      } else {
        setStatus(
          expand(
            c(
              "contact.form.serviceError",
              "Your message was not sent because the contact service could not accept it. Please email {email} directly.",
            ),
            { email },
          ),
        );
      }
    } catch {
      setStatus(
        expand(
          c(
            "contact.form.networkError",
            "Your message was not sent because the network request failed. Please email {email} directly.",
          ),
          { email },
        ),
      );
    } finally {
      inFlightRef.current = false;
      setSubmitting(false);
    }
  }

  const nameError = formErrorText(errors, "name");
  const emailError = formErrorText(errors, "email");
  const messageError = formErrorText(errors, "message");

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={submitting}
      className="rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-night-2 p-5 sm:p-8 lg:p-10 text-snow"
    >
      <div className="grid gap-6">
        <div>
          <label htmlFor="contact-name" className={label}>
            {c("contact.form.nameLabel", "Name")}
          </label>
          <input
            id="contact-name"
            name="name"
            value={values.name}
            onChange={(event) => updateValue("name", event.target.value)}
            autoComplete="name"
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? "contact-name-error" : undefined}
            className="mt-3 h-12 w-full rounded-xl border border-white/10 bg-night-3 px-4 text-base sm:text-[15px] text-snow outline-none transition-colors placeholder:text-mist focus:border-sky focus:ring-2 focus:ring-sky/30"
            placeholder={c("contact.form.namePlaceholder", "Your name")}
          />
          {nameError ? (
            <p id="contact-name-error" className="mt-2 text-sm text-[#ff8a8a]">
              {nameError}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="contact-email" className={label}>
            {c("contact.form.emailLabel", "Email")}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => updateValue("email", event.target.value)}
            autoComplete="email"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "contact-email-error" : undefined}
            className="mt-3 h-12 w-full rounded-xl border border-white/10 bg-night-3 px-4 text-base sm:text-[15px] text-snow outline-none transition-colors placeholder:text-mist focus:border-sky focus:ring-2 focus:ring-sky/30"
            placeholder={c("contact.form.emailPlaceholder", "you@example.com")}
          />
          {emailError ? (
            <p id="contact-email-error" className="mt-2 text-sm text-[#ff8a8a]">
              {emailError}
            </p>
          ) : null}
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor="contact-message" className={label}>
              {c("contact.form.messageLabel", "Message")}
            </label>
            <span className="font-mono text-[11px] tracking-[0.12em] text-mist">
              {values.message.length}/4000
            </span>
          </div>
          <textarea
            id="contact-message"
            name="message"
            value={values.message}
            onChange={(event) => updateValue("message", event.target.value)}
            aria-invalid={Boolean(messageError)}
            aria-describedby={
              messageError ? "contact-message-error" : undefined
            }
            rows={7}
            className="mt-3 w-full resize-y rounded-xl border border-white/10 bg-night-3 px-4 py-3 text-base sm:text-[15px] leading-relaxed text-snow outline-none transition-colors placeholder:text-mist focus:border-sky focus:ring-2 focus:ring-sky/30"
            placeholder={c(
              "contact.form.messagePlaceholder",
              "Tell me what you are building, what is getting in the way, or what you would like to explore.",
            )}
          />
          {messageError ? (
            <p
              id="contact-message-error"
              className="mt-2 text-sm text-[#ff8a8a]"
            >
              {messageError}
            </p>
          ) : null}
        </div>
        <div
          aria-hidden="true"
          className="absolute -left-[10000px] h-px w-px overflow-hidden"
        >
          <label htmlFor="contact-company">
            {c("contact.form.companyLabel", "Company")}
          </label>
          <input
            id="contact-company"
            name="company"
            value={values.company}
            onChange={(event) => updateValue("company", event.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          aria-disabled={submitting}
          className="group/pill inline-flex h-12 w-full sm:w-fit items-center justify-center rounded-full bg-snow px-6 text-sm font-semibold text-night transition-colors duration-300 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? c("contact.form.sending", "Sending…")
            : c("contact.form.send", "Send message")}
        </button>
        <p
          aria-live="polite"
          className="min-h-6 text-sm leading-relaxed text-sky break-words"
        >
          {status}
        </p>
      </div>
    </form>
  );
}
