import type { Reading } from '../../data/types';
import { dailyFate, muItem } from '../../services/daily-fate';
import { readingStyle } from '../../data/personas';
import { playCopy } from '../../i18n/play';
export function dailyFeature(reading: Reading) {
  const fate = dailyFate(reading);
  return { title: playCopy[fate.kind], body: fate.line };
}
export function DailyFatePanel({
  reading,
  stats,
}: {
  reading: Reading;
  stats?: { streak: number; total: number };
}) {
  const fate = dailyFate(reading);
  const mu = muItem(reading);
  return (
    <section className={`reading-panel daily-fate ${fate.kind}`}>
      <p className="eyebrow">{playCopy[fate.kind]}</p>
      <h2>{fate.line}</h2>
      <p className="small muted">{playCopy.dailyBody}</p>
      {stats && (
        <p className="fate-streak">
          {stats.streak} {playCopy.streak} · {stats.total} {playCopy.total}
        </p>
      )}
      {readingStyle(reading).persona === 'mu' && (
        <div className="mu-item">
          <h3>{playCopy.mu}</h3>
          <p>
            {mu.color} · {mu.day} · {mu.direction}
          </p>
          <small>{playCopy.muNote}</small>
        </div>
      )}
    </section>
  );
}
