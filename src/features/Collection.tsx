import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cards } from '../data/cards';
import { collectionState, recordCollection } from '../services/collection';
import { getHistory } from '../services/history';
import { TarotCard } from '../components/cards/TarotCard';
import { useSettings } from '../app/settings';
import { collectionCopy as copy } from '../i18n/collection';
import { th } from '../i18n/th';
import type { Topic } from '../data/types';
export default function Collection() {
  const { settings, update } = useSettings();
  const [state] = useState(() => {
    getHistory().forEach((entry) => recordCollection(entry.reading));
    return collectionState();
  });
  return (
    <div className="page">
      <div className="section-intro">
        <p className="eyebrow">THE DECK REMEMBERS</p>
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>
        <p>
          {copy.found}: {state.unlocked.size}/78 · {copy.readings}: {state.readings}
        </p>
      </div>
      <section className="reading-panel collection-stats">
        <p>
          {copy.most}: {state.most === null ? copy.empty : cards[state.most].name.th}
        </p>
        <p>
          {copy.reversed}: {Math.round(state.reversedRatio * 100)}%
        </p>
        <p>
          {copy.favorite}: {state.favorite ? th.topics[state.favorite as Topic].name : copy.empty}
        </p>
      </section>
      <section className="reading-panel">
        <h2>{copy.backs}</h2>
        <div className="chips">
          {state.backs.map((back) => (
            <button
              className="chip"
              key={back.id}
              disabled={!back.unlocked}
              aria-pressed={(settings.cardBack || 'classic') === back.id}
              onClick={() => update('cardBack', back.id)}
            >
              {back.name}
              {!back.unlocked ? ` · ${copy.backLocked}` : ''}
            </button>
          ))}
        </div>
      </section>
      <div className="album-grid">
        {cards.map((card, index) =>
          state.unlocked.has(index) ? (
            <Link className="album-slot" key={card.id} to={`/cards/${card.id}`}>
              <TarotCard card={card} foil={state.foils.has(index)} />
              <p>{card.name.th}</p>
            </Link>
          ) : (
            <div className="album-slot locked" key={card.id}>
              <div className="locked-card" role="img" aria-label={`${copy.locked} ${index + 1}`}>
                <span aria-hidden="true">✧</span>
              </div>
              <p>— {String(index + 1).padStart(2, '0')} —</p>
            </div>
          ),
        )}
      </div>
      <section className="achievement-section">
        <h2>
          {copy.achievements} · {state.achievements.filter((a) => a.unlocked).length}/
          {state.achievements.length}
        </h2>
        <div className="achievement-grid">
          {state.achievements.map((a) => (
            <article
              key={a.id}
              className={`reading-panel achievement ${a.unlocked ? 'earned' : ''}`}
            >
              <p>
                {a.unlocked ? '✦' : '◇'} {a.name}
              </p>
              <small>{a.description}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
