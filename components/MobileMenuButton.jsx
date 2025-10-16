//components\MobileMenuButton.jsx
'use client';
import React from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function MobileMenuButton({ isOpen, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="absolute top-2 right-3 z-50 lg:hidden"
      aria-label={isOpen ? 'סגור תפריט' : 'פתח תפריט'}
    >
      {isOpen ? <FaTimes /> : <FaBars />}
    </button>
  );
}
