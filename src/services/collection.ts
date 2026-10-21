import type { Reading } from '../data/types';
import { cards } from '../data/cards';
import { decodeReading, encodeReading } from '../engine/share-code';
import { hashSeed } from '../engine/rng';
import { readStored, writeGuarded } from './storage';
interface Album {
  version: 1;
  codes: string[];
}
const valid = (v: unknown): v is Album =>
  !!v &&
  typeof v === 'object' &&
  (v as Album).version === 1 &&
  Array.isArray((v as Album).codes) &&
  (v as Album).codes.every((c) => typeof c === 'string' && !!decodeReading(c)) &&
  new Set((v as Album).codes).size === (v as Album).codes.length;
const empty: Album = { version: 1, codes: [] };
function code(reading: Reading) {
  return encodeReading({ ...reading, version: 1 });
}
export function foilFace(reading: Reading, slot: number) {
  return hashSeed(`foil:${code(reading)}:${slot}`) % 25 === 0;
}
export function recordCollection(reading: Reading) {
  const album = readStored('collection', empty, valid);
  const key = code(reading);
  if (album.codes.includes(key)) return true;
  return writeGuarded('collection', { version: 1, codes: [...album.codes, key] }, valid);
}
export function collectionState() {
  const album = readStored('collection', empty, valid);
  const readings = album.codes.map((c) => decodeReading(c)!);
  const counts = Array<number>(78).fill(0);
  const foils = new Set<number>();
  const topics = new Map<string, number>();
  let reversed = 0;
  for (const reading of readings) {
    topics.set(reading.topic, (topics.get(reading.topic) || 0) + 1);
    reading.cards.forEach((face, i) => {
      counts[face.index]++;
      if (face.reversed) reversed++;
      if (foilFace(reading, i)) foils.add(face.index);
    });
  }
  const unlocked = new Set(counts.flatMap((n, i) => (n ? [i] : [])));
  const faces = counts.reduce((a, b) => a + b, 0);
  const most = faces ? counts.indexOf(Math.max(...counts)) : null;
  const favorite = [...topics].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const group = (s: string) =>
    cards.every((c, i) => (c.arcana !== s && c.suit !== s) || unlocked.has(i));
  const tower = counts[16];
  const rows: [string, string, string, boolean][] = [
    ['first', 'เข้าวงการแล้ว', 'เปิดไพ่ครั้งแรก', readings.length >= 1],
    ['ten', 'โต๊ะประจำ', 'อ่านครบ10ครั้ง', readings.length >= 10],
    ['twenty-five', 'ไพ่จำหน้า', 'อ่านครบ25ครั้ง', readings.length >= 25],
    ['fifty', 'กรรมการเริ่มเหนื่อย', 'อ่านครบ50ครั้ง', readings.length >= 50],
    ['hundred', 'สำรับร้อน', 'อ่านครบ100ครั้ง', readings.length >= 100],
    ['five-cards', 'แง้มสมุด', 'พบไพ่5ใบ', unlocked.size >= 5],
    ['ten-cards', 'เริ่มจำหน้าไพ่', 'พบไพ่10ใบ', unlocked.size >= 10],
    ['half', 'ครึ่งสำรับแล้วแก', 'พบไพ่39ใบ', unlocked.size >= 39],
    ['sixty', 'โต๊ะเริ่มแน่น', 'พบไพ่60ใบ', unlocked.size >= 60],
    ['all', 'ไพ่ไม่มีที่ซ่อน', 'พบครบ78ใบ', unlocked.size === 78],
    ['majors', 'เจอเรื่องใหญ่ครบ', 'พบเมเจอร์ครบ22ใบ', group('major')],
    ['wands', 'นักดับไฟในใจ', 'พบไม้เท้าครบ14ใบ', group('wands')],
    ['cups', 'ถ้วยเต็มตู้', 'พบถ้วยครบ14ใบ', group('cups')],
    ['swords', 'ดาบเต็มฝัก', 'พบดาบครบ14ใบ', group('swords')],
    ['pentacles', 'เหรียญในสมุด', 'พบเหรียญครบ14ใบ', group('pentacles')],
    ['tower', 'รอดจากหอคอย3ครั้ง', 'พบหอคอย3ครั้ง (เชิงสัญลักษณ์)', tower >= 3],
    ['death', 'ปิดบทเก่งขึ้น', 'พบการเปลี่ยนผ่าน3ครั้ง', counts[13] >= 3],
    ['sun', 'ได้ซีนจนชิน', 'พบดวงอาทิตย์3ครั้ง', counts[19] >= 3],
    ['moon', 'หมอกเป็นเพื่อนบ้าน', 'พบดวงจันทร์3ครั้ง', counts[18] >= 3],
    ['devil', 'เจอโซ่อีกแล้ว', 'พบพันธนาการ3ครั้ง', counts[15] >= 3],
    ['foil', 'ประกายไม่ซื้อเพิ่ม', 'พบประกายพิเศษครั้งแรก', foils.size >= 1],
    ['five-foils', 'วิบวับพอประมาณ', 'พบประกายพิเศษ5ใบ', foils.size >= 5],
    ['reverse', 'อ่านกลับหัวเป็นแล้ว', 'พบไพ่กลับหัว', reversed >= 1],
    ['ten-reverse', 'มุมกลับไม่ใช่เรื่องใหม่', 'พบไพ่กลับหัว10ครั้ง', reversed >= 10],
    ['four-topics', 'ถามครบโต๊ะ', 'อ่านครบ4หัวข้อ', topics.size >= 4],
    ['love', 'หัวใจมีประเด็น', 'อ่านความรัก10ครั้ง', (topics.get('love') || 0) >= 10],
    ['exam', 'ข้ออ้างหมดคิว', 'อ่านการเรียน10ครั้ง', (topics.get('exam') || 0) >= 10],
    [
      'weather',
      'มีร่มในเรื่องเล่า',
      'อ่านฟ้าเชิงสัญลักษณ์10ครั้ง',
      (topics.get('weather') || 0) >= 10,
    ],
    [
      'courts',
      'ราชสำนักมาประชุม',
      'พบคอร์ทครบ16ใบ',
      cards.every((c, i) => c.arcana !== 'minor' || c.number < 11 || unlocked.has(i)),
    ],
    ['week', 'นัดกับสำรับ', 'อ่านใน7วันต่างกัน', new Set(readings.map((r) => r.date)).size >= 7],
  ];
  const achievements = rows.map(([id, name, description, unlocked]) => ({
    id,
    name,
    description,
    unlocked,
  }));
  const earned = achievements.filter((a) => a.unlocked).length;
  return {
    readings: readings.length,
    faces,
    counts,
    unlocked,
    foils,
    most,
    favorite,
    reversedRatio: faces ? reversed / faces : 0,
    achievements,
    backs: [
      { id: 'classic' as const, name: 'ลายดาวเดิม', unlocked: true },
      { id: 'moon' as const, name: 'ม่านจันทร์', unlocked: unlocked.size >= 5 },
      { id: 'thorns' as const, name: 'เถาวัลย์ราตรี', unlocked: earned >= 10 },
      { id: 'solar' as const, name: 'สุริยันเปิดม่าน', unlocked: group('major') },
    ],
  };
}
