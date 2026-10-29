import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter at least 2 characters.").max(80, "Please keep your name under 80 characters."),
  email: z.email("Please enter a valid email address.").max(160, "Please keep your email under 160 characters."),
  message: z.string().trim().min(20, "Please share at least 20 characters.").max(4_000, "Please keep your message under 4,000 characters."),
  company: z.string().max(0, "Please leave this field empty.").default(""),
  startedAt: z.number().finite("Please try submitting the form again."),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactFieldErrors = Record<string, string[]>;

export function fieldErrorsFromZod(error: z.ZodError): ContactFieldErrors {
  const fieldErrors: ContactFieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    const key = typeof field === "string" ? field : "_form";
    fieldErrors[key] ??= [];
    if (!fieldErrors[key].includes(issue.message)) fieldErrors[key].push(issue.message);
  }

  return fieldErrors;
}
