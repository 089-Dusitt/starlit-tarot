import { PlacePicker } from '../../components/weather/PlacePicker';
import { WeatherPanel } from '../../components/weather/WeatherPanel';
import { ShareActions } from '../../components/reading/ShareActions';
import { saveHistory } from '../../services/history';
import { needsSupport } from '../../services/crisis';
import { examSeed } from '../../engine/compose';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { m } from 'framer-motion';
import { topics, isTopic } from '../../data/topics';
import { spreadsForTopic, getSpread, adaptLoveSpread } from '../../data/spreads';
import type { Topic, Spread } from '../../data/types';
import { cards } from '../../data/cards';
import { th, decor } from '../../i18n/th';
import { useSettings } from '../../app/settings';
import { readStored, writeStored } from '../../services/storage';
import { draw } from '../../engine/draw';
import { randomIndex } from '../../engine/rng';
import { TarotCard } from '../../components/cards/TarotCard';
import { CardArt } from '../../components/cards/CardArt';
import { Icon } from '../../components/Icon';
import { StylePicker } from '../../components/StylePicker';
import { ReadingView } from '../../components/reading/ReadingView';
import {
  createFlow,
  validFlow,
  flowReading,
  type FlowState,
  type ReadingContext,
  type Stage,
} from './state';
export function MiniSpread({ spread }: { spread: Spread }) {
  return (
    <span className="mini-spread" aria-hidden="true">
      {spread.positions.map((p) => (
        <i key={p.id} style={{ gridColumn: p.layout.x + 1, gridRow: p.layout.y + 1 }} />
      ))}
    </span>
  );
}
export default function Flow() {
  const { topic, spread } = useParams();
  if (!isTopic(topic))
    return (
      <div className="page center">
        <h1>{th.common.error}</h1>
        <Link className="button" to="/">
          {th.common.home}
        </Link>
      </div>
    );
  if (!spread)
    return (
      <div className={`page ${topic}`}>
        <Link className="text-link" to="/#topics">
          <Icon name="back" />
          {th.common.back}
        </Link>
        <div className="section-intro flow-intro">
          <span className="topic-icon">
            <Icon name={topics[topic].icon} size={28} />
          </span>
          <p className="eyebrow">{topics[topic].en}</p>
          <h1>{th.flow.choose}</h1>
          <p>{th.flow.spreadSub}</p>
        </div>
        <div className="spread-options">
          {spreadsForTopic(topic).map((s) => (
            <Link
              to={`/read/${topic}/${s.id}`}
              className="spread-option"
              key={s.id}
              onClick={() => writeStored(`flow:${topic}:${s.id}`, null, true)}
            >
              <MiniSpread spread={s} />
              <p className="eyebrow">{s.name.en}</p>
              <h2>{s.name.th}</h2>
              <p className="small muted">
                {s.positions.length} {th.flow.cards} · {s.minutes} {th.flow.minutes}
              </p>
              <p className="position-preview">{s.positions.map((p) => p.label).join(' / ')}</p>
              <span className="text-link">
                {th.common.next}
                <Icon name="arrow" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  const s = getSpread(spread);
  if (!s || !s.topics.includes(topic))
    return (
      <div className="page center">
        <h1>{th.common.error}</h1>
        <Link className="button" to={`/read/${topic}`}>
          {th.common.back}
        </Link>
      </div>
    );
  return <FlowSession key={`${topic}:${spread}`} topic={topic} initialSpread={spread} />;
}
function FlowSession({ topic, initialSpread }: { topic: Topic; initialSpread: string }) {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const key = `flow:${topic}:${initialSpread}`;
  const [state, setState] = useState<FlowState>(() => {
    const saved = readStored<FlowState | null>(key, null, validFlow, true);
    return saved?.topic === topic &&
      (saved.spread === initialSpread || getSpread(saved.spread)?.baseId === initialSpread)
      ? saved
      : createFlow(topic, initialSpread, settings.reversed, settings.persona, settings.spice);
  });
  const [announcement, setAnnouncement] = useState('');
  const [storageWarning, setStorageWarning] = useState(false);
  const [active, setActive] = useState(0);
  const fanRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [redraws, setRedraws] = useState(() =>
    readStored(
      `redraws:${topic}`,
      0,
      (v): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < 10000,
      true,
    ),
  );
  const spread = getSpread(state.spread)!;
  const count = spread.positions.length;
  useLayoutEffect(() => {
    if (state.stage === 'pick' && state.selected.length > 0) fanRefs.current[active]?.focus();
  }, [active, state.stage, state.selected.length]);
  useEffect(() => {
    setStorageWarning(!writeStored(key, state, true));
  }, [key, state]);
  useEffect(() => {
    if (state.stage !== 'breathe' && state.stage !== 'shuffle') return;
    const timer = setTimeout(
      () => setState((old) => ({ ...old, stage: old.stage === 'breathe' ? 'shuffle' : 'pick' })),
      state.stage === 'breathe' ? 5000 : 1500,
    );
    return () => clearTimeout(timer);
  }, [state.stage]);
  const changeStage = (stage: Stage) => setState((old) => ({ ...old, stage }));
  function contextUpdate<K extends keyof ReadingContext>(field: K, value: ReadingContext[K]) {
    setState((old) => ({ ...old, context: { ...old.context, [field]: value } }));
  }
  function start(skip = false) {
    if (needsSupport(state.context.question)) {
      setState((old) => ({
        ...old,
        context: { ...old.context, question: '', remember: false },
        stage: 'crisis',
      }));
      return;
    }
    const context = skip ? { ...state.context, question: '', remember: false } : state.context;
    const adapted =
      topic === 'love' ? adaptLoveSpread(initialSpread, context.situation) : initialSpread;
    setState((old) => ({
      ...old,
      context,
      seed: topic === 'exam' ? examSeed(old.seed, context.days) : old.seed,
      version: 2,
      persona: settings.persona,
      spice: settings.spice,
      deck: draw(78, settings.reversed),
      spread: adapted,
      stage: 'breathe',
    }));
    const next = redraws + 1;
    setRedraws(next);
    writeStored(`redraws:${topic}`, next, true);
  }
  function pick(index: number) {
    if (state.selected.includes(index) || state.selected.length >= count) return;
    const selected = [...state.selected, index];
    setState((old) => ({ ...old, selected, stage: selected.length === count ? 'reveal' : 'pick' }));
    setAnnouncement(`${th.flow.chosen} ${selected.length} / ${count}`);
    const next =
      Array.from({ length: 7 }, (_, n) => (index + n + 1) % 7).find((n) => !selected.includes(n)) ??
      0;
    setActive(next);
  }
  function randomPick() {
    const candidates = Array.from({ length: 7 }, (_, i) => i).filter(
      (i) => !state.selected.includes(i),
    );
    const chosen = [...state.selected];
    while (chosen.length < count) {
      const i = randomIndex(candidates.length);
      chosen.push(candidates.splice(i, 1)[0]);
    }
    setState((old) => ({ ...old, selected: chosen, stage: 'reveal' }));
    setAnnouncement(`${th.flow.chosen} ${count} / ${count}`);
  }
  function flip(index: number) {
    if (state.revealed.includes(index)) return;
    const drawn = state.deck[state.selected[index]];
    const card = cards[drawn.index];
    setState((old) => ({ ...old, revealed: [...old.revealed, index] }));
    setAnnouncement(
      `${spread.positions[index].label}: ${card.name.th}${drawn.reversed ? `, ${th.common.reversed}` : ''} ${card.keywords[drawn.reversed ? 'reversed' : 'upright'].join(', ')}`,
    );
  }
  useEffect(() => {
    if (state.stage === 'reading' && settings.history) {
      saveHistory(flowReading(state), state.context);
    }
  }, [state, settings.history]);
  function restart() {
    try {
      sessionStorage.removeItem(`starlit:${key}`);
    } catch {
      /* Current view can restart without persistence. */
    }
    navigate(`/read/${topic}`);
  }
  return (
    <div className={`page flow-page ${topic}`}>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      {state.stage !== 'reading' && (
        <>
          <Link className="text-link" to={`/read/${topic}`}>
            <Icon name="back" />
            {topics[topic].name}
          </Link>
          <div className="flow-progress" aria-label={th.common.start}>
            {[
              th.flow.context,
              th.flow.breathe,
              th.flow.pick,
              th.flow.reveal,
              th.reading.overview,
            ].map((label, i) => {
              const stageIndex =
                state.stage === 'context'
                  ? 0
                  : ['breathe', 'shuffle'].includes(state.stage)
                    ? 1
                    : state.stage === 'pick'
                      ? 2
                      : state.stage === 'reveal'
                        ? 3
                        : 4;
              return (
                <span className={i <= stageIndex ? 'active' : ''} key={label}>
                  <i>{i + 1}</i>
                  <small>{label}</small>
                </span>
              );
            })}
          </div>
        </>
      )}
      {storageWarning && (
        <div className="notice" role="status">
          {th.reading.storageWarning}
        </div>
      )}
      {redraws >= 4 && (
        <div className="notice nudge">
          <Icon name="wind" />
          <p>{th.flow.nudge}</p>
        </div>
      )}
      {state.stage === 'context' && (
        <m.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="context-form"
          onSubmit={(event) => {
            event.preventDefault();
            start();
          }}
        >
          <p className="eyebrow">{decor.context}</p>
          <h1>{th.flow.context}</h1>
          <p className="muted">{th.flow.contextSub}</p>
          <StylePicker />
          <label className="field-label" htmlFor="question">
            {th.flow.question}
            <small>{th.common.optional}</small>
          </label>
          <textarea
            id="question"
            maxLength={140}
            rows={3}
            placeholder={topics[topic].placeholder}
            value={state.context.question}
            onChange={(event) => contextUpdate('question', event.target.value)}
          />
          <span className="char-count">{state.context.question.length}/140</span>
          <label className="check-label">
            <input
              type="checkbox"
              checked={state.context.remember}
              onChange={(event) => contextUpdate('remember', event.target.checked)}
            />
            {th.flow.remember}
          </label>
          {topic === 'love' && (
            <fieldset>
              <legend>{th.flow.situation}</legend>
              <div className="chips">
                {th.situations.map((situation) => (
                  <button
                    className={state.context.situation === situation ? 'chip active' : 'chip'}
                    type="button"
                    key={situation}
                    aria-pressed={state.context.situation === situation}
                    onClick={() =>
                      contextUpdate(
                        'situation',
                        state.context.situation === situation ? '' : situation,
                      )
                    }
                  >
                    {situation}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {topic === 'exam' && (
            <>
              <fieldset>
                <legend>{th.flow.examType}</legend>
                <div className="chips">
                  {th.examTypes.map((examType) => (
                    <button
                      type="button"
                      className={state.context.examType === examType ? 'chip active' : 'chip'}
                      key={examType}
                      aria-pressed={state.context.examType === examType}
                      onClick={() => contextUpdate('examType', examType)}
                    >
                      {examType}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="field-label" htmlFor="days">
                {th.flow.days}
              </label>
              <input
                id="days"
                type="number"
                min="0"
                max="9999"
                value={state.context.days}
                onChange={(event) =>
                  contextUpdate('days', event.target.value.replace(/\D/g, '').slice(0, 4))
                }
              />
            </>
          )}
          {topic === 'weather' && (
            <PlacePicker
              place={state.context.place}
              onChange={(place) => contextUpdate('place', place)}
            />
          )}
          <div className="context-actions">
            <button className="button gold" type="submit">
              {th.common.next}
              <Icon name="arrow" />
            </button>
            <button className="text-button" type="button" onClick={() => start(true)}>
              {th.common.skip}
            </button>
          </div>
        </m.form>
      )}
      {(state.stage === 'breathe' || state.stage === 'shuffle') && (
        <section className="ritual center">
          <p className="eyebrow">{decor.breathe}</p>
          <div className={`ritual-orb ${state.stage}`} aria-hidden="true">
            {state.stage === 'breathe' ? (
              <Icon name="wind" size={55} />
            ) : (
              <div className="shuffle-stack">
                {[0, 1, 2].map((i) => (
                  <m.div
                    key={i}
                    animate={
                      settings.motion
                        ? { opacity: [0.5, 1, 0.5] }
                        : {
                            x: [-30 + i * 15, 35 - i * 15, -30 + i * 15],
                            rotate: [-10 + i * 10, 10 - i * 10, -10 + i * 10],
                          }
                    }
                    transition={{ duration: 0.7, repeat: Infinity }}
                  >
                    <CardArt back />
                  </m.div>
                ))}
              </div>
            )}
          </div>
          <h1>{state.stage === 'breathe' ? th.flow.breathe : th.flow.shuffle}</h1>
          <p>{state.stage === 'breathe' ? th.flow.breatheSub : th.flow.shuffleSub}</p>
          <button
            className="button outline"
            onClick={() => changeStage(state.stage === 'breathe' ? 'shuffle' : 'pick')}
          >
            {th.common.skip}
          </button>
        </section>
      )}
      {(state.stage === 'pick' || state.stage === 'reveal') && (
        <section className="pick-stage center">
          <p className="eyebrow">{state.stage === 'pick' ? decor.pick : decor.reveal}</p>
          <h1>{state.stage === 'pick' ? th.flow.pick : th.flow.reveal}</h1>
          <p className="muted small">
            {state.stage === 'pick'
              ? `${th.flow.chosen} ${state.selected.length} / ${count} · ${th.flow.pickSub}`
              : th.flow.revealSub}
          </p>
          <div className={`flow-spread count-${count}`}>
            {spread.positions.map((position, i) => {
              const selected = state.selected[i];
              const drawn = selected === undefined ? null : state.deck[selected];
              const faceUp = state.revealed.includes(i);
              return (
                <div className="spread-slot" key={position.id}>
                  <p className="slot-label">{position.label}</p>
                  {drawn ? (
                    <m.div
                      initial={settings.motion ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.7 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <TarotCard
                        card={cards[drawn.index]}
                        faceUp={faceUp}
                        reversed={drawn.reversed}
                        onFlip={state.stage === 'reveal' ? () => flip(i) : undefined}
                        label={`${position.label}: ${faceUp ? `${cards[drawn.index].name.th}${drawn.reversed ? ` ${th.common.reversed}` : ''}` : th.flow.tap}`}
                      />
                    </m.div>
                  ) : (
                    <div className="empty-slot">
                      <span>{String(i + 1).padStart(2, '0')}</span>
                      <Icon name="star" size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {state.stage === 'pick' ? (
            <>
              <div className="card-fan" role="group" aria-label={th.flow.pick}>
                {Array.from(
                  { length: 7 },
                  (_, index) =>
                    !state.selected.includes(index) && (
                      <m.button
                        ref={(element) => {
                          fanRefs.current[index] = element;
                        }}
                        key={index}
                        className="fan-card"
                        style={
                          {
                            '--i': index,
                            '--angle': `${(index - 3) * 5}deg`,
                            '--y': `${Math.abs(index - 3) * 2}px`,
                          } as CSSProperties
                        }
                        aria-label={`${th.flow.cards} ${index + 1}`}
                        tabIndex={active === index ? 0 : -1}
                        onFocus={() => setActive(index)}
                        whileHover={settings.motion ? {} : { y: -22 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => pick(index)}
                        onKeyDown={(event) => {
                          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
                            return;
                          event.preventDefault();
                          const available = Array.from({ length: 7 }, (_, i) => i).filter(
                            (i) => !state.selected.includes(i),
                          );
                          const current = available.indexOf(index);
                          const next =
                            event.key === 'Home'
                              ? available[0]
                              : event.key === 'End'
                                ? available.at(-1)!
                                : available[
                                    (current +
                                      (event.key === 'ArrowRight' ? 1 : -1) +
                                      available.length) %
                                      available.length
                                  ];
                          setActive(next);
                          fanRefs.current[next]?.focus();
                        }}
                      >
                        <CardArt back />
                      </m.button>
                    ),
                )}
              </div>
              <button className="button outline" onClick={randomPick}>
                <Icon name="sparkles" />
                {th.flow.random}
              </button>
            </>
          ) : (
            <div className="reveal-actions">
              {state.revealed.length < count ? (
                <button
                  className="button gold"
                  onClick={() => {
                    setState((old) => ({ ...old, revealed: state.selected.map((_, i) => i) }));
                    setAnnouncement(
                      state.selected
                        .map(
                          (index, i) =>
                            `${spread.positions[i].label}: ${cards[state.deck[index].index].name.th}${state.deck[index].reversed ? ` ${th.common.reversed}` : ''}`,
                        )
                        .join(', '),
                    );
                  }}
                >
                  {th.flow.revealAll}
                  <Icon name="sparkles" />
                </button>
              ) : (
                <button className="button gold" onClick={() => changeStage('reading')}>
                  {th.flow.toReading}
                  <Icon name="arrow" />
                </button>
              )}
            </div>
          )}
        </section>
      )}
      {state.stage === 'crisis' && (
        <section className="crisis-panel" role="alert">
          <Icon name="love" size={34} />
          <h1>{th.flow.crisisTitle}</h1>
          <p>{th.flow.crisisBody}</p>
          <a className="button gold" href="tel:1323?oai_link_source=model_response_hotline">
            {th.flow.crisisHelp}
          </a>
          <a className="button outline" href="tel:1669">
            {th.flow.crisisEmergency}
          </a>
          <Link className="text-link" to="/">
            {th.common.home}
          </Link>
        </section>
      )}
      {state.stage === 'reading' && (
        <ReadingView
          reading={flowReading(state)}
          context={state.context}
          onNew={restart}
          actions={(reading) => <ShareActions reading={reading} />}
          weather={
            topic === 'weather' ? (
              <WeatherPanel place={state.context.place} count={count} />
            ) : undefined
          }
        />
      )}
    </div>
  );
}
