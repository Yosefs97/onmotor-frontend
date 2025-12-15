// components/SmartFilter.jsx
'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function SmartFilter({ filter }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // זיהוי המפתח של הפילטר ב-URL (נמצא בתוך values[0].input)
  // דוגמה ל-input שמגיע משופיפיי: '{"price":{"min":100}}' או מפתח מורכב.
  // אנחנו נסתמך על כך שה-API שלנו מחזיר input שאפשר להשתמש בו, 
  // או שנבנה את המפתח על בסיס ה-Label אם ה-input מורכב מדי.
  // לצורך הפשטות, נשתמש בזהות הפילטר כפי ששופיפיי מחזירה ב-Input בדרך כלל.

  const handleFilterChange = (inputStr, isChecked) => {
    // 1. יצירת עותק של הפרמטרים הנוכחיים
    const params = new URLSearchParams(searchParams.toString());
    
    // שופיפיי מחזירה ב-input מחרוזת JSON, למשל: '{"variantOption":{"name":"Size","value":"M"}}'
    // אנחנו צריכים לפרק את זה כדי לבנות URL נקי, או לשלוח את זה כמו שזה.
    // בגישה שבנינו ב-fetchCollection, אנחנו מצפים למפתחות כמו: filter.v.option.size
    
    // ניתוח ה-input כדי להבין על איזה מפתח ב-URL אנחנו עובדים
    let key, value;
    try {
      const parsed = JSON.parse(inputStr);
      // לוגיקה לחילוץ המפתח והערך מתוך ה-Input של שופיפיי
      if (parsed.variantOption) {
        key = `filter.v.option.${parsed.variantOption.name.toLowerCase()}`;
        value = parsed.variantOption.value;
      } else if (parsed.productMetafield) {
         key = `filter.p.m.${parsed.productMetafield.namespace}.${parsed.productMetafield.key}`;
         value = parsed.productMetafield.value;
      } else {
        // ברירת מחדל למקרים אחרים
        key = `filter.unknown`; 
        value = inputStr;
      }
    } catch (e) {
      // אם זה לא JSON, נשתמש ב-Label כמזהה (פחות מומלץ אבל עובד כגיבוי)
      key = `filter.${filter.label}`;
      value = inputStr;
    }

    // 2. קריאת הערכים הקיימים ב-URL עבור המפתח הזה
    const currentParam = params.get(key);
    let activeValues = [];
    
    if (currentParam) {
      try {
        // מנסים לפרסר מערך JSON, למשל ["M", "L"]
        activeValues = JSON.parse(currentParam);
        if (!Array.isArray(activeValues)) activeValues = [activeValues];
      } catch {
        // אם זה ערך בודד רגיל
        activeValues = [currentParam];
      }
    }

    // 3. הוספה או הסרה של הערך
    if (isChecked) {
      if (!activeValues.includes(value)) activeValues.push(value);
    } else {
      activeValues = activeValues.filter(v => v !== value);
    }

    // 4. עדכון ה-URL
    if (activeValues.length > 0) {
      // שומרים כמערך JSON כדי לתמוך בריבוי בחירות
      params.set(key, JSON.stringify(activeValues));
    } else {
      params.delete(key);
    }

    // 5. ביצוע הניווט (ללא גלילה למעלה)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // פונקציית עזר לבדוק אם צ'קבוקס צריך להיות מסומן
  const isChecked = (inputStr) => {
    try {
        const parsedInput = JSON.parse(inputStr);
        let key, val;
        
        if (parsedInput.variantOption) {
            key = `filter.v.option.${parsedInput.variantOption.name.toLowerCase()}`;
            val = parsedInput.variantOption.value;
        } else if (parsedInput.productMetafield) {
            key = `filter.p.m.${parsedInput.productMetafield.namespace}.${parsedInput.productMetafield.key}`;
            val = parsedInput.productMetafield.value;
        } else {
            return false;
        }

        const currentParam = searchParams.get(key);
        if (!currentParam) return false;
        
        // בדיקה אם הערך קיים בפרמטר (בין אם הוא סטרינג או מערך JSON)
        return currentParam.includes(val);
    } catch {
        return false;
    }
  };

  return (
    <div>
      <h4 className="font-bold text-gray-700 mb-2 text-sm">{filter.label}</h4>
      
      {/* רשימת צ'קבוקסים */}
      <ul className="space-y-1 pr-2 max-h-40 overflow-y-auto custom-scrollbar">
        {filter.values.map((val) => {
          const checked = isChecked(val.input);
          
          return (
            <li key={val.id} className="flex items-center gap-2">
              <input 
                type="checkbox"
                id={val.id}
                checked={checked}
                onChange={(e) => handleFilterChange(val.input, e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
              />
              <label htmlFor={val.id} className="text-sm text-gray-600 cursor-pointer flex-grow flex justify-between select-none">
                <span>{val.label}</span>
                <span className="text-xs text-gray-400">({val.count})</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}