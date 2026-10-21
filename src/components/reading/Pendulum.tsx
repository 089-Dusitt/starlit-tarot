import { useId, type CSSProperties } from 'react';
import type { Persona } from '../../data/types';
import { meterLabels } from '../../data/voice-banks';
import { ritualCopy } from '../../i18n/ritual';
export function Pendulum({ step, persona }: { step: number; persona: Persona }) {
  const id = useId();
  const label = meterLabels[persona][step];
  return (
    <figure className="pendulum" style={{ '--settle': `${(2 - step) * 25}deg` } as CSSProperties}>
      <div
        role="meter"
        aria-labelledby={id}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={step}
        aria-valuetext={label}
      >
        <svg viewBox="0 0 300 200" aria-hidden="true">
          <path d="M35 150 Q150 230 265 150" fill="none" stroke="currentColor" strokeOpacity=".2" />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={45 + i * 52.5}
              cy={155 + Math.sin((i / 4) * Math.PI) * 29}
              r={i === step ? 5 : 2}
              fill="currentColor"
              opacity={i === step ? 1 : 0.4}
            />
          ))}
          <g className="pendulum-arm">
            <path d="M150 25V126" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="m150 121 12 25-12 18-12-18Z"
              fill="currentColor"
              fillOpacity=".35"
              stroke="currentColor"
            />
            <path d="m150 121 0 43" stroke="currentColor" strokeOpacity=".7" />
          </g>
          <circle cx="150" cy="25" r="5" fill="currentColor" />
          <path d="M126 16h48M117 8h66" stroke="currentColor" strokeOpacity=".35" />
        </svg>
      </div>
      <figcaption id={id}>
        <span>{ritualCopy.gauge}</span>
        <strong>{label}</strong>
        <small>{ritualCopy.gaugeNote}</small>
      </figcaption>
    </figure>
  );
}
