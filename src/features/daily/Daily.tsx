import {ShareActions} from '../../components/reading/ShareActions';
import {useState} from 'react';
import {dailyReading} from '../../services/daily';
import {useSettings} from '../../app/settings';
import {cards} from '../../data/cards';
import {th} from '../../i18n/th';
import {TarotCard} from '../../components/cards/TarotCard';
import {ReadingView} from '../../components/reading/ReadingView';
export default function Daily(){const{settings}=useSettings();const[reading]=useState(()=>dailyReading(settings.reversed));const[open,setOpen]=useState(false);const card=cards[reading.cards[0].index];return <div className="page narrow"><div className="section-intro"><p className="eyebrow">{th.daily.eyebrow}</p><h1>{th.daily.title}</h1><p>{th.daily.body}</p></div>{!open?<div className="daily-card"><TarotCard card={card} faceUp={false} onFlip={()=>setOpen(true)} label={th.flow.tap}/><p>{th.flow.tap}</p></div>:<><div className="lucky-color"><span style={{background:card.luckyColor.hex}}/><div><p>{th.daily.color} · {card.luckyColor.th}</p><small>{th.daily.colorNote}</small></div></div><ReadingView reading={reading} actions={<ShareActions reading={reading}/>}/></>}</div>;}
