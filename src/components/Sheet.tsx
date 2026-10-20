import { useEffect, useRef, type ReactNode } from 'react';
import { th } from '../i18n/th';
import { Icon } from './Icon';
export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    try {
      if (dialog?.showModal) dialog.showModal();
      else dialog?.setAttribute('open', '');
    } catch {
      dialog?.setAttribute('open', '');
    }
    dialog?.querySelector<HTMLElement>('button')?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key === 'Tab' && dialog) {
        const controls = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button,a[href],input,textarea,select,[tabindex="0"]',
          ),
        );
        const first = controls[0],
          last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('keydown', close);
      dialog?.close?.();
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  return (
    <dialog
      className="sheet"
      ref={ref}
      aria-labelledby="sheet-title"
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="sheet-inner">
        <div className="section-heading">
          <h2 id="sheet-title">{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label={th.settings.close}>
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
