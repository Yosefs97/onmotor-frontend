// components/PasswordField.jsx
'use client';

import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function PasswordField({
  label = '',
  placeholder = 'סיסמה',
  value,
  onChange,
  className = '',
  onEnter = null, // ✅ מאפשר פעולה בלחיצת Enter
}) {
  const [visible, setVisible] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onEnter) {
      e.preventDefault();
      onEnter();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block mb-1 text-right text-sm text-gray-700">
          {label}
        </label>
      )}
      <input
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 border border-gray-300 rounded text-right text-sm pr-10 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black transition-transform duration-150"
        aria-label={visible ? 'הסתר סיסמה' : 'הצג סיסמה'}
      >
        {visible ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
      </button>
    </div>
  );
}
