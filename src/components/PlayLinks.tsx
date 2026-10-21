import { Link } from 'react-router-dom';
import { playCopy } from '../i18n/play';
export function PlayLinks() {
  return (
    <section className="container play-links">
      <h2>{playCopy.games}</h2>
      <div className="play-grid">
        <Link className="reading-panel" to="/oracle">
          <h3>{playCopy.oracle}</h3>
          <p>{playCopy.oracleHint}</p>
        </Link>
        <Link className="reading-panel" to="/duel">
          <h3>{playCopy.duel}</h3>
          <p>{playCopy.duelHint}</p>
        </Link>
        <Link className="reading-panel" to="/collection">
          <h3>{playCopy.collection}</h3>
          <p>{playCopy.collectionHint}</p>
        </Link>
      </div>
    </section>
  );
}
