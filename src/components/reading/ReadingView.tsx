import { useState, type ReactNode, type CSSProperties } from 'react';
import { Pendulum } from './Pendulum';
import { readingStyle, personas } from '../../data/personas';
import { StylePicker } from '../StylePicker';
import { styleCopy } from '../../i18n/th';
import { Link } from 'react-router-dom';
import { compose } from '../../engine/compose';
import type { Reading } from '../../data/types';
import { getSpread } from '../../data/spreads';
import { th, engineCopy, decor } from '../../i18n/th';
import { TarotCard } from '../cards/TarotCard';
import { Icon } from '../Icon';
import type { ReadingContext } from '../../features/flow/state';
export function ReadingView({
  reading: initialReading,
  context,
  shared = false,
  onNew,
  actions,
  weather,
}: {
  reading: Reading;
  context?: ReadingContext;
  shared?: boolean;
  onNew?: () => void;
  actions?: (reading: Reading) => ReactNode;
  weather?: ReactNode;
}) {
  const [style, setStyle] = useState(() => readingStyle(initialReading));
  const [editing, setEditing] = useState(false);
  const reading: Reading = { ...initialReading, version: 2, ...style };
  const result = compose(reading);
  const spread = getSpread(reading.spread)!;
  const situation = spread.situation;
  const situationIndex = situation ? th.situations.indexOf(situation) : -1;
  const tips = [...result.tips, ...engineCopy.tips].slice(0, 3);
  return (
    <div
      className={`reading-view ${reading.topic}`}
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
      <div className={`reading-spread count-${reading.cards.length}`}>
        {result.slots.map((slot) => (
          <div className="spread-slot" key={slot.position.id}>
            <p className="slot-label">{slot.position.label}</p>
            <TarotCard card={slot.card} reversed={slot.reversed} />
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
        {result.slots.map((slot, i) => (
          <article
            className={`meaning-card ${style.spice === 3 && (slot.card.tone[slot.reversed ? 'reversed' : 'upright'] === -2 || slot.card.id === 'major-18-moon') ? `ominous theatre-${slot.card.id === 'major-16-tower' ? 'tower' : slot.card.id === 'major-18-moon' ? 'moon' : 'shadow'}` : ''}`}
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
              <div className="keywords">
                {slot.keywords.map((keyword) => (
                  <span key={keyword}>{keyword}</span>
                ))}
              </div>
              {reading.topic === 'weather' && <h3 className="symbol-label">{th.weather.symbol}</h3>}
              <p>{slot.meaning}</p>
            </div>
          </article>
        ))}
      </div>
      {result.insights.length > 0 && (
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
          {tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ol>
        {reading.topic === 'exam' && <p className="small muted">{th.reading.examNote}</p>}
        {reading.topic === 'love' && <p className="small muted">{th.reading.loveNote}</p>}
      </section>
      {reading.topic === 'weather' && (
        <section className="sky-moods">
          <h2>{th.weather.symbol}</h2>
          <div>
            {result.slots.map((slot) => (
              <span key={slot.card.id}>
                <Icon
                  name={
                    slot.card.skyMood === 'sunny'
                      ? 'sun'
                      : slot.card.skyMood === 'clear-night'
                        ? 'moon'
                        : slot.card.skyMood === 'rainy'
                          ? 'rain'
                          : slot.card.skyMood === 'stormy'
                            ? 'storm'
                            : slot.card.skyMood === 'misty'
                              ? 'fog'
                              : slot.card.skyMood === 'windy'
                                ? 'wind'
                                : 'cloud'
                  }
                />
                {slot.position.label} · {slot.keywords[0]}
              </span>
            ))}
          </div>
          <p className="small muted">{th.weather.symbolNote}</p>
        </section>
      )}
      <p className="disclaimer reading-disclaimer">
        <Icon name="shield" />
        {th.disclaimer}
      </p>
      {actions?.(reading)}
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
