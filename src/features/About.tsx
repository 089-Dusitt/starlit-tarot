import {th} from '../i18n/th';
import {SITE} from '../config';
import {Icon} from '../components/Icon';
export default function About(){return <div className="page narrow about-page"><p className="eyebrow">{SITE.name}</p><h1>{th.about.title}</h1><p>{th.about.body}</p><section><h2>{th.about.privacyTitle}</h2><p>{th.about.privacy}</p></section><section><h2>{th.about.creditTitle}</h2><p>{th.about.art}</p><p>{th.about.fonts}</p><a className="text-link" href="https://open-meteo.com/" target="_blank" rel="noreferrer">{th.weather.credit}<Icon name="arrow" size={15}/></a></section><p className="disclaimer"><Icon name="shield"/>{th.disclaimer}</p></div>;}
