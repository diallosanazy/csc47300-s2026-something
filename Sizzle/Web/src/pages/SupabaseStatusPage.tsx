import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Status =
  | { state: 'loading' }
  | { state: 'ok'; anonKeyPrefix: string; projectRef?: string | null }
  | { state: 'error'; message: string };

function safeProjectRef(url: string) {
  // Supports: https://<ref>.supabase.co and https://<ref>.supabase.in
  try {
    const host = new URL(url).host;
    const ref = host.split('.')[0];
    return ref || null;
  } catch {
    return null;
  }
}

export function SupabaseStatusPage() {
  const [status, setStatus] = useState<Status>({ state: 'loading' });

  const anonKeyPrefix = useMemo(() => {
    const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '';
    return key ? `${key.slice(0, 6)}…${key.slice(-4)}` : '(missing)';
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Doesn't require any DB schema; this just proves the client can talk to Supabase.
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        if (cancelled) return;
        const url = String(import.meta.env.VITE_SUPABASE_URL ?? '');
        setStatus({ state: 'ok', anonKeyPrefix, projectRef: safeProjectRef(url) });
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (!cancelled) setStatus({ state: 'error', message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [anonKeyPrefix]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f6f1', color: '#1c1917', padding: 32 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Supabase</div>
        <div style={{ color: '#6b645b', lineHeight: 1.5 }}>
          This page is a quick wiring check. Once this is green, we can start reading/writing your actual tables.
        </div>

        <div style={{ border: '1px solid #e8e6e1', borderRadius: 14, background: '#fff', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontWeight: 700 }}>Client status</div>
              <div style={{ color: '#6b645b', fontSize: 13 }}>
                Project: {safeProjectRef(String(import.meta.env.VITE_SUPABASE_URL ?? '')) ?? '(unknown)'} · Key: {anonKeyPrefix}
              </div>
            </div>
            <div
              style={{
                padding: '6px 10px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                border: '1px solid #e8e6e1',
                background: status.state === 'ok' ? '#f0faf4' : status.state === 'error' ? '#fff5f5' : '#f0efec',
                color: status.state === 'ok' ? '#2d6a4f' : status.state === 'error' ? '#b42318' : '#6b645b',
              }}
            >
              {status.state === 'loading' ? 'Checking…' : status.state === 'ok' ? 'Connected' : 'Error'}
            </div>
          </div>

          {status.state === 'error' && (
            <div style={{ marginTop: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: 12, color: '#7a271a' }}>
              {status.message}
            </div>
          )}

          {status.state === 'ok' && (
            <div style={{ marginTop: 12, color: '#6b645b', fontSize: 13 }}>
              Supabase responded successfully. Next step: pick a table (e.g. <span style={{ fontFamily: 'ui-monospace' }}>vendors</span>, <span style={{ fontFamily: 'ui-monospace' }}>menu_items</span>) and wire real reads/writes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

