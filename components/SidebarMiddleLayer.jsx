// components/SidebarMiddleLayer.jsx
import SidebarFixed from './SidebarFixed';
import ContactForAdBox from './ContactForAdBox';

async function getSidebarAds() {
  const base = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const url = `${base}/api/sidebar-middle`;

  const res = await fetch(url, {
    next: { revalidate: 120 },
    cache: "force-cache",
  });

  if (!res.ok) return [];
  const json = await res.json();
  return json.items || [];
}

export default async function SidebarMiddleLayer() {
  const ads = await getSidebarAds();

  return (
    <div className="sidebar-middle-layer sticky top-7 flex flex-col gap-0 w-full flex-1">
      
      {/* מודעות */}
      <div className="flex-1">
        <SidebarFixed ads={ads} />
      </div>

      {/* תיבת "צור קשר" */}
      <div className="bottom-0 bg-gray-900">
        <ContactForAdBox />
      </div>
    </div>
  );
}
