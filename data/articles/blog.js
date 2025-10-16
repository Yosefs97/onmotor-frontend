const blogArticles = [
  {
    id: 201,
    slug: "helmet-reflections-001",
    title: "בקסדה: סיבוב של תובנות",
    headline: "מה עובר בראש ברגעים שבין הסיבוב לישורת?",
    description: "הרכיבה גורמת לנו לשאול שאלות – לא רק על הדרך, אלא על עצמנו.",
    subdescription: "מחשבות חופשיות על חופש, פחד, שליטה ושקט פנימי — הכל בתוך הקסדה.",
    href: "/articles/helmet-reflections-001",
    image: "/images/articles/helmet-reflections-001/main.jpg",
    imageSrc: "/images/articles/helmet-reflections-001/cover.jpg",
    galleryPath: "/images/articles/helmet-reflections-001/gallery",
    imageAlt: "קסדה מול שקיעה",

    category: "blog",
    subcategory: ["in-helmet"],

    display: {
      homepage: false,
      sidebar: true,
      mainSlider: false,
      newsletter: true
    },

    priority: 2,

    author: "יוסף סבג",
    date: "25.06.2025",
    time: "10:15",
    tags: ["בלוג", "בקסדה", "מחשבות", "רכיבה"],
        content: `
לפעמים, כשאני לוחץ על הסטרטר, אני לא מתכוון לצאת לרכיבה – אני מתכוון לחשוב.

🎧 בתוך הקסדה – אני פוגש את עצמי  
אין שם רעש של טלפונים, אין צפצופים של הודעות. רק הרוח, המנוע, והלב. במקומות האלה – כל מחשבה מקבלת ווליום.

😵 על פחד ושליטה  
בסיבוב חד, כשהאופנוע נוטה בזווית שאתה לא לגמרי בטוח בה, אתה מגלה מי אתה באמת: זה שמאיץ או זה שמרפה? זה שסומך על הצמיגים – או לא סומך על עצמו?

[[img:/images/articles/helmet-reflections-001/helmet-thought.jpg||בין הצללים – הכל מתחדד]]

🧘 חופש זה לא שקט, זה נוכחות  
הקסדה לא משתיקה – היא ממקדת. אתה מרגיש כל תנועה, כל החלטה, כל דופק. ואתה שואל את עצמך שאלות:  
– למה אני רוכב?  
– ממה אני בורח?  
– מה אני מחפש?

🚦 לסיכום  
הכביש לא תמיד עונה, אבל הוא תמיד מקשיב. והקסדה? היא מגבירה את כל מה שאתה מנסה להחביא.  
אז פעם הבאה שתצא לסיבוב – שאל את עצמך: איזה רעש אתה מוכן לשמוע?

—  
יוסף סבג | בקסדה`,
    
    tableData: {
      "משך הרכיבה": "45 דקות",
      "אזור רכיבה": "הרי ירושלים",
      "טמפרטורה": "28°",
      "מהירות ממוצעת": "63 קמ\"ש",
      "קסדה": "AGV K6",
      "אופנוע": "Yamaha MT-07",
    }
  },
  {
  id: 202,
  slug: "everyday-rider",
  title: "על הנייר: מחשבות של רוכב יומיומי",
  headline: "הקסדה יורדת, אבל הרעש נשאר – מסע בין עיר לצומת",
  description: "מה קורה כשאופנוע הופך לחלק בלתי נפרד מהשגרה? כמה תובנות בין רמזור לקפה.",
  subdescription: "מסע פנימי חצי רומנטי, חצי עצבני – כולו דו״גלי.",
  href: "/articles/everyday-rider",
  image: "/images/articles/everyday-rider/main.jpg",
  imageSrc: "/images/articles/everyday-rider/cover.jpg",
  galleryPath: "/images/articles/everyday-rider/gallery",
  imageAlt: "רוכב עירוני שותה קפה",

  category: "blog",
  subcategory: ["paper"],

  display: {
    homepage: true,
    sidebar: false,
    mainSlider: false,
    newsletter: true
  },

  priority: 3,

  author: "יוסף סבג",
  date: "23.06.2025",
  time: "08:40",
  tags: ["בלוג", "על הנייר", "רכיבה עירונית"],

  content: `
🚦 הבוקר התחיל כמו כל בוקר  
הפסקת קפה, פקק ביציאה מהשכונה, ואז שקט.  
רק אני והאופנוע. הכביש הופך לאולפן של מחשבות.

💭 על התחלה וסוף  
כל סיבוב נהיה טקס. כל עצירה בשמש האורבנית – הרהור.  
אני חושב על הרגעים הקטנים: הילוך ראשון שמחליק חלק, מבט מהולך רגל, קריצה מהשליח.

[[img:/images/articles/everyday-rider/thinking.jpg||בין תחנה לתחנה – סיפור מתרקם]]

🛠 השגרה היא ההרפתקה  
לא צריך טיול במדבר. מספיק כביש סואן עם קסדה על הראש ואוזן חדה לעצמך.

—  
יוסף סבג | על הנייר`,
tableData: {
      "משך הרכיבה": "45 דקות",
      "אזור רכיבה": "הרי ירושלים",
      "טמפרטורה": "28°",
      "מהירות ממוצעת": "63 קמ\"ש",
      "קסדה": "AGV K6",
      "אופנוע": "Yamaha MT-07",
},
},
{
  id: 203,
  slug: "interview-01-shai-bar",
  title: "אחד על אחד: שי בר – איך הרוח נהפכה לדרך",
  headline: "פודקאסט אישי עם רוכב שלקח את האופנוע עד למזרח הרחוק וחזר עם תובנות עמוקות",
  description: "מה קורה כשאתה רוכב לבד חודשיים על אופנוע בתאילנד? שי בר משתף את המסע, הרגעים הקשים – וגם את הקסומים.",
  subdescription: "ראיון עם אדם שמצא חופש בצורת גלגלים – וחזר כדי לספר.",
  href: "/articles/interview-01-shai-bar",
  image: "/images/articles/interview-01-shai-bar/main.jpg",
  imageSrc: "/images/articles/interview-01-shai-bar/cover.jpg",
  galleryPath: "/images/articles/interview-01-shai-bar/gallery",
  imageAlt: "שי בר ברכיבה במזרח",

  category: "blog",
  subcategory: ["podcast"],

  display: {
    homepage: false,
    sidebar: true,
    mainSlider: true,
    newsletter: false
  },

  priority: 4,

  author: "יוסף סבג",
  date: "20.06.2025",
  time: "17:10",
  tags: ["פודקאסט", "אחד על אחד", "הרפתקה"],

  content: `
🎙 "מה הרגע שהכי פחדת בו?"  
"כשנפל לי האופנוע ליד נהר בלי נפש חיה מסביב. לקח לי שעה להרים אותו לבד. ואז צחקתי."

🌏 חוצה גבולות  
שי בר יצא למסע במזרח בלי תוכנית, רק עם אופנוע ישן, תרמיל וקסדה.  
הוא ישן אצל זרים, אכל מהשוק, ורכב 4,000 ק"מ בלי לדעת מה מחכה מעבר לסיבוב.

[[img:/images/articles/interview-01-shai-bar/river.jpg||רגע של שקט באמצע שום מקום]]

🧠 שיעור לחיים  
"ברגע שאתה לומד לא לפחד מהלא נודע – אתה מתחיל לחיות באמת."

—  
יוסף סבג | אחד על אחד`,
tableData: {
      "משך הרכיבה": "45 דקות",
      "אזור רכיבה": "הרי ירושלים",
      "טמפרטורה": "28°",
      "מהירות ממוצעת": "63 קמ\"ש",
      "קסדה": "AGV K6",
      "אופנוע": "Yamaha MT-07",
}
},
{
    id: 204,
    slug: "offroad-summer-tips",
    title: "איך לשרוד רכיבת שטח בקיץ הישראלי",
    headline: "לא רק מים: טיפים שישמרו עליך חד ויציב במסלול המאובק",
    description: "החום, האבק והעייפות – הנה כללי הזהב שיעזרו לך לרכב בבטחה גם ב־40 מעלות.",
    subdescription: "מדריך קצר לרוכבים בקיץ הלוהט.",
    href: "/articles/offroad-summer-tips",
    image: "/images/articles/offroad-summer-tips/hero.jpg",
    imageSrc: "/images/articles/offroad-summer-tips/hero-full.jpg",
    galleryPath: "/images/articles/offroad-summer-tips/gallery",
    imageAlt: "רוכב שטח בקיץ הלוהט",
    category: "blog",
    subcategory: ["tips"],

    display: {
    homepage: true,
    sidebar: false,
    mainSlider: false,
    newsletter: true
  },

  priority: 3,
    author: "יוסף סבג",
    date: "23.06.2025",
    time: "18:30",
    tags: ["שטח", "קיץ", "מים", "טיפים"],
    content: `
☀️ שתייה לפני – לא רק במהלך  
התחל לשתות מים לפחות שעתיים לפני הרכיבה. הגוף לא מתמלא בנוזלים מיד, זה לוקח זמן.

🧢 ציוד מתאים – אווירודינמיקה לא מספיקה  
לבוש מאוורר, אפוד מים, כובע רכיבה מתחת לקסדה – הם ההבדל בין טיול מהנה לפינוי באמבולנס.

💤 דע מתי לפרוש  
חום גבוה + דופק גבוה = סכנה אמיתית. אין בושה לעשות הפסקה או אפילו לחזור.

[[img:/images/articles/offroad-summer-tips/hero.jpg||קיץ בשטח – לא לכולם מתאים]]

🚨 סימנים מקדימים  
כאבי ראש, בחילה, עייפות לא מוסברת – אלה לא סימנים להתעלם מהם. זה הגוף שלך שמדבר.
    `,
  },

];

export default blogArticles;
