import {it,expect} from 'vitest';
import {needsSupport} from './crisis';
it('catches Thai and English crisis wording while ordinary questions stay usable',()=>{for(const question of ['ฉันอยากตาย','กำลังคิดฆ่าตัวตาย','อยากทำร้ายตัวเอง','I want to die','I want to kill myself','self-harm','suicide'])expect(needsSupport(question)).toBe(true);expect(needsSupport('ควรเตรียมสอบอย่างไร')).toBe(false);expect(needsSupport('อยากดูแลความสัมพันธ์')).toBe(false);});
