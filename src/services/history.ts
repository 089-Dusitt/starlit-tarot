import type {Reading} from '../data/types';
import {validReading,encodeReading} from '../engine/share-code';
import {readStored,writeStored} from './storage';
import type {ReadingContext} from '../features/flow/state';
export interface HistoryEntry{id:string;reading:Reading;question?:string;days?:string;examType?:string}
export function validEntry(value:unknown):value is HistoryEntry{if(typeof value!=='object'||!value)return false;const e=value as Record<string,unknown>;return typeof e.id==='string'&&e.id.length<=96&&validReading(e.reading)&&e.id===encodeReading(e.reading)&&(e.question===undefined||typeof e.question==='string'&&e.question.length<=140)&&(e.days===undefined||typeof e.days==='string'&&/^\d{0,4}$/.test(e.days))&&(e.examType===undefined||typeof e.examType==='string'&&e.examType.length<60);}
const validHistory=(value:unknown):value is HistoryEntry[]=>Array.isArray(value)&&value.length<=50&&value.every(validEntry);
export function getHistory(){return readStored<HistoryEntry[]>('history',[],validHistory);}
export function saveHistory(reading:Reading,context?:ReadingContext):boolean{if(!validReading(reading))return false;const id=encodeReading(reading);const entry:HistoryEntry={id,reading,...(context?.remember&&context.question?{question:context.question}:{}),...(context?.days?{days:context.days}:{}),...(context?.examType?{examType:context.examType}:{})};return writeStored('history',[entry,...getHistory().filter(item=>item.id!==id)].slice(0,50));}
export function deleteHistory(id?:string){const next=id?getHistory().filter(entry=>entry.id!==id):[];writeStored('history',next);return next;}
