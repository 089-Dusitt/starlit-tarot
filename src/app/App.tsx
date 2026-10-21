import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion';
import { SITE } from '../config';
import { th, decor, styleCopy } from '../i18n/th';
import { playCopy } from '../i18n/play';
import { StylePicker } from '../components/StylePicker';
import { Icon } from '../components/Icon';
import { Sheet } from '../components/Sheet';
import { SettingsProvider, useSettings } from './settings';
import { clearData } from '../services/storage';
import { identities } from '../data/cards/identities';
import { getSpread } from '../data/spreads';
import { isTopic } from '../data/topics';
const Shared = lazy(() => import('../features/Shared'));
const History = lazy(() => import('../features/history/History'));
const About = lazy(() => import('../features/About'));
const Flow = lazy(() => import('../features/flow/Flow'));
const Daily = lazy(() => import('../features/daily/Daily'));
const Library = lazy(() => import('../features/library/Library'));
const CardDetail = lazy(() =>
  import('../features/library/Library').then((module) => ({ default: module.CardDetail })),
);
const Home = lazy(() => import('../features/Home'));
const Oracle = lazy(() => import('../features/Oracle'));
function Meta() {
  const location = useLocation();
  useEffect(() => {
    const [, key, detail, spreadId] = location.pathname.split('/');
    const card = key === 'cards' ? identities.find((c) => c.id === detail) : undefined;
    const title =
      key === 'read' && isTopic(detail)
        ? `${th.topics[detail].name}${spreadId ? ` · ${getSpread(spreadId)?.name.th || th.common.start}` : ` · ${th.common.start}`}`
        : key === 'r'
          ? th.reading.shared
          : key === 'daily'
            ? th.daily.title
            : key === 'cards'
              ? card?.name.th || th.nav.cards
              : key === 'history'
                ? th.history.title
                : key === 'about'
                  ? th.about.title
                  : key
                    ? th.common.error
                    : th.hero.first;
    document.title = `${title} · ${SITE.name} | ${SITE.thaiName} · ${th.seo.titleSuffix}`;
    const description = `${title} — ${th.seo.description}`;
    for (const selector of [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
    ])
      document.querySelector(selector)?.setAttribute('content', description);
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]'])
      document.querySelector(selector)?.setAttribute('content', document.title);
    const url = new URL(location.pathname.replace(/^\//, ''), `${SITE.url.replace(/\/$/, '')}/`)
      .href;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute(
        'content',
        ['r', 'history'].includes(key) ? 'noindex, nofollow' : 'index, follow',
      );
    try {
      window.scrollTo?.({ top: 0, behavior: 'instant' });
    } catch {
      window.scrollTo?.(0, 0);
    }
  }, [location]);
  return null;
}
function Shell() {
  useEffect(() => {
    const visibility = () => {
      document.documentElement.dataset.pageHidden = String(document.hidden);
    };
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, []);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const { settings, update } = useSettings();
  const location = useLocation();
  function finishStyle() {
    update('onboarded', true);
  }
  return (
    <MotionConfig reducedMotion={settings.motion ? 'always' : 'user'}>
      <LazyMotion features={domAnimation}>
        <div className="site" data-reduced={settings.motion}>
          <Meta />
          <div className="stars" aria-hidden="true">
            {Array.from({ length: 48 }, (_, i) => (
              <i
                key={i}
                style={{
                  left: `${(i * 47.17) % 100}%`,
                  top: `${(i * 31.13) % 100}%`,
                  animationDelay: `${i % 7}s`,
                  opacity: 0.2 + (i % 5) * 0.12,
                }}
              />
            ))}
          </div>
          <a className="skip-link" href="#main">
            {th.common.read}
          </a>
          <header>
            <div className="nav-wrap">
              <Link to="/" className="brand" aria-label={`${SITE.name} ${SITE.thaiName}`}>
                <span className="brand-mark">
                  <Icon name="sparkles" size={28} />
                </span>
                <span>
                  <b>{SITE.name}</b>
                  <small>{SITE.thaiName}</small>
                </span>
              </Link>
              <nav aria-label={th.nav.home} className={menu ? 'nav open' : 'nav'}>
                {(['home', 'daily', 'cards', 'history'] as const).map((key) => (
                  <NavLink
                    key={key}
                    to={key === 'home' ? '/' : `/${key}`}
                    onClick={() => setMenu(false)}
                  >
                    {th.nav[key]}
                  </NavLink>
                ))}
              </nav>
              <div className="nav-actions">
                <button
                  className="icon-button"
                  onClick={() => setOpen(true)}
                  aria-label={th.nav.settings}
                >
                  <Icon name="settings" />
                </button>
                <button
                  className="icon-button menu-button"
                  onClick={() => setMenu(!menu)}
                  aria-expanded={menu}
                  aria-label={th.nav.home}
                >
                  <Icon name="menu" />
                </button>
              </div>
            </div>
          </header>
          <main id="main" tabIndex={-1}>
            <Suspense fallback={<div className="loading">{th.common.loading}</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/r/:code" element={<Shared />} />
                <Route path="/history" element={<History />} />
                <Route path="/about" element={<About />} />
                <Route path="/read/:topic" element={<Flow />} />
                <Route path="/read/:topic/:spread" element={<Flow />} />
                <Route path="/daily" element={<Daily />} />
                <Route path="/oracle" element={<Oracle />} />
                <Route path="/cards" element={<Library />} />
                <Route path="/cards/:id" element={<CardDetail />} />
                <Route
                  path="*"
                  element={
                    <div className="page narrow center">
                      <p className="eyebrow">{decor.lost}</p>
                      <h1>{th.common.error}</h1>
                      <p>{th.about.notFound}</p>
                      <Link className="button gold" to="/">
                        {th.common.home}
                      </Link>
                    </div>
                  }
                />
              </Routes>
            </Suspense>
          </main>
          <footer>
            <div className="footer-top">
              <Link className="brand" to="/">
                <Icon name="sparkles" />
                <b>{SITE.name}</b>
              </Link>
              <p>{th.footer}</p>
              <Link to="/about">{th.nav.about}</Link>
              <Link to="/oracle">{playCopy.oracle}</Link>
            </div>
            <p className="disclaimer">
              <Icon name="shield" size={15} />
              {th.disclaimer}
            </p>
            <small>
              © {new Date().getFullYear()} {SITE.name} · {decor.made}
            </small>
          </footer>
          {open && (
            <Sheet title={th.settings.title} onClose={() => setOpen(false)}>
              <StylePicker />
              {(['reversed', 'motion', 'history'] as const).map((key) => (
                <label className="setting-row" key={key}>
                  <span>{th.settings[key]}</span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={settings[key]}
                    onChange={(event) => update(key, event.target.checked)}
                  />
                </label>
              ))}
              <p className="muted small">{th.settings.privacy}</p>
              <button
                className="button danger"
                onClick={() => {
                  if (window.confirm(th.settings.confirm)) {
                    clearData();
                    window.location.assign(SITE.base);
                  }
                }}
              >
                {th.settings.clear}
              </button>
            </Sheet>
          )}
          {!settings.onboarded && location.pathname === '/' && !open && (
            <Sheet title={styleCopy.title} onClose={finishStyle}>
              <p>{styleCopy.intro}</p>
              <StylePicker />
              <button className="button gold" onClick={finishStyle}>
                {styleCopy.ready}
              </button>
              <button
                className="text-button"
                onClick={() => {
                  update('persona', 'blunt');
                  update('spice', 2);
                  finishStyle();
                }}
              >
                {styleCopy.skip}
              </button>
            </Sheet>
          )}
        </div>
      </LazyMotion>
    </MotionConfig>
  );
}
export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter basename={SITE.base}>
        <Shell />
      </BrowserRouter>
    </SettingsProvider>
  );
}
