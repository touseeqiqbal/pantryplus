/**
 * First-run / onboarding state.
 *
 * Backed by localStorage so it works fully offline and before any Firestore
 * document exists. Two concerns live here:
 *   1. Whether the user has completed the welcome wizard (`isOnboarded`).
 *   2. Progress on the dashboard "Getting Started" checklist — some steps are
 *      derived from real data (e.g. has inventory) and some are simple
 *      "the user visited this" flags toggled when they tap a shortcut.
 *
 * All helpers are SSR-safe: they no-op / return defaults when `window` is
 * undefined so they can be imported anywhere without guarding every call site.
 */

const ONBOARDED_KEY = 'pantryplus_onboarded_v1';
const CHECKLIST_DISMISSED_KEY = 'pantryplus_getting_started_dismissed_v1';
const STEP_PREFIX = 'pantryplus_gs_step_';

/** Getting-started checklist steps that are tracked by user action (not data). */
export type GettingStartedStep = 'shopping' | 'assistant' | 'scan';

const hasWindow = () => typeof window !== 'undefined';

export function isOnboarded(): boolean {
  if (!hasWindow()) return false;
  try {
    return localStorage.getItem(ONBOARDED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markOnboarded(): void {
  if (!hasWindow()) return;
  try {
    localStorage.setItem(ONBOARDED_KEY, 'true');
  } catch {
    /* ignore */
  }
}

/** Lets the user re-run onboarding (exposed via Settings if desired). */
export function resetOnboarding(): void {
  if (!hasWindow()) return;
  try {
    localStorage.removeItem(ONBOARDED_KEY);
    localStorage.removeItem(CHECKLIST_DISMISSED_KEY);
    (['shopping', 'assistant', 'scan'] as GettingStartedStep[]).forEach((s) =>
      localStorage.removeItem(STEP_PREFIX + s)
    );
  } catch {
    /* ignore */
  }
}

export function isChecklistDismissed(): boolean {
  if (!hasWindow()) return false;
  try {
    return localStorage.getItem(CHECKLIST_DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function dismissChecklist(): void {
  if (!hasWindow()) return;
  try {
    localStorage.setItem(CHECKLIST_DISMISSED_KEY, 'true');
  } catch {
    /* ignore */
  }
}

export function isStepDone(step: GettingStartedStep): boolean {
  if (!hasWindow()) return false;
  try {
    return localStorage.getItem(STEP_PREFIX + step) === 'true';
  } catch {
    return false;
  }
}

export function markStepDone(step: GettingStartedStep): void {
  if (!hasWindow()) return;
  try {
    localStorage.setItem(STEP_PREFIX + step, 'true');
  } catch {
    /* ignore */
  }
}
