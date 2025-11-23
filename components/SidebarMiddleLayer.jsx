import SidebarFixed from './SidebarFixed';
import ContactForAdBox from './ContactForAdBox';

async function getSidebarAds() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/sidebar-middle`,
    { next: { revalidate: 120 } }
  );
  const json = await res.json();
  return json.items || [];
}

export default async function SidebarMiddleLayer() {
  const ads = await getSidebarAds();

  return (
    <div className="sidebar-middle-layer sticky top-7 flex flex-col gap-0 w-full flex-1">
      <div className="flex-1">
        <SidebarFixed ads={ads} />
      </div>
      <div className=" bottom-0 bg-gray-900">
        <ContactForAdBox />
      </div>
    </div>
  );
}
