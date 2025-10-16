// components/SidebarConstants.jsx
'use client';
import React from 'react';
import PriceCheckBox from './PriceCheckBox';
import NewsletterBox from './NewsletterBox';
import GuideBox from './GuideBox';
import FollowUsBox from './FollowUsBox';
import IroadsBox from './IroadsBox';
import ProfessionalsBox from './ProfessionalsBox';
import TabLeftSidebar from './TabLeftSidebar';

export default function SidebarConstants() {
  return (
    <div className="bg-gray-900 p-2 space-y-2 relative sticky top-0 bottom-0">
      <TabLeftSidebar />
      <hr className="border-t-2 border-red-600 my-1" />
      <PriceCheckBox />
      <hr className="border-t-2 border-red-600 my-3" />
      <NewsletterBox />
      <hr className="border-t-2 border-red-600 my-3" />
      <GuideBox />
      <hr className="border-t-2 border-red-600 my-3" />
      <FollowUsBox />
      <hr className="border-t-2 border-red-600 my-3" />
      <IroadsBox />
      <hr className="border-t-2 border-red-600 my-1" />
      <ProfessionalsBox />
      <hr className="border-t-2 border-red-600 my-1" />

      {/* אפשר להוסיף כאן קבועים נוספים */}
    </div>
  );
}
