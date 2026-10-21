import { Link, useParams, useSearchParams } from 'react-router-dom';
import { DailyFatePanel, dailyFeature } from '../components/reading/DailyFatePanel';
import { oracleAnswer } from '../services/oracle';
import { decodeReading } from '../engine/share-code';
import { th, decor } from '../i18n/th';
import { ReadingView } from '../components/reading/ReadingView';
import { ShareActions } from '../components/reading/ShareActions';
import { WeatherPanel } from '../components/weather/WeatherPanel';
import { defaultContext } from './flow/state';
export default function Shared() {
  const { code } = useParams();
  const [params] = useSearchParams();
  const reading = decodeReading(code || '');
  if (!reading)
    return (
      <div className="page narrow center">
        <p className="eyebrow">{decor.sharedError}</p>
        <h1>{th.common.error}</h1>
        <p>{th.reading.invalid}</p>
        <Link className="button gold" to="/">
          {th.common.home}
        </Link>
      </div>
    );
  return (
    <div className="page">
      <ReadingView
        key={code}
        reading={reading}
        shared
        feature={
          params.get('daily') === '1' && reading.topic === 'general' && reading.spread === 'one'
            ? (current) => <DailyFatePanel reading={current} />
            : params.get('oracle') === '1' &&
                reading.topic === 'general' &&
                reading.spread === 'one'
              ? (current) => (
                  <section className="reading-panel oracle-result">
                    <h2>{oracleAnswer(current).title}</h2>
                    <p>{oracleAnswer(current).body}</p>
                  </section>
                )
              : undefined
        }
        actions={(current) => (
          <ShareActions
            reading={current}
            daily={
              params.get('daily') === '1' && reading.topic === 'general' && reading.spread === 'one'
            }
            oracle={
              params.get('oracle') === '1' &&
              reading.topic === 'general' &&
              reading.spread === 'one'
            }
            feature={
              params.get('daily') === '1' && reading.topic === 'general' && reading.spread === 'one'
                ? dailyFeature(current)
                : params.get('oracle') === '1' &&
                    reading.topic === 'general' &&
                    reading.spread === 'one'
                  ? oracleAnswer(current)
                  : undefined
            }
          />
        )}
        weather={
          reading.topic === 'weather' ? (
            <WeatherPanel place={defaultContext.place} count={reading.cards.length} manual />
          ) : undefined
        }
      />
    </div>
  );
}
