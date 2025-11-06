// components/SidebarMiddleLayer.jsx
'use client';
import SidebarFixed from './SidebarFixed';
import ContactForAdBox from './ContactForAdBox';

export default function SidebarMiddleLayer() {
  return (
    <div className="sidebar-middle-layer sticky top-7 flex flex-col gap-0 w-full flex-1">
      {/* תוכן הסיידר שמתעדכן */}
      <div className="flex-1">
        <SidebarFixed />
      </div>

      {/* שכבת יצירת קשר קבועה */}
      <div className=" bottom-0 bg-gray-900">
        <ContactForAdBox />
      </div>
    </div>
  );
}
