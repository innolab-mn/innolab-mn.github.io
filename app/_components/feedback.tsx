"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';

export function Notice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'success' | 'error' }) {
  return <div className={`notice notice-${tone}`} role={tone === 'error' ? 'alert' : 'status'}><span className="notice-symbol" aria-hidden="true">{tone === 'error' ? '!' : tone === 'success' ? '✓' : 'i'}</span><div>{children}</div></div>;
}

export function CopyValue({ value, label, locale }: { value: string; label: string; locale: Locale }) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');
  const text = useRef<HTMLElement>(null);
  const en = locale === 'en';
  useEffect(() => { if (state === 'idle') return; const timer = setTimeout(() => setState('idle'), 5000); return () => clearTimeout(timer); }, [state]);
  async function copy() {
    try { await navigator.clipboard.writeText(value); setState('copied'); }
    catch {
      const selection = window.getSelection(); const range = document.createRange();
      if (text.current && selection) { range.selectNodeContents(text.current); selection.removeAllRanges(); selection.addRange(range); }
      setState('error');
    }
  }
  return <div className="copy-value"><span className="copy-label">{label}</span><div className="copy-row"><code ref={text}>{value}</code><button type="button" className="copy-button" onClick={() => void copy()} aria-label={`${en ? 'Copy' : 'Хуулах'}: ${label}`}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>{state === 'copied' ? (en ? 'Copied' : 'Хууллаа') : (en ? 'Copy' : 'Хуулах')}</button></div><span className="copy-feedback" role="status">{state === 'copied' ? (en ? 'Copied to clipboard.' : 'Амжилттай хууллаа.') : state === 'error' ? (en ? 'Copy unavailable. The text is selected; copy it manually.' : 'Автоматаар хуулж чадсангүй. Сонгосон текстийг гараар хуулна уу.') : ''}</span></div>;
}

export type Confirmation = { title: string; description: string; detail?: string; action: string; danger?: boolean };
export function ConfirmDialog({ confirmation, onCancel, onConfirm, locale }: { confirmation: Confirmation | null; onCancel: () => void; onConfirm: () => void; locale: Locale }) {
  const dialog = useRef<HTMLDialogElement>(null); const cancel = useRef<HTMLButtonElement>(null); const id = useId();
  useEffect(() => {
    if (!confirmation) return;
    const previous = document.activeElement as HTMLElement | null;
    const el = dialog.current!; el.showModal(); cancel.current?.focus();
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { el.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, [confirmation]);
  return <dialog ref={dialog} className="confirm-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} onCancel={e => { e.preventDefault(); onCancel(); }}>
    {confirmation && <><div className={`dialog-mark ${confirmation.danger ? 'is-danger' : ''}`} aria-hidden="true">{confirmation.danger ? '!' : '↗'}</div><p className="eyebrow">INNOLAB / {locale === 'en' ? 'CONFIRM' : 'БАТАЛГААЖУУЛАХ'}</p><h2 id={`${id}-title`}>{confirmation.title}</h2><p id={`${id}-description`}>{confirmation.description}</p>{confirmation.detail && <div className="dialog-detail">{confirmation.detail}</div>}<div className="dialog-actions"><button ref={cancel} type="button" className="button button-outline" onClick={onCancel}>{locale === 'en' ? 'Go back' : 'Буцах'}</button><button type="button" className={`button ${confirmation.danger ? 'button-danger' : ''}`} onClick={onConfirm}>{confirmation.action}</button></div></>}
  </dialog>;
}
