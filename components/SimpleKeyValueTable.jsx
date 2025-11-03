// components/SimpleKeyValueTable.jsx
'use client';
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function SimpleKeyValueTable({ data }) {
  const isNested = Object.values(data)[0] && typeof Object.values(data)[0] === "object";
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
          {isNested ? (
            // מצב היררכי
            Object.entries(data).map(([section, values], idx) => (
              <React.Fragment key={idx}>
                <tr
                  className="bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors"
                  onClick={() => toggleSection(section)}
                >
                  <td
                    colSpan="2"
                    className="text-xl font-bold border border-gray-400 px-4 py-3 flex items-center justify-between"
                  >
                    <span className="text-red-700">{section}</span>
                    <button
                      className="text-gray-700 hover:text-black flex items-center text-base"
                      aria-label={`פתח או סגור ${section}`}
                    >
                      {openSections[section] ? (
                        <>
                          <FaChevronUp className="ml-2" /> סגור
                        </>
                      ) : (
                        <>
                          <FaChevronDown className="ml-2" /> פתח
                        </>
                      )}
                    </button>
                  </td>
                </tr>

                <tr>
                  <td colSpan="2" className="p-0">
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        openSections[section] ? "max-h-[2000px]" : "max-h-0"
                      }`}
                    >
                      <table className="w-full">
                        <tbody>
                          {Object.entries(values).map(([key, value], subIdx) => (
                            <tr key={`${idx}-${subIdx}`} className="hover:bg-gray-50">
                              <td className="text-xl border border-gray-300 px-4 py-2 font-semibold w-1/3">
                                {key}
                              </td>
                              <td className="text-xl border border-gray-300 px-4 py-2 w-2/3">
                                {typeof value === "object" ? JSON.stringify(value, null, 2) : value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))
          ) : (
            // מצב רגיל
            Object.entries(data).map(([key, value], idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="text-xl border border-gray-400 px-4 py-2 font-semibold">
                  {key}
                </td>
                <td className="text-xl border border-gray-400 px-4 py-2">
                  {typeof value === "object" ? JSON.stringify(value, null, 2) : value}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {isNested && (
        <p className="text-center text-gray-600 mt-3 text-lg">
          💡 ניתן ללחוץ על שם הקטגוריה או על הכפתור <span className="font-bold">"פתח / סגור"</span> כדי לצפות בפרטים.
        </p>
      )}
    </div>
  );
}
