import { th } from '../i18n/th';
import type { Topic } from './types';
import type { IconName } from '../components/Icon';
export const topics: Record<
  Topic,
  { name: string; en: string; desc: string; placeholder: string; icon: IconName; accent: string }
> = {
  love: { ...th.topics.love, icon: 'love', accent: '#ff8fb1' },
  exam: { ...th.topics.exam, icon: 'exam', accent: '#5fe0c1' },
  weather: { ...th.topics.weather, icon: 'cloud', accent: '#7cc8ff' },
  general: { ...th.topics.general, icon: 'sparkles', accent: '#e6c36a' },
};
export const isTopic = (value: unknown): value is Topic =>
  typeof value === 'string' && Object.hasOwn(topics, value);
