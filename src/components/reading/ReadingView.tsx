import { useState, type ReactNode, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { compose } from '../../engine/compose';
import type { Reading } from '../../data/types';
import { getSpread } from '../../data/spreads';
import { th, engineCopy, decor, styleCopy } from '../../i18n/th';
import { ritualCopy } from '../../i18n/ritual';
import { foilFace } from '../../services/collection';
import { TarotCard } from '../cards/TarotCard';
import { Icon } from '../Icon';
import { Pendulum } from './Pendulum';
import { StylePicker } from '../StylePicker';
import { readingStyle, personas } from '../../data/personas';
import type { ReadingContext } from '../../features/flow/state';
import { CheckInControls } from './CheckInControls';
export function ReadingView({
  reading: initialReading,
  context,
  shared = false,
  onNew,
  actions,
  weather,
  feature,
}: {
  reading: Reading;
  context?: ReadingContext;
  shared?: boolean;
  onNew?: () => void;
  actions?: (reading: Reading) => ReactNode;
  weather?: ReactNode;
  feature?: (reading: Reading) => ReactNode;
}) {
  const [style, setStyle] = useState(() => readingStyle(initialReading));
  const [editing, setEditing] = useState(false);
  const reading: Reading = { ...initialReading, version: 2, ...style };
  const result = compose(reading);
  const spread = getSpread(reading.spread)!;
  const situationIndex = spread.situation ? th.situations.indexOf(spread.situation) : -1;
  return (
    <div
      className={`reading-view ${reading.topic} persona-${style.persona} spice-${style.spice}`}
      style={{ '--persona-accent': personas[style.persona].accent } as CSSProperties}
    >
      <div className="reading-heading center">
        <p className="eyebrow">{shared ? th.reading.shared : th.reading.eyebrow}</p>
        <h1>{result.headline}</h1>
        <p className="reading-meta">
          {personas[style.persona].name} · {styleCopy.spice[style.spice]} <span>✦</span>{' '}
          {th.topics[reading.topic].name} <span>✦</span> {spread.name.th} <span>✦</span>{' '}
          {new Date(`${reading.date}T12:00:00`).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>
      <Pendulum step={result.meter.step} persona={style.persona} />
      <div className="restyle-controls center">
        <button
          className="text-button"
          aria-expanded={editing}
          onClick={() => setEditing(!editing)}
        >
          {styleCopy.restyle}
        </button>
        {editing && <StylePicker value={style} onChange={setStyle} />}
      </div>
      {context?.question && (
        <div className="question-note">
          <span>{th.reading.question}</span>
          <p>{context.question}</p>
        </div>
      )}
      {feature?.(reading)}
      {style.spice >= 2 && (
        <section className="reading-panel hard-truth">
          <p className="eyebrow">{ritualCopy.hardTruth}</p>
          <h2>{result.hardTruth}</h2>
        </section>
      )}
      <div className={`reading-spread count-${reading.cards.length} layout-${spread.id}`}>
        {result.slots.map((slot, i) => (
          <div
            className="spread-slot"
            key={slot.position.id}
            style={
              spread.id === 'celtic'
                ? { gridColumn: slot.position.layout.x + 1, gridRow: slot.position.layout.y + 1 }
                : undefined
            }
          >
            <p className="slot-label">{slot.position.label}</p>
            <TarotCard card={slot.card} reversed={slot.reversed} foil={foilFace(reading, i)} />
          </div>
        ))}
      </div>
      {reading.topic === 'weather' && (
        <div className="notice">
          <Icon name="cloud" />
          <p>{th.weather.note}</p>
        </div>
      )}
      {weather}
      <section className="reading-panel overview">
        <p className="eyebrow">{decor.story}</p>
        <h2>{th.reading.overview}</h2>
        {situationIndex >= 0 && (
          <p className="situation-frame">{engineCopy.situations[situationIndex]}</p>
        )}
        <p>{result.overview}</p>
      </section>
      <div className="meaning-list">
        {result.slots.map((slot, i) => {
          const ominous =
            style.spice === 3 &&
            (slot.tone === -2 || (slot.card.number === 18 && slot.card.arcana === 'major'));
          const effect =
            slot.card.arcana === 'major' && slot.card.number === 16
              ? 'tower'
              : slot.card.arcana === 'major' && slot.card.number === 18
                ? 'moon'
                : 'shadow';
          return (
            <article
              className={`meaning-card ${ominous ? `ominous theatre-${effect}` : ''}`}
              key={slot.position.id}
            >
              <Link
                to={`/cards/${slot.card.id}`}
                className="meaning-art"
                aria-label={`${th.common.read} ${slot.card.name.th}`}
              >
                <TarotCard card={slot.card} reversed={slot.reversed} />
              </Link>
              <div>
                <p className="eyebrow">
                  {String(i + 1).padStart(2, '0')} · {slot.position.label}
                </p>
                <h2>
                  {slot.card.name.th}
                  {slot.reversed && <span className="inline-reversed">{th.common.reversed}</span>}
                </h2>
                <p className="english-name">{slot.card.name.en}</p>
                {slot.positionFrame && <p className="position-frame">{slot.positionFrame}</p>}
                {style.spice === 3 && <p className="card-bite">{slot.bite}</p>}
                <div className="keywords">
                  {slot.keywords.map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </div>
                {reading.topic === 'weather' && (
                  <h3 className="symbol-label">{th.weather.symbol}</h3>
                )}
                {style.spice === 3 && slot.voice !== slot.meaning && (
                  <p className="voice-line">{slot.voice}</p>
                )}
                <p>{slot.meaning}</p>
                {style.spice < 3 && slot.voice !== slot.meaning && (
                  <p className="voice-line">{slot.voice}</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {result.omens.length > 0 && (
        <section className="reading-panel omen-panel">
          <h2>{ritualCopy.omens}</h2>
          <ul>
            {result.omens.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      )}
      {style.spice === 1 && result.insights.length > 0 && (
        <section className="reading-panel">
          <h2>{th.reading.patterns}</h2>
          <ul className="insight-list">
            {result.insights.map((insight) => (
              <li key={insight}>
                <Icon name="star" size={16} />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="reading-panel tips-panel">
        <p className="eyebrow">{decor.steps}</p>
        <h2>{reading.topic === 'exam' ? th.reading.examTips : th.reading.tips}</h2>
        <ol>
          {result.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ol>
        {reading.topic === 'exam' && <p className="small muted">{th.reading.examNote}</p>}
        {reading.topic === 'love' && <p className="small muted">{th.reading.loveNote}</p>}
      </section>
      {style.spice === 3 && (
        <section className="reading-panel verdict-panel">
          <p className="eyebrow">{ritualCopy.verdict}</p>
          <h2>{result.verdict}</h2>
          <p>{result.cliffhanger}</p>
        </section>
      )}
      <p className="reading-closing center">{result.closing}</p>
      <p className="disclaimer reading-disclaimer">
        <Icon name="shield" />
        {th.disclaimer}
      </p>
      {actions?.(reading)}
      <CheckInControls reading={reading} place={context?.place} />
      <div className="reading-end">
        {onNew ? (
          <button className="button gold" onClick={onNew}>
            <Icon name="refresh" />
            {th.common.new}
          </button>
        ) : (
          <Link className="button gold" to={`/read/${reading.topic}`}>
            {th.common.new}
            <Icon name="arrow" />
          </Link>
        )}
      </div>
    </div>
  );
}
