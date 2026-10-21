import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import { SettingsProvider } from '../../app/settings';
import Flow from './Flow';
import { th } from '../../i18n/th';
import { createFlow, flowReading, validFlow } from './state';
import { dailyReading } from '../../services/daily';
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(cleanup);
function show(path: string) {
  return render(
    <SettingsProvider>
      <LazyMotion features={domAnimation}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/read/:topic/:spread" element={<Flow />} />
          </Routes>
        </MemoryRouter>
      </LazyMotion>
    </SettingsProvider>,
  );
}
function skipToPick() {
  fireEvent.click(screen.getByRole('button', { name: th.common.skip }));
  fireEvent.click(screen.getByRole('button', { name: th.common.skip }));
  fireEvent.click(screen.getByRole('button', { name: th.common.skip }));
}
describe('reading flow', () => {
  it.each([
    ['love', 'connection'],
    ['exam', 'study'],
    ['weather', 'three-skies'],
    ['general', 'timeline'],
    ['gaming', 'timeline'],
    ['work', 'timeline'],
    ['general', 'celtic'],
    ['general', 'week'],
    ['love', 'love-autopsy'],
    ['exam', 'exam-audit'],
  ])('renders and completes %s', (topic, spread) => {
    show(`/read/${topic}/${spread}`);
    expect(screen.getByRole('heading', { name: th.flow.context })).toBeInTheDocument();
    skipToPick();
    fireEvent.click(screen.getByRole('button', { name: th.flow.random }));
    fireEvent.click(screen.getByRole('button', { name: th.flow.revealAll }));
    fireEvent.click(screen.getByRole('button', { name: th.flow.toReading }));
    expect(screen.getByRole('heading', { name: th.reading.overview })).toBeInTheDocument();
    expect(screen.getByText(th.disclaimer)).toBeInTheDocument();
  });
  it('picks with arrows and Enter-compatible buttons, preserving cards across reload', () => {
    const view = show('/read/love/connection');
    skipToPick();
    const first = screen.getByRole('button', { name: 'ใบ 1' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    const second = screen.getByRole('button', { name: 'ใบ 2' });
    expect(document.activeElement).toBe(second);
    fireEvent.click(second);
    const stored = JSON.parse(sessionStorage.getItem('starlit:flow:love:connection')!);
    expect(stored.selected).toEqual([1]);
    view.unmount();
    show('/read/love/connection');
    const restored = JSON.parse(sessionStorage.getItem('starlit:flow:love:connection')!);
    expect(restored.deck).toEqual(stored.deck);
    expect(screen.queryByRole('button', { name: 'ใบ 2' })).not.toBeInTheDocument();
  });
  it('validates persisted flow including duplicate and malformed cards', () => {
    const state = createFlow('general', 'timeline', true);
    expect(validFlow(state)).toBe(true);
    expect(validFlow({ ...state, deck: Array(78).fill({ index: 0, reversed: false }) })).toBe(
      false,
    );
    state.selected = [1, 2, 3];
    state.revealed = [0, 1, 2];
    state.stage = 'reading';
    expect(validFlow(state)).toBe(true);
    expect(flowReading(state).cards).toEqual(state.selected.map((i) => state.deck[i]));
  });
  it('keeps the daily card stable for the same device and day', () => {
    expect(dailyReading(true, '2026-10-21')).toEqual(dailyReading(true, '2026-10-21'));
  });
  it('supports manual ten-card selection, arrow navigation, restoration and share replay', () => {
    const view = show('/read/general/celtic');
    skipToPick();
    const first = screen.getByRole('button', { name: 'ใบ 1' });
    fireEvent.keyDown(first, { key: 'End' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'ใบ 13' }));
    for (let n = 1; n <= 10; n++) fireEvent.click(screen.getByRole('button', { name: `ใบ ${n}` }));
    const stored = JSON.parse(sessionStorage.getItem('starlit:flow:general:celtic')!);
    expect(validFlow(stored)).toBe(true);
    expect(flowReading(stored).cards).toHaveLength(10);
    view.unmount();
    show('/read/general/celtic');
    expect(screen.getByRole('button', { name: th.flow.revealAll })).toBeInTheDocument();
  });
});

it('bypasses the reading and removes crisis question text from the session', () => {
  show('/read/general/one');
  fireEvent.change(screen.getByLabelText(new RegExp(th.flow.question)), {
    target: { value: 'อยากทำร้ายตัวเอง' },
  });
  fireEvent.click(screen.getByRole('button', { name: th.common.next }));
  expect(screen.getByRole('heading', { name: th.flow.crisisTitle })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: th.flow.random })).not.toBeInTheDocument();
  expect(sessionStorage.getItem('starlit:flow:general:one')).not.toContain('อยากทำร้ายตัวเอง');
  expect(localStorage.getItem('starlit:history')).toBeNull();
});
it('does not save readings when history is turned off', () => {
  localStorage.setItem(
    'starlit:settings',
    JSON.stringify({ reversed: true, motion: true, history: false }),
  );
  show('/read/general/one');
  skipToPick();
  fireEvent.click(screen.getByRole('button', { name: th.flow.random }));
  fireEvent.click(screen.getByRole('button', { name: th.flow.revealAll }));
  fireEvent.click(screen.getByRole('button', { name: th.flow.toReading }));
  expect(localStorage.getItem('starlit:history')).toBeNull();
});
