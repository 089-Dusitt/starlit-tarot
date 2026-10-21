import type { CSSProperties } from 'react';
import type { CardIdentity } from '../../data/types';
import { roman } from '../../data/cards/identities';
import { th } from '../../i18n/th';
import { CardArt } from './CardArt';
export function TarotCard({
  card,
  faceUp = true,
  reversed = false,
  onFlip,
  label,
  style,
  foil = false,
}: {
  card?: CardIdentity;
  faceUp?: boolean;
  reversed?: boolean;
  onFlip?: () => void;
  label?: string;
  style?: CSSProperties;
  foil?: boolean;
}) {
  const content = (
    <>
      <div className={`tarot-turn ${faceUp ? 'flipped' : ''}`}>
        <div className="tarot-face tarot-back" aria-hidden={faceUp}>
          <CardArt back />
        </div>
        <div className="tarot-face tarot-front" aria-hidden={!faceUp}>
          <CardArt card={card} reversed={reversed} />
          {card && (
            <>
              <span className="card-numeral">{roman(card.number)}</span>
              <div className="card-caption">
                <b>{card.name.th}</b>
                <small>{card.name.en}</small>
              </div>
            </>
          )}
        </div>
      </div>
      {reversed && faceUp && <span className="reversed-label">{th.common.reversed}</span>}
      {foil && faceUp && <span className="foil-badge">✦ ประกายพิเศษ</span>}
    </>
  );
  return onFlip ? (
    <button
      type="button"
      style={style}
      className={`tarot-card card-button ${foil && faceUp ? 'foil-card' : ''}`}
      onClick={onFlip}
      aria-label={
        label ||
        (!faceUp ? th.flow.tap : `${card?.name.th}${reversed ? `, ${th.common.reversed}` : ''}`)
      }
    >
      {content}
    </button>
  ) : (
    <div className={`tarot-card ${foil && faceUp ? 'foil-card' : ''}`} style={style}>
      {content}
    </div>
  );
}
