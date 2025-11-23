import SidebarFixed from './SidebarFixed';
import ContactForAdBox from './ContactForAdBox';

const STRAPI_URL =
  process.env.STRAPI_API_URL ||
  process.env.NEXT_PUBLIC_STRAPI_API_URL;

async function getSidebarAds() {
  if (!STRAPI_URL) return [];

  const res = await fetch(
    `${STRAPI_URL}/api/sidebar-middles?populate=image&populate=video`,
    { next: { revalidate: 120 } }
  );

  if (!res.ok) return [];

  const json = await res.json();

  return (
    json.data?.map((item) => ({
      id: item.id,
      ...item.attributes,
    })) || []
  );
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
