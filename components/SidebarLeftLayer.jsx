// components/SidebarLeftLayer.jsx
'use client';
import React from 'react';

import SidebarLeftConstants from './SidebarLeftConstants';

// 👇 מקבל sidebarData
export default function SidebarLeftLayer({ sidebarData }) {
  return (
    <div className="w-full flex flex-col h-full">
      {/* השכבה של SidebarLeftConstants */}
      <div className="w-full flex-1 ">
        {/* 👇 מעביר הלאה לרכיב הקבועים (שלא שלחת לי, אבל הוא חייב לקבל את זה) */}
        <SidebarLeftConstants sidebarData={sidebarData} />
      </div>
    </div>
  );
}