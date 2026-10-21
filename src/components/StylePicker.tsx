import { useState } from 'react';
import { useSettings } from '../app/settings';
import { personas, personaIds } from '../data/personas';
import type { Persona, Spice } from '../data/types';
import { randomIndex } from '../engine/rng';
import { styleCopy } from '../i18n/th';
import { Sheet } from './Sheet';
type Style = { persona: Persona; spice: Spice };
export function Chilli({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="21"
      height="21"
      aria-hidden="true"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M17 7c2 5-3 12-13 13 5-3 4-8 7-11 2-2 4-2 6-2Z" />
      <path d="M15 7c0-3 2-5 5-4M12 9l5 2" />
    </svg>
  );
}
export function StylePicker({
  value,
  onChange,
}: {
  value?: Style;
  onChange?: (value: Style) => void;
}) {
  const { settings, update } = useSettings();
  const current = value || settings;
  const [confirm, setConfirm] = useState(false);
  function choose(next: Style) {
    if (onChange) onChange(next);
    else {
      update('persona', next.persona);
      update('spice', next.spice);
    }
  }
  function heat(spice: Spice) {
    if (spice === 3 && !settings.spiceConfirmed) setConfirm(true);
    else choose({ ...current, spice });
  }
  return (
    <div className="style-picker">
      <fieldset>
        <legend>{styleCopy.persona}</legend>
        <div className="persona-grid">
          {personaIds.map((id) => (
            <button
              type="button"
              className={`persona-choice ${current.persona === id ? 'active' : ''}`}
              aria-pressed={current.persona === id}
              key={id}
              onClick={() => choose({ ...current, persona: id })}
            >
              <span className="persona-symbol" aria-hidden="true">
                {personas[id].symbol}
              </span>
              <b>{personas[id].name}</b>
              <small>{personas[id].hint}</small>
            </button>
          ))}
        </div>
        <button
          className="text-button"
          type="button"
          onClick={() =>
            choose({ ...current, persona: personaIds[randomIndex(personaIds.length)] })
          }
        >
          {styleCopy.random}
        </button>
      </fieldset>
      <fieldset>
        <legend>{styleCopy.heat}</legend>
        <div className="spice-options">
          {([1, 2, 3] as const).map((n) => (
            <button
              type="button"
              key={n}
              aria-pressed={current.spice === n}
              className={`spice-choice ${current.spice === n ? 'active' : ''}`}
              onClick={() => heat(n)}
            >
              <span>
                {[1, 2, 3].map((i) => (
                  <Chilli key={i} active={i <= n} />
                ))}
              </span>
              {styleCopy.spice[n]}
            </button>
          ))}
        </div>
      </fieldset>
      {confirm && (
        <Sheet title={styleCopy.confirm} onClose={() => setConfirm(false)}>
          <p>{styleCopy.confirmBody}</p>
          <div className="context-actions">
            <button
              className="button gold"
              type="button"
              onClick={() => {
                update('spiceConfirmed', true);
                choose({ ...current, spice: 3 });
                setConfirm(false);
              }}
            >
              {styleCopy.accept}
            </button>
            <button className="button outline" type="button" onClick={() => setConfirm(false)}>
              {styleCopy.decline}
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}
