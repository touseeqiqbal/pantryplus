/**
 * Environment variable validation.
 *
 * Validates configuration with Zod and surfaces clear warnings when something
 * is missing — instead of failing deep inside Firebase/Gemini at runtime.
 *
 * IMPORTANT: server-only secrets (e.g. GOOGLE_GENERATIVE_AI_API_KEY) are only
 * read through `getServerEnv()`, which must never be imported into a client
 * component. NEXT_PUBLIC_* values are safe on the client.
 *
 * Validation is non-throwing by design: a missing key logs a warning rather
 * than crashing the build/SSR, so the app still renders (offline-first) and the
 * dev FirebaseStatus badge / friendly errors can guide the fix.
 */
import { z } from 'zod';

const clientSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_SPOONACULAR_API_KEY: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

const serverSchema = z.object({
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),
});

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

// NEXT_PUBLIC_* vars are inlined at build time, so reference them literally.
const rawClientEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  NEXT_PUBLIC_SPOONACULAR_API_KEY: process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
};

export const clientEnv: ClientEnv = (() => {
  const parsed = clientSchema.safeParse(rawClientEnv);
  if (!parsed.success) {
    if (typeof window === 'undefined') {
      console.warn('[env] Invalid NEXT_PUBLIC_* config:', parsed.error.flatten().fieldErrors);
    }
    return rawClientEnv as ClientEnv;
  }
  return parsed.data;
})();

/** Server-only env accessor. Never call this from a client component. */
export function getServerEnv(): ServerEnv {
  const parsed = serverSchema.safeParse({
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
  if (!parsed.success) {
    console.warn('[env] Invalid server config:', parsed.error.flatten().fieldErrors);
    return {} as ServerEnv;
  }
  return parsed.data;
}

/** True when the core Firebase client config is present. */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    clientEnv.NEXT_PUBLIC_FIREBASE_API_KEY &&
      clientEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      clientEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

/** True when Gemini AI is configured (server-side check). */
export function isAIConfigured(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
}
