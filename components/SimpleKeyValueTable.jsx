'use client';
import React from "react";

export default function SimpleKeyValueTable({ data }) {
  return (
    <div className="overflow-x-auto mt-6">
      <table className="w-full table-auto border border-gray-400 text-right">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-2xl border border-gray-400 px-4 py-2 font-bold">קטגוריה</th>
            <th className="text-2xl border border-gray-400 px-4 py-2 font-bold">נתון</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([key, value], idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="text-xl border border-gray-400 px-4 py-2 font-semibold">{key}</td>
              <td className="text-xl border border-gray-400 px-4 py-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
