const STORAGE_KEY = "firmus.assistedChargeSuggestionState";

type AssistedChargeSuggestionState = {
  dismissedIds: string[];
  acceptedIds: string[];
};

const EMPTY_STATE: AssistedChargeSuggestionState = {
  dismissedIds: [],
  acceptedIds: [],
};

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function readAssistedChargeSuggestionState(): AssistedChargeSuggestionState {
  if (typeof window === "undefined") {
    return EMPTY_STATE;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return EMPTY_STATE;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      dismissedIds: normalizeStringArray(parsed.dismissedIds),
      acceptedIds: normalizeStringArray(parsed.acceptedIds),
    };
  } catch {
    return EMPTY_STATE;
  }
}

function saveAssistedChargeSuggestionState(state: AssistedChargeSuggestionState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function markAssistedChargeSuggestionDismissed(suggestionId: string): void {
  const state = readAssistedChargeSuggestionState();
  const next = new Set(state.dismissedIds);
  next.add(suggestionId);

  saveAssistedChargeSuggestionState({
    ...state,
    dismissedIds: Array.from(next),
  });
}

export function markAssistedChargeSuggestionAccepted(suggestionId: string): void {
  const state = readAssistedChargeSuggestionState();
  const next = new Set(state.acceptedIds);
  next.add(suggestionId);

  saveAssistedChargeSuggestionState({
    ...state,
    acceptedIds: Array.from(next),
  });
}
