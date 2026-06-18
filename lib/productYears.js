// /lib/productYears.js
export function getProductYearRange(productNode) {
  const mf = productNode?.metafields || [];

  // 👇 התיקון כאן: הוספנו בדיקה ש-m קיים (m && ...) לפני שניגשים ל-key
  const find = (k) =>
    mf.find((m) => m && m.key === k && m.namespace === 'compatibility')?.value;

  let from = find('year_from') ? parseInt(find('year_from'), 10) : null;
  let to = find('year_to') ? parseInt(find('year_to'), 10) : null;

  // אם רק אחת מהשנים קיימת – נניח שהיא גם ההתחלה וגם הסוף
  if (from != null && to == null) to = from;
  if (to != null && from == null) from = to;

  // אם יש ערכים הפוכים – נהפוך אותם
  if (from != null && to != null && to < from) [from, to] = [to, from];

  return { from, to };
}

// alias לשם הישן – שלא יישבר לך בקוד
export const getYearRangeFromMetafields = getProductYearRange;

export function formatYearRange(range) {
  // הגנה נוספת למקרה ש-range הוא null
  if (!range) return null;
  
  const { from, to } = range;

  if (from == null && to == null) return null;
  if (from === to) return String(from);
  
  // 🔥 התיקון כאן: הוספת תגית LRM סמויה (\u200E) 
  // כדי למנוע היפוך של השנים בתצוגה מימין לשמאל (RTL)
  return `\u200E${from}–${to}\u200E`;
}