// utils/labelMap.js

// 🟥 תרגום קטגוריות כלליות
const labelMap = {
  news: 'חדשות',
  reviews: 'סקירות',
  gear: 'ציוד',
  blog: 'בלוג',
  tips: 'טיפים',
  local: 'חדשות מקומיות',
  global: 'חדשות מהעולם',
  machine: 'מכונות חדשות',
  racing: 'חדשות מרוצים',
  podcast: 'אחד על אחד (אנשים)',
  'in-helmet': 'בקסדה',
  paper: 'על הנייר',
  forum: 'פורום',
  laws: 'חוקים',
  'legal-articles': 'כתבות בנושא חוקיות',
  book: 'ספר החוקים - רלב"ד',
  'ask-question': 'שאל את הרלב"ד',
  tech: 'פורום טכני',
  rides: 'טיולים',
  sale: 'קנייה/מכירה',
  offroad: 'שטח',
  road: 'כביש',
  adventure: 'אדוונצ׳ר',
  custom: 'קסטום',
  video: 'סקירות וידאו',
  motorcycles: 'אופנועי מערכת',
  motorcyclestests: 'מבחני דרכים',



  // 🔽 חדשים - מדריכים
  guides: 'מדריכים',
  'guide-tech': 'מדריך טכני ותחזוקה',
  'guide-beginner': 'מדריך לרוכב המתחיל',
  'guide-advanced': 'מדריך לרוכב המתקדם',
};

// 🟨 תרגום דינמי לסלאגים של קטגוריות פורום
export function getForumLabel(slug = '') {
  if (slug.startsWith('forum-category-')) {
    const suffix = slug.replace('forum-category-', '');
    const translations = {
      rider: 'פורום לרוכבים',
      tech: 'פורום טכני',
      gear: 'פורום קנייה ומכירה',
    };
    return translations[suffix] || `פורום ${suffix}`;
  }
  return labelMap[slug] || slug;
}

// 🟦 לינקים (לא חובה לשנות כרגע)
const linkLabelMap = {
  news: 'לכל החדשות',
  reviews: 'לכל הסקירות',
  gear: 'לסקירות ציוד',
  blog: 'לבלוג המלא',
  tips: 'לטיפים נוספים',
  forum: 'לפורום',
  local: 'לחדשות מקומיות',
  global: 'לחדשות מהעולם',
  machine: 'למכונות חדשות',
  podcast: 'לפודקאסט אחד על אחד',
  'in-helmet': 'לבלוג בקסדה',
  video: 'לסקירות וידאו',
  motorcycles: 'לסקירות אופנועים',
  tech: 'לפורום טכני',
  rides: 'לפורום טיולים',
  sale: 'לפורום מכירה',

  guides: 'לכל המדריכים',
  'guide-tech': 'למדריך הטכני',
  'guide-beginner': 'למדריך לרוכב המתחיל',
  'guide-advanced': 'למדריך לרוכב המתקדם',
};

export { labelMap, linkLabelMap };
