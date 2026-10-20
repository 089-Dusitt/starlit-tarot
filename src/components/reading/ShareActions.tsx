import { useState } from 'react';
import type { Reading } from '../../data/types';
import { th } from '../../i18n/th';
import { SITE } from '../../config';
import { shareUrl, readingText, copyText, exportReadingImage } from '../../services/share';
import { Icon } from '../Icon';
import { Sheet } from '../Sheet';
export function ShareActions({ reading }: { reading: Reading }) {
  const [status, setStatus] = useState('');
  const [fallback, setFallback] = useState('');
  const [busy, setBusy] = useState(false);
  const url = shareUrl(reading);
  async function copy() {
    if (await copyText(url)) setStatus(th.reading.copied);
    else setFallback(url);
  }
  async function image() {
    setBusy(true);
    try {
      const blob = await exportReadingImage(reading);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `starlit-${reading.date}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
      setStatus(th.reading.savedImage);
    } catch {
      const text = readingText(reading);
      setStatus(th.reading.imageFailed);
      if (!(await copyText(text))) setFallback(text);
    } finally {
      setBusy(false);
    }
  }
  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: SITE.name,
          text: `${th.topics[reading.topic].name} · ${th.reading.shared}`,
          url,
        });
        return;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
    }
    setFallback(readingText(reading));
  }
  return (
    <>
      <div className="share-actions">
        <button className="button outline" onClick={() => void image()} disabled={busy}>
          <Icon name="download" />
          {busy ? th.common.loading : th.reading.save}
        </button>
        <button className="button" onClick={() => void copy()}>
          <Icon name="copy" />
          {th.reading.copy}
        </button>
        <a
          className="button line-button"
          target="_blank"
          rel="noreferrer"
          href={`https://line.me/R/msg/text/?${encodeURIComponent(`${SITE.name}\n${url}`)}`}
        >
          <Icon name="share" />
          {th.reading.line}
        </a>
        <button className="button" onClick={() => void share()}>
          <Icon name="share" />
          {th.reading.share}
        </button>
      </div>
      <p className="share-status" aria-live="polite">
        {status}
      </p>
      {fallback && (
        <Sheet title={th.reading.copyFallback} onClose={() => setFallback('')}>
          <textarea
            rows={8}
            readOnly
            value={fallback}
            aria-label={th.reading.copyFallback}
            onFocus={(event) => event.currentTarget.select()}
          />
        </Sheet>
      )}
    </>
  );
}
