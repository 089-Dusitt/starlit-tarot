import {cards} from '../data/cards';
import {getSpread} from '../data/spreads';
import type {Reading} from '../data/types';
import {engineCopy,th} from '../i18n/th';
import {seededRng} from './rng';
import {patterns} from './patterns';
import {meter} from './meter';
export function compose(reading:Reading){const spread=getSpread(reading.spread);if(!spread)throw Error('Unknown spread');const rng=seededRng(reading.seed);const slots=reading.cards.map((drawn,i)=>{const card=cards[drawn.index];const orientation=drawn.reversed?'reversed':'upright';const position=spread.positions[i];const prefix=engineCopy.slots[Math.floor(rng()*3)];return{...drawn,card,position,meaning:card.meanings[reading.topic][orientation],advice:card.advice[orientation],keywords:card.keywords[orientation],summary:`${prefix} “${position.label}” ${card.name.th}${drawn.reversed?` (${th.common.reversed})`:''} ${card.meanings[reading.topic][orientation]}`};});const headline=engineCopy.headlines[reading.topic][Math.floor(rng()*3)];const overview=`${engineCopy.openings[reading.topic][Math.floor(rng()*3)]} ${slots.map(s=>s.summary).join(' ')}`;return{headline,overview,slots,insights:patterns(reading.cards),meter:meter(reading.cards,spread.positions),tips:slots.map(s=>s.advice).slice(0,3)};}
