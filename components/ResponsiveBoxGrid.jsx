//components\ResponsiveBoxGrid.jsx
'use client';
import React from 'react';

export default function ResponsiveBoxGrid({ children }) {
  return (
    <div className="w-full h-full max-w-[700px] px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-0  place-items-stretch">
        {React.Children.map(children, (child, index) => (
          <div key={index} className="w-full h-full">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
 