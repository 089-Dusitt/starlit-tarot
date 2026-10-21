import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSettings } from '../app/settings';
import { TarotCard } from '../components/cards/TarotCard';
import { cards } from '../data/cards';
import type { Reading } from '../data/types';
import {
  decodeDuel,
  newDuelReading,
  compareDuel,
  duelUrl,
  validDuelReading,
} from '../services/duel';
import { readStored, writeGuarded } from '../services/storage';
import { encodeReading } from '../engine/share-code';
import { copyText } from '../services/share';
import { duelCopy } from '../i18n/duel';
import { th } from '../i18n/th';
export default function Duel() {
  const { settings } = useSettings();
  const [params, setParams] = useSearchParams();
  const incoming = decodeDuel(params);
  const [name, setName] = useState('');
  const [friendName, setFriendName] = useState('');
  const [status, setStatus] = useState('');
  const [fallback, setFallback] = useState('');
  const challenger = incoming?.challenger;
  const friend = incoming?.friend;
  async function copy() {
    if (!challenger) return;
    const url = duelUrl(challenger, friend || undefined, incoming.name, incoming.friendName);
    if (await copyText(url)) setStatus(duelCopy.copied);
    else setFallback(url);
  }
  function change(c: Reading, r?: Reading) {
    setParams(new URL(duelUrl(c, r, incoming?.name || name, friendName)).searchParams);
  }
  const comparison = challenger && friend ? compareDuel(challenger, friend) : null;
  return (
    <div className="page">
      <div className="section-intro">
        <p className="eyebrow">CARD DUEL</p>
        <h1>{duelCopy.title}</h1>
        <p>{duelCopy.body}</p>
      </div>
      {params.has('c') && !incoming ? (
        <div className="notice">
          <p>{duelCopy.invalid}</p>
          <Link className="button" to="/duel">
            {th.common.new}
          </Link>
        </div>
      ) : !challenger ? (
        <form
          className="narrow"
          onSubmit={(e) => {
            e.preventDefault();
            change(newDuelReading(settings, settings.reversed));
          }}
        >
          <label htmlFor="duel-name" className="field-label">
            {duelCopy.name}
          </label>
          <p className="small muted">{duelCopy.nameNote}</p>
          <input
            id="duel-name"
            maxLength={24}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="button gold">{duelCopy.start}</button>
        </form>
      ) : (
        <>
          {!friend && (
            <div className="center">
              <button className="button outline" onClick={() => void copy()}>
                {duelCopy.copy}
              </button>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const key = 'duel:' + encodeReading(challenger);
                  const saved = readStored<Reading | null>(key, null, validDuelReading);
                  const next = saved || newDuelReading(settings, settings.reversed);
                  if (!saved && !writeGuarded(key, next, validDuelReading))
                    setStatus(th.reading.storageWarning);
                  change(challenger, next);
                }}
              >
                <label className="field-label" htmlFor="duel-friend">
                  {duelCopy.name}
                </label>
                <input
                  id="duel-friend"
                  maxLength={24}
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                />
                <button className="button gold">{duelCopy.accept}</button>
              </form>
            </div>
          )}
          {comparison && (
            <section className="reading-panel center">
              <h2>
                {comparison.winner === 'tie'
                  ? duelCopy.tie
                  : `${comparison.winner === 'challenger' ? incoming.name || duelCopy.challenger : incoming.friendName || duelCopy.friend} ${duelCopy.win}`}
              </h2>
              <p>{comparison.line}</p>
              <p>{comparison.compatibility}</p>
              <p className="small muted">{duelCopy.note}</p>
              <button className="button gold" onClick={() => void copy()}>
                {duelCopy.copyResult}
              </button>
            </section>
          )}
          <div className="duel-sides">
            {[
              {
                reading: challenger,
                name: incoming.name || duelCopy.challenger,
                score: comparison?.left,
              },
              ...(friend
                ? [
                    {
                      reading: friend,
                      name: incoming.friendName || duelCopy.friend,
                      score: comparison?.right,
                    },
                  ]
                : []),
            ].map((side, i) => (
              <section className="reading-panel center" key={i}>
                <h2>{side.name}</h2>
                {side.score !== undefined && (
                  <p>
                    {duelCopy.score}: <strong>{side.score}</strong>
                  </p>
                )}
                <div className="duel-cards">
                  {side.reading.cards.map((c) => (
                    <TarotCard key={c.index} card={cards[c.index]} reversed={c.reversed} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
      <p role="status">{status}</p>
      {fallback && (
        <textarea
          readOnly
          value={fallback}
          aria-label={duelCopy.copyResult}
          onFocus={(e) => e.currentTarget.select()}
        />
      )}
      <p className="disclaimer">{th.disclaimer}</p>
    </div>
  );
}
