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
      </div>
    </section>
  );
}
