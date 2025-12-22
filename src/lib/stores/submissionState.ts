import { writable, type Writable } from "svelte/store";
import { browser } from "$app/environment";

export type SubmissionStatus = "Not submitted" | "Submitted" | "Modified";

interface SubmissionState {
  status: SubmissionStatus;
  lastSubmittedAt: Date | null;
  lastSubmittedCode: string | null;
}

const stores = new Map<string, Writable<SubmissionState>>();

function createDefaultState(): SubmissionState {
  return {
    status: "Not submitted",
    lastSubmittedAt: null,
    lastSubmittedCode: null,
  };
}

export function getSubmissionState(challengeId: string): Writable<SubmissionState> {
  if (!stores.has(challengeId)) {
    const key = `submissionState-${challengeId}`;
    let initialState = createDefaultState();

    // Load from localStorage if in browser
    if (browser) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          initialState = {
            status: parsed.status || "Not submitted",
            lastSubmittedAt: parsed.lastSubmittedAt ? new Date(parsed.lastSubmittedAt) : null,
            lastSubmittedCode: parsed.lastSubmittedCode || null,
          };
        } catch (error) {
          console.error("Failed to parse stored submission state:", error);
        }
      }
    }

    const store = writable<SubmissionState>(initialState);

    // Subscribe to save to localStorage
    if (browser) {
      store.subscribe((value) => {
        const serialized = JSON.stringify({
          status: value.status,
          lastSubmittedAt: value.lastSubmittedAt?.toISOString() || null,
          lastSubmittedCode: value.lastSubmittedCode,
        });
        localStorage.setItem(key, serialized);
      });
    }

    stores.set(challengeId, store);
  }

  return stores.get(challengeId)!;
}

/**
 * Mark a challenge as submitted with the given code
 */
export function markAsSubmitted(challengeId: string, code: string): void {
  const store = getSubmissionState(challengeId);
  store.update((state) => ({
    ...state,
    status: "Submitted",
    lastSubmittedAt: new Date(),
    lastSubmittedCode: code,
  }));
}

/**
 * Mark a challenge as modified (code has changed since last submission)
 */
export function markAsModified(challengeId: string): void {
  const store = getSubmissionState(challengeId);
  store.update((state) => ({
    ...state,
    status: state.lastSubmittedCode ? "Modified" : "Not submitted",
  }));
}

/**
 * Update submission state from database (when loading from DB)
 */
export function updateFromDB(challengeId: string, code: string, submittedAt: Date): void {
  const store = getSubmissionState(challengeId);
  store.update((state) => ({
    ...state,
    status: "Submitted",
    lastSubmittedAt: submittedAt,
    lastSubmittedCode: code,
  }));
}

/**
 * Check if current code matches last submitted code
 */
export function checkIfModified(challengeId: string, currentCode: string): boolean {
  const store = getSubmissionState(challengeId);
  let isModified = false;

  store.subscribe((state) => {
    if (state.lastSubmittedCode === null) {
      isModified = false; // Never submitted
    } else {
      isModified = state.lastSubmittedCode !== currentCode;
    }
  })();

  return isModified;
}
