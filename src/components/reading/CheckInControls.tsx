import { useState } from 'react';
import type { Reading } from '../../data/types';
import { cards } from '../../data/cards';
import type { Place } from '../../services/weather';
import { getForecast } from '../../services/weather';
import { scheduleCheckIn } from '../../services/checkins';
import { checkinCopy as copy } from '../../i18n/checkins';
export function CheckInControls({ reading, place }: { reading: Reading; place?: Place }) {
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function schedule(days: 1 | 3 | 7) {
    setBusy(true);
    let weather;
    const mood = cards[reading.cards[0].index].skyMood;
    const wet = ['rainy', 'stormy'].includes(mood)
      ? true
      : ['sunny', 'partly-cloudy', 'cloudy', 'clear-night'].includes(mood)
        ? false
        : null;
    if (consent && place && wet !== null) {
      try {
        const forecast = await getForecast(place);
        weather = { place, date: forecast.days[0].date, wet };
      } catch {
        /* A check-in remains available without weather. */
      }
    }
    setMessage(scheduleCheckIn(reading, days, weather) ? copy.saved : copy.failed);
    setBusy(false);
  }
  return (
    <section className="reading-panel">
      <h2>{copy.schedule}</h2>
      <p>{copy.privacy}</p>
      {reading.topic === 'weather' && place && (
        <label className="setting-row">
          <span>{copy.weatherConsent}</span>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        </label>
      )}
      <div className="button-row">
        {([1, 3, 7] as const).map((days) => (
          <button key={days} disabled={busy} className="button" onClick={() => void schedule(days)}>
            {days} วัน
          </button>
        ))}
      </div>
      <p role="status">{message}</p>
    </section>
  );
}
