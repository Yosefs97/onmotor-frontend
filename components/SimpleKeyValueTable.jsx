// components/SimpleKeyValueTable.jsx
'use client';
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function SimpleKeyValueTable({ data }) {
  const isNested =
    Object.values(data)[0] && typeof Object.values(data)[0] === "object";

  // נפתח רק את הקטגוריה הראשונה כברירת מחדל
  const firstKey = isNested ? Object.keys(data)[0] : null;
  const [openSection, setOpenSection] = useState(firstKey);

  const handleToggle = (section) => {
    setOpenSection((prev) => (prev === section ? null : section)); // פתיחה אחת בלבד
  };

  // --- מצב היררכי (עם קטגוריות) ---
  if (isNested) {
    return (
      <div className="space-y-10 mt-6">
        {Object.entries(data).map(([section, values], idx) => {
          const isOpen = openSection === section;
          return (
            <div
              key={idx}
              className="border border-gray-400 rounded-lg shadow-sm transition-all"
            >
              {/* כותרת קטגוריה */}
              <div
                className="bg-gray-100 text-2xl font-bold text-red-700 px-4 py-3 border-b border-gray-400 cursor-pointer flex items-center justify-between"
                onClick={() => handleToggle(section)}
              >
                <span>{section}</span>
                <button
                  className="text-gray-700 hover:text-black flex items-center text-base"
                  aria-label={`פתח או סגור ${section}`}
                >
                  {isOpen ? (
                    <>
                      <FaChevronUp className="ml-2" /> סגור
                    </>
                  ) : (
                    <>
                      <FaChevronDown className="ml-2" /> פתח
                    </>
                  )}
                </button>
              </div>

              {/* טבלת הנתונים */}
              {isOpen && (
                <table className="w-full table-auto text-right border-t border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-xl border border-gray-300 px-4 py-2 font-bold w-1/3">
                        קטגוריה
                      </th>
                      <th className="text-xl border border-gray-300 px-4 py-2 font-bold w-2/3">
                        נתון
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(values).map(([key, value], subIdx) => (
                      <tr key={subIdx} className="hover:bg-gray-50">
                        <td className="text-lg border border-gray-300 px-4 py-2 font-semibold">
                          {key}
                        </td>
                        <td className="text-lg border border-gray-300 px-4 py-2">
                          {String(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}

        <p className="text-center text-gray-600 mt-3 text-lg">
          💡 ניתן ללחוץ על שם הקטגוריה כדי לפתוח או לסגור את המידע.
        </p>
      </div>
    );
  }

  // --- מצב שטוח (אין קטגוריות) ---
  return (
    <div className="overflow-x-auto mt-6">
      <table className="w-full table-auto border border-gray-400 text-right rounded-lg shadow-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-2xl border border-gray-400 px-4 py-2 font-bold w-1/3">
              קטגוריה
            </th>
            <th className="text-2xl border border-gray-400 px-4 py-2 font-bold w-2/3">
              נתון
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([key, value], idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="text-xl border border-gray-400 px-4 py-2 font-semibold">
                {key}
              </td>
              <td className="text-xl border border-gray-400 px-4 py-2">
                {String(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
