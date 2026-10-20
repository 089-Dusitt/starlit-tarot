import { useEffect, useState } from 'react';
import { getForecast, wmo, umbrella, type Forecast, type Place } from '../../services/weather';
import { th, decor } from '../../i18n/th';
import { Icon } from '../Icon';
export function WeatherPanel({
  place,
  count = 3,
  manual = false,
}: {
  place: Place;
  count?: number;
  manual?: boolean;
}) {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>(manual ? 'idle' : 'loading');
  const [request, setRequest] = useState(manual ? 0 : 1);
  useEffect(() => {
    if (!request) return;
    let alive = true;
    setStatus('loading');
    getForecast(place, request > 1)
      .then((value) => {
        if (alive) {
          setForecast(value);
          setStatus('idle');
        }
      })
      .catch(() => {
        if (alive) setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [place, request]);
  return (
    <section className="weather-panel" aria-label={th.weather.title}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{decor.weather}</p>
          <h2>{th.weather.title}</h2>
        </div>
        <span className="small muted">{place.name}</span>
      </div>
      {status === 'loading' && (
        <p className="small muted" role="status">
          {th.common.loading}
        </p>
      )}
      {status === 'error' && (
        <div className="notice" role="status">
          <Icon name="cloud" />
          <p>{th.weather.offline}</p>
        </div>
      )}
      {forecast && (
        <>
          <div className="forecast-days">
            {forecast.days.slice(0, count).map((day, index) => {
              const info = wmo(day.code);
              return (
                <article key={day.date}>
                  <p className="forecast-date">
                    {[th.weather.today, th.weather.tomorrow, th.weather.after][index]} ·{' '}
                    {new Date(`${day.date}T12:00:00`).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                  <Icon name={info.icon} size={30} />
                  <h3>{info.label}</h3>
                  <p className="temperature">
                    {day.min ?? '—'} – {day.max ?? '—'} °C
                  </p>
                  <p>
                    {th.weather.rain} {day.probability === null ? '—' : `${day.probability}%`}
                  </p>
                  <p>
                    {th.weather.precip} {day.precipitation ?? '—'} {th.weather.mm}
                  </p>
                  <span className="umbrella-tip">{umbrella(day.probability)}</span>
                </article>
              );
            })}
          </div>
          <p className="small muted">
            {th.weather.updated}{' '}
            {new Date(forecast.updated).toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            · {th.weather.timezoneNote}
          </p>
        </>
      )}
      {status !== 'loading' && (
        <button className="button outline" onClick={() => setRequest((n) => n + 1)}>
          <Icon name="refresh" size={17} />
          {status === 'error' ? th.common.retry : th.weather.forecast}
        </button>
      )}
      <p className="weather-note">{th.weather.note}</p>
      <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="weather-credit">
        {th.weather.credit}
      </a>
    </section>
  );
}
