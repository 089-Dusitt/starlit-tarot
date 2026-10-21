import { useEffect, useState } from 'react';
import { useSettings } from '../app/settings';
import { StylePicker } from '../components/StylePicker';
import { TarotCard } from '../components/cards/TarotCard';
import { ShareActions } from '../components/reading/ShareActions';
import { cards } from '../data/cards';
import { th } from '../i18n/th';
import { foilFace } from '../services/collection';
import {
  askOracle,
  oracleAnswer,
  oracleCopy,
  oracleRemaining,
  type OracleResult,
} from '../services/oracle';
export default function Oracle() {
  const { settings } = useSettings();
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<OracleResult | null>(null);
  const [seconds, setSeconds] = useState(() => oracleRemaining());
  useEffect(() => {
    const timer = setInterval(() => setSeconds(oracleRemaining()), 1000);
    return () => clearInterval(timer);
  }, []);
  const reading = result?.kind === 'reading' ? result.reading : null;
  const answer = reading ? oracleAnswer(reading) : null;
  return (
    <div className="page narrow">
      <div className="section-intro">
        <p className="eyebrow">ORACLE · YES / NO</p>
        <h1>{oracleCopy.title}</h1>
        <p>{oracleCopy.hint}</p>
      </div>
      <StylePicker />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const next = askOracle(question, settings.persona, settings.spice, settings.reversed);
          setResult(next);
          if (next.kind === 'crisis') setQuestion('');
          setSeconds(oracleRemaining());
        }}
      >
        <label className="field-label" htmlFor="oracle-question">
          {oracleCopy.question}
        </label>
        <textarea
          id="oracle-question"
          maxLength={140}
          required
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button className="button gold" disabled={seconds > 0}>
          {oracleCopy.ask}
        </button>
      </form>
      {seconds > 0 && (
        <p className="notice">
          {oracleCopy.cooldown[settings.persona]} · {seconds} วินาที
        </p>
      )}
      {result?.kind === 'refusal' && (
        <p role="status" className="notice">
          {oracleCopy.refusal}
        </p>
      )}
      {result?.kind === 'sensitive' && (
        <p role="status" className="notice">
          {oracleCopy.sensitive}
        </p>
      )}
      {result?.kind === 'crisis' && (
        <section className="crisis-panel" role="alert">
          <h2>{th.flow.crisisTitle}</h2>
          <p>{th.flow.crisisBody}</p>
          <a className="button gold" href="tel:1323">
            {th.flow.crisisHelp}
          </a>
          <a className="button outline" href="tel:1669">
            {th.flow.crisisEmergency}
          </a>
        </section>
      )}
      {reading && answer && (
        <section className="oracle-result center" aria-live="polite">
          <h2>{answer.title}</h2>
          <div className="daily-card">
            <TarotCard
              card={cards[reading.cards[0].index]}
              reversed={reading.cards[0].reversed}
              foil={foilFace(reading, 0)}
            />
          </div>
          <p>{answer.body}</p>
          <ShareActions reading={reading} feature={answer} oracle />
        </section>
      )}
      <p className="disclaimer">{th.disclaimer}</p>
    </div>
  );
}
