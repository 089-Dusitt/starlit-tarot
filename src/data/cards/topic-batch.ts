import type { Pair } from './phase2-types';
export interface TopicEntry {
  index: number;
  meanings: Pair;
  bite: Pair;
}
export function topicBatch(offset: number, text: string): TopicEntry[] {
  return text
    .trim()
    .split('\n')
    .map((line, index) => {
      const fields = line
        .trim()
        .split('|')
        .map((s) => s.trim());
      if (fields.length !== 4 || fields.some((s) => !s))
        throw Error(`Incomplete topic row ${offset + index}`);
      return {
        index: offset + index,
        meanings: { upright: fields[0], reversed: fields[1] },
        bite: { upright: fields[2], reversed: fields[3] },
      };
    });
}
