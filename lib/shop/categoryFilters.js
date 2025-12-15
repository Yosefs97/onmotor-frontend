// /lib/categoryFilters.js

export const CATEGORY_FILTERS = {
  // 1. כביש (Handle: road)
  'road': { 
    title: 'כביש',
    groups: [
      {
        title: 'ציוד רכיבה',
        key: 'gear',
        options: [
          { label: 'קסדות כביש', tag: 'road-helmets' },
          { label: 'מעילי רכיבה', tag: 'road-jackets' },
          { label: 'כפפות', tag: 'road-gloves' },
          { label: 'מגפיים', tag: 'road-boots' },
          { label: 'מכנסיים', tag: 'road-pants' },
          { label: 'חליפות', tag: 'road-suits' },
        ]
      },
      {
        title: 'אביזרים',
        key: 'accessories',
        options: [
          { label: 'דיבוריות', tag: 'intercoms' },
          { label: 'מנעולים', tag: 'locks' },
          { label: 'כיסויים', tag: 'covers' },
        ]
      },
      {
        title: 'חלקי חילוף',
        key: 'parts',
        options: [
          { label: 'איתור חלפים לאופנוע', href: '/shop' }, 
        ]
      }
    ]
  },

  // 2. שטח (Handle: offroad)
  'offroad': {
    title: 'שטח',
    groups: [
      {
        title: 'ציוד רכיבה',
        key: 'gear',
        options: [
          { label: 'קסדות שטח', tag: 'offroad-helmets' },
          { label: 'חליפות שטח', tag: 'offroad-suits' },
          { label: 'כפפות שטח', tag: 'offroad-gloves' },
          { label: 'מגפי שטח', tag: 'offroad-boots' },
          { label: 'משקפי אבק', tag: 'goggles' },
        ]
      },
      {
        title: 'אביזרים',
        key: 'accessories',
        options: [
          { label: 'תיקי מים', tag: 'hydration-packs' },
          { label: 'מיגונים לאופנוע', tag: 'bike-protection' },
        ]
      },
      {
        title: 'חלקי חילוף',
        key: 'parts',
        options: [
          { label: 'איתור חלפים לאופנוע', href: '/shop' }, 
        ]
      }
    ]
  },
  
  // 3. צמיגים (Handle: tires)
  'tires': {
    title: 'צמיגים',
    groups: [
      {
        title: 'סוגי צמיגים',
        key: 'types',
        options: [
          { label: 'שטח / אינדורו', tag: 'enduro-tires' },
          { label: 'כביש', tag: 'road-tires' },
          { label: 'דו-שימושי', tag: 'adv-tires' },
          { label: 'טרקטורונים', tag: 'atv-tires' },
        ]
      },
      {
        title: 'אביזרים',
        key: 'acc',
        options: [
          { label: 'מוסים ופנימיות', tag: 'tubes-mousses' },
        ]
      }
    ]
  },

  // 4. שמנים (Handle: oils)
  'oils': {
    title: 'שמנים ותוספים',
    groups: [
      {
        title: 'שמנים',
        key: 'types',
        options: [
          { label: 'שמן מנוע 4 פעימות', tag: 'oil-4t' },
          { label: 'שמן מנוע 2 פעימות', tag: 'oil-2t' },
          { label: 'תרסיס לשרשרת', tag: 'chain-lube' },
        ]
      }
    ]
  }
};