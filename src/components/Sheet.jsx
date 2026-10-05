import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from './icons';
import { useStore } from '../store';

// Bottom sheet rendered into the phone frame (#overlay-root), above the scrolling screen.
export default function Sheet({ onClose, label, children, footer, flush = false }) {
  const { t } = useStore();
  const panel = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab') return;
      const controls = [...panel.current.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]')]
        .filter((element) => element.getClientRects().length > 0);
      const first = controls[0], last = controls[controls.length - 1];
      if (!first) { e.preventDefault(); return; }
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.activeElement;
    panel.current?.focus();
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [onClose]);

  const root = document.getElementById('overlay-root');
  if (!root) return null;
  // On the full-screen site (overlay-root has data-site) it becomes a centred dialog from the sm breakpoint up.
  const site = root.dataset.site !== undefined;
  return createPortal(
    <div className={'absolute inset-0 z-40 flex flex-col justify-end ' + (site ? 'sm:items-center sm:justify-center sm:p-6' : '')}>
      <div className="backdrop-in absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={'sheet-in relative flex max-h-[92%] flex-col overflow-hidden rounded-t-[28px] bg-cream outline-none ' + (site ? 'sm:max-h-[88vh] sm:w-full sm:max-w-lg sm:rounded-[28px] sm:shadow-2xl' : '')}
      >
        <button onClick={onClose} aria-label={t('Close', 'إغلاق')} className="absolute end-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-cream/90 text-ink shadow-md active:scale-90">
          <X size={18} weight="bold" />
        </button>
        {!flush && <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-ink/15" aria-hidden="true" />}
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="shrink-0 border-t border-ink/5 bg-cream px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">{footer}</div>}
      </div>
    </div>,
    root,
  );
}
