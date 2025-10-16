// components\SidebarLeftLayer.jsx
'use client';
import React from 'react';

import SidebarLeftConstants from './SidebarLeftConstants';

export default function SidebarLeftLayer() {
  return (
    <div className="w-full flex flex-col h-full">
      {/* השכבה של SidebarLeftConstants */}
      <div className="w-full flex-1 ">
        <SidebarLeftConstants />
      </div>
    </div>
  );
}
