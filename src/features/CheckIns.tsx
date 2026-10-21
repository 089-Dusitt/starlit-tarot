import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  checkIns,
  answerCheckIn,
  localDate,
  saveWeatherComparison,
  wetCode,
} from '../services/checkins';
import { getPastWeather } from '../services/weather';
import { checkinCopy as copy } from '../i18n/checkins';
export default function CheckIns() {
  const [entries, setEntries] = useState(checkIns);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    async function compare() {
      setBusy(true);
      for (const e of checkIns()) {
        if (!active) break;
        if (e.due > localDate() || !e.weather || e.weather.actual !== undefined) continue;
        try {
          const wet = wetCode(await getPastWeather(e.weather.place, e.weather.date));
          if (active && wet !== null && !saveWeatherComparison(e.code, wet)) setError(copy.failed);
        } catch {
          /* Retry stays explicit when offline. */
        }
      }
      if (active) {
        setEntries(checkIns());
        setBusy(false);
      }
    }
    void compare();
    return () => {
      active = false;
    };
  }, [attempt]);
  const answered = entries.filter((e) => e.answer !== undefined);
  const score = answered.length
    ? Math.round((answered.reduce((n, e) => n + e.answer!, 0) / (answered.length * 2)) * 100)
    : null;
  return (
    <div className="page narrow">
      <h1>{copy.title}</h1>
      <p>{copy.intro}</p>
      <p>
        {copy.score}: {score === null ? '—' : `${score}%`} ({answered.length})
      </p>
      {!entries.length && <p>{copy.empty}</p>}
      {[...entries]
        .sort((a, b) => a.due.localeCompare(b.due))
        .map((e) => (
          <section className="reading-panel" key={e.code}>
            <p>
              {e.due} · {e.due > localDate() ? copy.pending : copy.vote}
            </p>
            <Link to={`/r/${e.code}`}>{copy.revisit}</Link>
            {e.answer !== undefined ? (
              <p>{copy.answers[e.answer]}</p>
            ) : (
              e.due <= localDate() && (
                <div className="button-row">
                  {([0, 1, 2] as const).map((a) => (
                    <button
                      className="button"
                      key={a}
                      onClick={() => {
                        if (!answerCheckIn(e.code, a)) setError(copy.failed);
                        setEntries(checkIns());
                      }}
                    >
                      {copy.answers[a]}
                    </button>
                  ))}
                </div>
              )
            )}
            {e.weather && (
              <>
                <p>{copy.weatherNote}</p>
                <p>
                  {e.weather.actual === undefined
                    ? copy.weatherUnknown
                    : e.weather.wet === e.weather.actual
                      ? copy.weatherMatch
                      : copy.weatherMiss}
                </p>
              </>
            )}
          </section>
        ))}
      <p role="status">{busy ? copy.weatherLoading : error}</p>
      {entries.some((e) => e.weather && e.weather.actual === undefined && e.due <= localDate()) && (
        <button className="button" disabled={busy} onClick={() => setAttempt((n) => n + 1)}>
          {copy.retry}
        </button>
      )}
    </div>
  );
}
