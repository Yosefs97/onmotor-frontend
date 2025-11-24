// components\SidebarLeftConstants.jsx

'use client';
import React from 'react';
import PriceCheckBox from './PriceCheckBox';
import NewsletterBox from './NewsletterBox';
import GuideBox from './GuideBox';
import FollowUsBox from './FollowUsBox';
import IroadsBox from './IroadsBox';
import ProfessionalsBox from './ProfessionalsBox';
import TabLeftSidebar from './TabLeftSidebar';

// 👇 מקבל sidebarData
export default function SidebarConstants({ sidebarData }) {
  const iroadsArticles = sidebarData?.iroads || [];
  return (
    <div className="bg-gray-900 p-2 space-y-2 relative sticky top-0 bottom-0">
      
      {/* 👇 הנה היעד הסופי! מעבירים את הנתונים כ-initialData */}
      <TabLeftSidebar initialData={sidebarData} />
      
      <hr className="border-t-2 border-red-600 my-1" />
      <PriceCheckBox />
      <hr className="border-t-2 border-red-600 my-3" />
      <NewsletterBox />
      <hr className="border-t-2 border-red-600 my-3" />
      <GuideBox />
      <hr className="border-t-2 border-red-600 my-3" />
      <FollowUsBox />
      <hr className="border-t-2 border-red-600 my-3" />
      <IroadsBox initialArticles={iroadsArticles} />
      <hr className="border-t-2 border-red-600 my-1" />
      <ProfessionalsBox />
      <hr className="border-t-2 border-red-600 my-1" />

    </div>
  );
}