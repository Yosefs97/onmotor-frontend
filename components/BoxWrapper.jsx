// components/BoxWrapper.jsx
'use client';
import React from 'react';

export default function BoxWrapper({ children, className = "" }) {
  return (
    <div className={`bg-gray-900 border border-gray-900 shadow-sm flex justify-center items-center ${className}`}>
      {children}
    </div>
  );
}
