import { Link, useParams } from 'react-router-dom';
import { decodeReading } from '../engine/share-code';
import { th, decor } from '../i18n/th';
import { ReadingView } from '../components/reading/ReadingView';
import { ShareActions } from '../components/reading/ShareActions';
import { WeatherPanel } from '../components/weather/WeatherPanel';
import { defaultContext } from './flow/state';
export default function Shared() {
  const { code } = useParams();
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
        reading={reading}
        shared
        actions={<ShareActions reading={reading} />}
        weather={
          reading.topic === 'weather' ? (
            <WeatherPanel place={defaultContext.place} count={reading.cards.length} manual />
          ) : undefined
        }
      />
    </div>
  );
}
