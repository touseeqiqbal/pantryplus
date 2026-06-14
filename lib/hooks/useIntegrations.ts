'use client';

/**
 * useIntegrations (Module 8: External Integrations & Smart Services)
 *
 * Tracks which third-party services the user has connected and when each last
 * synced. Connection state is persisted to localStorage so it survives reloads
 * (the spec requires connect/disconnect to persist, not just alert()). For a
 * real production OAuth flow the tokens would live server-side; here we persist
 * the connection status and sync timestamps the UI needs.
 */

import { useCallback, useEffect, useState } from 'react';

export interface StoredIntegration {
  service: string;
  connected: boolean;
  connectedAt?: string;
  lastSync?: string;
}

const STORAGE_KEY = 'pantryplus.integrations';

function readStore(): Record<string, StoredIntegration> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(data: Record<string, StoredIntegration>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Record<string, StoredIntegration>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIntegrations(readStore());
    setLoaded(true);
  }, []);

  const persist = useCallback((next: Record<string, StoredIntegration>) => {
    writeStore(next);
    setIntegrations(next);
  }, []);

  const isConnected = useCallback(
    (service: string) => !!integrations[service]?.connected,
    [integrations]
  );

  const getIntegration = useCallback(
    (service: string): StoredIntegration =>
      integrations[service] || { service, connected: false },
    [integrations]
  );

  const connect = useCallback(
    (service: string) => {
      const now = new Date().toISOString();
      persist({
        ...integrations,
        [service]: { service, connected: true, connectedAt: now, lastSync: now },
      });
    },
    [integrations, persist]
  );

  const disconnect = useCallback(
    (service: string) => {
      persist({
        ...integrations,
        [service]: { service, connected: false },
      });
    },
    [integrations, persist]
  );

  const markSynced = useCallback(
    (service: string) => {
      const existing = integrations[service];
      if (!existing?.connected) return;
      persist({
        ...integrations,
        [service]: { ...existing, lastSync: new Date().toISOString() },
      });
    },
    [integrations, persist]
  );

  return {
    integrations,
    loaded,
    isConnected,
    getIntegration,
    connect,
    disconnect,
    markSynced,
  };
}
