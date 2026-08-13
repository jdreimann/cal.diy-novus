interface PendoInstance {
  initialize(options: { visitor: { id: string | number } }): void;
  identify(options: {
    visitor: Record<string, unknown>;
    account?: Record<string, unknown>;
  }): void;
  clearSession(): void;
  track(eventName: string, properties?: Record<string, unknown>): void;
  updateOptions(options: Record<string, unknown>): void;
  pageLoad(): void;
}

declare var pendo: PendoInstance;
