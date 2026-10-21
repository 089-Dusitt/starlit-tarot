import { ShareActions } from '../../components/reading/ShareActions';
import { useEffect, useState } from 'react';
import { saveHistory } from '../../services/history';
import { getDailyReading, recordDailyOpen, dailyStats } from '../../services/daily-fate';
import { DailyFatePanel, dailyFeature } from '../../components/reading/DailyFatePanel';
import { playCopy } from '../../i18n/play';
import { useSettings } from '../../app/settings';
import { cards } from '../../data/cards';
import { th } from '../../i18n/th';
import { TarotCard } from '../../components/cards/TarotCard';
import { ReadingView } from '../../components/reading/ReadingView';
export default function Daily() {
  const { settings } = useSettings();
  const [reading] = useState(() => ({
    ...getDailyReading(settings.reversed),
    version: 2 as const,
    persona: settings.persona,
    spice: settings.spice,
  }));
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState(() => dailyStats());
  const [warning, setWarning] = useState(false);
  useEffect(() => {
    if (open) {
      const next = recordDailyOpen(reading);
      setStats(next);
      setWarning(!next.saved);
    }
    if (open && settings.history) saveHistory(reading);
  }, [open, reading, settings.history]);
  const card = cards[reading.cards[0].index];
  return (
    <div className="page narrow">
      <div className="section-intro">
        <p className="eyebrow">{th.daily.eyebrow}</p>
        <h1>{playCopy.dailyTitle}</h1>
        <p>{th.daily.body}</p>
        <p className="small muted">
          {stats.streak} {playCopy.streak} · {stats.total} {playCopy.total}
        </p>
      </div>
      {!open ? (
        <div className="daily-card">
          <TarotCard card={card} faceUp={false} onFlip={() => setOpen(true)} label={th.flow.tap} />
          <p>{th.flow.tap}</p>
        </div>
      ) : (
        <>
          {warning && (
            <p role="status" className="notice">
              {th.reading.storageWarning}
            </p>
          )}
          <div className="lucky-color">
            <span style={{ background: card.luckyColor.hex }} />
            <div>
              <p>
                {th.daily.color} · {card.luckyColor.th}
              </p>
              <small>{th.daily.colorNote}</small>
            </div>
          </div>
          <ReadingView
            reading={reading}
            feature={(current) => <DailyFatePanel reading={current} stats={stats} />}
            actions={(current) => (
              <ShareActions reading={current} feature={dailyFeature(current)} daily />
            )}
          />
        </>
      )}
    </div>
  );
}
