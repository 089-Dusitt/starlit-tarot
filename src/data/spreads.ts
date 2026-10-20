import type { Spread, Topic } from './types';
export interface NamedSpread extends Spread {
  baseId?: string;
  situation?: string;
}
const define = (
  id: string,
  name: string,
  en: string,
  topics: Topic[],
  labels: string[],
  minutes: number,
): NamedSpread => ({
  id,
  name: { th: name, en },
  topics,
  minutes,
  positions: labels.map((label, i) => ({
    id: `p${i}`,
    label,
    prompt: `ลองมอง${label}ผ่านความหมายของไพ่`,
    layout: { x: i % 3, y: Math.floor(i / 3) },
    weight: i === labels.length - 1 ? 1.2 : 1,
  })),
});
const base = [
  define(
    'one',
    'เสียงกระซิบหนึ่งใบ',
    'One quiet card',
    ['love', 'exam', 'general'],
    ['สิ่งที่ควรใส่ใจ'],
    2,
  ),
  define(
    'timeline',
    'เส้นทางสามช่วง',
    'Past · Present · Possibility',
    ['general'],
    ['อดีต', 'ปัจจุบัน', 'แนวโน้ม'],
    4,
  ),
  define(
    'connection',
    'หัวใจสามมุม',
    'The connection',
    ['love'],
    ['คุณ', 'อีกฝ่าย', 'สิ่งที่เชื่อมกัน'],
    4,
  ),
  define(
    'relationship',
    'เรื่องราวของสองเรา',
    'Relationship compass',
    ['love'],
    ['คุณ', 'อีกฝ่าย', 'จุดแข็ง', 'อุปสรรค', 'แนวโน้ม'],
    6,
  ),
  define(
    'study',
    'เข็มทิศก่อนสอบ',
    'Study compass',
    ['exam'],
    ['จุดแข็งของคุณ', 'สิ่งที่ต้องระวัง', 'คำแนะนำก่อนสอบ'],
    4,
  ),
  define('sky', 'ไพ่ท้องฟ้า', 'A symbolic sky', ['weather'], ['วันนี้'], 2),
  define(
    'three-skies',
    'ท้องฟ้าสามวัน',
    'Three skies',
    ['weather'],
    ['วันนี้', 'พรุ่งนี้', 'มะรืน'],
    4,
  ),
];
const situations = ['โสด', 'กำลังคุย', 'คบกันอยู่', 'อดีตคนรัก', 'ซับซ้อน'];
const loveLabels = [
  ['คุณ', 'พื้นที่เปิดใจ', 'สิ่งที่ช่วยเชื่อมโยง'],
  ['คุณ', 'มุมที่อยากรู้จัก', 'จังหวะของการสื่อสาร'],
  ['คุณ', 'พื้นที่ของอีกฝ่าย', 'สิ่งที่ดูแลร่วมกัน'],
  ['คุณในวันนี้', 'บทเรียนจากความสัมพันธ์', 'ขอบเขตที่ช่วยใจ'],
  ['ความต้องการของคุณ', 'ความไม่ชัดที่ควรถาม', 'พื้นที่ที่คุณเลือกได้'],
];
export const spreads: NamedSpread[] = [
  ...base,
  ...base
    .filter((s) => s.topics.includes('love'))
    .flatMap((s) =>
      situations.map((situation, i): NamedSpread => ({
        ...s,
        id: `${s.id}-love-${i}`,
        baseId: s.id,
        topics: ['love'],
        situation,
        positions: s.positions.map((p, n) => ({
          ...p,
          label:
            s.positions.length === 1
              ? `สิ่งที่ควรใส่ใจเมื่อ${situation}`
              : n < 3 && s.id === 'connection'
                ? loveLabels[i][n]
                : s.id === 'relationship' && n < 2
                  ? loveLabels[i][n]
                  : p.label,
        })),
      })),
    ),
];
export const getSpread = (id: string) => spreads.find((s) => s.id === id);
export const spreadsForTopic = (topic: Topic) =>
  spreads.filter((s) => s.topics.includes(topic) && !s.baseId);
export function adaptLoveSpread(id: string, situation: string) {
  return spreads.find((s) => s.baseId === id && s.situation === situation)?.id || id;
}
