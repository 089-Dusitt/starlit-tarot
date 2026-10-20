export function needsSupport(question: string): boolean {
  const normalized = question
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\u0e4d\u0e32/g, 'ำ')
    .replace(/[\u200b-\u200d\ufeff]/g, '')
    .replace(/\s+/g, ' ');
  const thai = normalized.replace(/\s/g, '');
  return (
    /ฆ่าตัวตาย|อยากตาย|ไม่อยาก(?:มีชีวิต|อยู่(?:บนโลก)?(?:นี้)?ต่อ)|ทำร้าย(?:ตัวเอง|ตนเอง)|จบชีวิต/.test(
      thai,
    ) ||
    /suicid|self[ -]?harm|kill\s+(?:myself|me)|end\s+my\s+life|want\s+to\s+die|don'?t\s+want\s+to\s+live|(?:cut|hurt)\s+myself/i.test(
      normalized,
    )
  );
}
