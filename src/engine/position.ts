import type { Persona, TarotCard, Topic } from '../data/types';
const frames: Record<Persona, { strength: string; caution: string; other: string }> = {
  blunt: {
    strength: 'ช่องจุดแข็งชี้สิ่งที่คุณจับสัญญาณได้ก่อนเสียเวลาเพิ่ม ดูราคาของเรื่องนี้ให้ชัด',
    caution: 'ไพ่ดีอยู่ในช่องระวัง ให้ดูด้านที่ใช้เกินพอดี',
    other: 'ไพ่ไม่ได้อ่านใจเขา ช่องนี้เอาไว้ตั้งคำถาม ไม่ใช่ตั้งข้อหา',
  },
  oracle: {
    strength: 'เงาในช่องจุดแข็งคือสิ่งที่คุณเริ่มเห็นรูป จงรู้ว่ารอยร้าวอยู่ตรงไหนก่อนก้าว',
    caution: 'แสงในช่องอุปสรรคอาจสว่างจนบังขอบทาง ลองมองเงาอีกด้าน',
    other: 'ประตูของอีกฝ่ายยังปิด ไพ่ส่องได้เพียงคำถามที่คุณจะนำไปเคาะ',
  },
  bestie: {
    strength: 'แก ไพ่หนักมาอยู่ช่องจุดแข็ง เพราะจับปัญหาให้ทันก็เป็นทักษะ แต่อย่ารับบทแบกเก่งต่อ',
    caution: 'ไพ่ดีมาอยู่ช่องระวัง แกลองดูว่าข้อดีถูกใช้เกินขนาดตรงไหน',
    other: 'แก ไพ่ไม่ได้แอบอ่านแชทเขา ช่องนี้ให้ถามตรงๆ ไม่ใช่เดาแทน',
  },
  mu: {
    strength: 'แม่หมออ่านช่องจุดแข็งว่าให้รู้ทันจุดติดขัด ไม่ต้องรับความหนักนี้ไว้เป็นเครื่องราง',
    caution: 'ไพ่สว่างมาอยู่ช่องระวัง แม่หมอขอให้ดูด้านที่มากเกินพอดี',
    other: 'แม่หมอไม่มีเคล็ดอ่านใจคนอื่น ช่องนี้เก็บไว้ถามจากเหตุการณ์จริง',
  },
  gentle: {
    strength:
      'เมื่อไพ่หนักอยู่ในช่องจุดแข็ง ลองมองความสามารถในการสังเกตข้อจำกัดนี้โดยไม่ต้องแบกเพิ่ม',
    caution: 'ในช่องอุปสรรค ไพ่ด้านดีอาจชวนดูว่าส่วนไหนกำลังมากเกินพอดี',
    other: 'ช่องของอีกฝ่ายเป็นเพียงมุมให้สำรวจร่วมกัน ความรู้สึกจริงต้องฟังจากเขา',
  },
};
export function positionFrame(
  card: TarotCard,
  reversed: boolean,
  topic: Topic,
  label: string,
  persona: Persona,
): string {
  const tone = card.tone[reversed ? 'reversed' : 'upright'];
  if (/อีกฝ่าย/.test(label)) return frames[persona].other;
  if (/จุดแข็ง/.test(label) && tone < 0) return `${frames[persona].strength} — “${card.name.th}”`;
  if (/อุปสรรค|ต้องระวัง|สิ่งที่ขวาง/.test(label) && tone > 0)
    return `${frames[persona].caution}: ${card.bite[topic][reversed ? 'upright' : 'reversed']}`;
  return '';
}
