import { TarotCard } from '../components/cards/TarotCard';
import { identities } from '../data/cards/identities';
import { topicIds } from '../data/topic-ids';
import { topics } from '../data/topics';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { PlayLinks } from '../components/PlayLinks';
import { th, decor } from '../i18n/th';
import { Icon } from '../components/Icon';
export default function Home() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> {th.hero.eyebrow}
          </p>
          <h1>
            {th.hero.first}
            <br />
            <em>{th.hero.second}</em>
          </h1>
          <p className="hero-body">{th.hero.body}</p>
          <div className="hero-actions">
            <a className="button gold" href="#topics">
              <Icon name="sparkles" />
              {th.hero.cta}
              <Icon name="arrow" size={18} />
            </a>
            <Link className="text-link" to="/cards">
              {th.hero.secondary}
              <Icon name="arrow" size={16} />
            </Link>
          </div>
          <p className="hero-note">
            <span /> {th.hero.note}
          </p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-moon">
            <Icon name="moon" size={45} />
          </div>
          <div className="hero-card-stack">
            <TarotCard card={identities[18]} />
            <TarotCard card={identities[19]} />
            <TarotCard card={identities[17]} />
          </div>
          <span className="art-star one">✦</span>
          <span className="art-star two">✧</span>
          <div className="art-caption">{decor.artCaption}</div>
        </div>
      </section>
      <section id="topics" className="container topic-section">
        <div className="section-intro">
          <p className="eyebrow">{decor.topics}</p>
          <h2>{th.home.intro}</h2>
          <p>{th.home.introSub}</p>
        </div>
        <div className="topic-grid">
          {topicIds.map((id, index) => (
            <Link
              className={`topic-tile ${id}`}
              style={{ '--accent': topics[id].accent } as CSSProperties}
              to={`/read/${id}`}
              key={id}
            >
              <div className="topic-top">
                <span className="topic-icon">
                  <Icon name={topics[id].icon} size={26} />
                </span>
                <span className="topic-number">0{index + 1}</span>
              </div>
              <p className="eyebrow">{th.topics[id].en}</p>
              <h3>{th.topics[id].name}</h3>
              <p>{th.topics[id].desc}</p>
              <span className="topic-arrow">
                <Icon name="arrow" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="container">
        <div className="daily-banner">
          <div className="daily-ornament">
            <Icon name="sun" size={76} />
          </div>
          <div>
            <p className="eyebrow">{th.home.dailyEyebrow}</p>
            <h2>{th.home.dailyTitle}</h2>
            <p>{th.home.dailyBody}</p>
          </div>
          <Link className="button outline" to="/daily">
            {th.home.dailyCta}
            <Icon name="arrow" size={17} />
          </Link>
        </div>
      </section>
      <PlayLinks />
      <section className="container how-section">
        <div className="section-intro">
          <p className="eyebrow">{decor.ritual}</p>
          <h2>{th.home.howTitle}</h2>
          <p>{th.home.howSub}</p>
        </div>
        <div className="how-grid">
          {th.home.steps.map(([number, title, body]) => (
            <div key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="quote container">
        <Icon name="star" />
        <h2>{th.home.quote}</h2>
        <p className="eyebrow">{th.home.quoteSub}</p>
      </section>
    </>
  );
}
