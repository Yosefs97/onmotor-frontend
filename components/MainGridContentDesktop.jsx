// components/MainGridContentDesktop.jsx
import React from "react";
import ArticleCard from "./ArticleCards/ArticleCard";
import SectionWithHeader from "./SectionWithHeader";

const PLACEHOLDER_IMG = "/default-image.jpg";

function resolveImageUrl(rawUrl, API_URL) {
  if (!rawUrl) return PLACEHOLDER_IMG;
  if (rawUrl.startsWith("http")) return rawUrl;
  return `${API_URL}${rawUrl.startsWith("/") ? rawUrl : `/uploads/${rawUrl}`}`;
}

function getMainImage(attrs, API_URL) {
  let mainImage = PLACEHOLDER_IMG;
  let mainImageAlt = attrs.title || "תמונה ראשית";

  if (attrs.image?.data?.attributes?.url) {
    mainImage = resolveImageUrl(attrs.image.data.attributes.url, API_URL);
    mainImageAlt = attrs.image.data.attributes.alternativeText || mainImageAlt;
  } else if (attrs.image?.url) {
    mainImage = resolveImageUrl(attrs.image.url, API_URL);
    mainImageAlt = attrs.image.alternativeText || mainImageAlt;
  } else if (attrs.gallery?.[0]?.url) {
    mainImage = resolveImageUrl(attrs.gallery[0].url, API_URL);
    mainImageAlt = attrs.gallery[0].alternativeText || mainImageAlt;
  } else if (
    Array.isArray(attrs.external_media_links) &&
    attrs.external_media_links.length > 0
  ) {
    const valid = attrs.external_media_links.filter(
      (l) => typeof l === "string" && l.startsWith("http")
    );
    if (valid.length > 1) mainImage = valid[1].trim();
    else if (valid.length > 0) mainImage = valid[0].trim();
    mainImageAlt = "תמונה ראשית מהמדיה החיצונית";
  }

  return { mainImage, mainImageAlt };
}

export default function MainGridContentDesktop({ articles }) {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  const desiredOrder = ["news", "reviews", "blog", "gear"];

  const categories = [...new Set(articles.map((a) => a.category))].sort(
    (a, b) => desiredOrder.indexOf(a) - desiredOrder.indexOf(b)
  );

  return (
    <div className="bg-white p-0 shadow space-y-0">
      {categories.map((category) => {
        const articlesInCategory = articles
          .filter((a) => a.category === category && a.slug)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);

        if (articlesInCategory.length < 5) return null;

        const [first, second, third, fourth, fifth] = articlesInCategory.map(
          (item) => {
            const { mainImage, mainImageAlt } = getMainImage(item, API_URL);
            return { ...item, image: mainImage, imageAlt: mainImageAlt };
          }
        );

        return (
          <div key={category} className="space-y-0">
            <SectionWithHeader title={category} href={`/${category}`} />

            {/* דסקטופ */}
            <div className="hidden md:grid grid-cols-3 gap-0 w-full">
              <div className="col-span-1">
                <ArticleCard article={first} size="medium" />
              </div>
              <div className="col-span-2">
                <ArticleCard article={second} size="large" />
              </div>
              <div className="col-span-1">
                <ArticleCard article={third} size="small" />
              </div>
              <div className="col-span-1">
                <ArticleCard article={fourth} size="small" />
              </div>
              <div className="col-span-1">
                <ArticleCard article={fifth} size="small" />
              </div>
            </div>

            {/* מובייל */}
            <div className="md:hidden w-full space-y-0">
              <ArticleCard article={first} size="large" />

              <div className="grid grid-cols-2 gap-0">
                <ArticleCard article={second} size="small" />
                <ArticleCard article={third} size="small" />
              </div>

              <div className="grid grid-cols-2 gap-0">
                <ArticleCard article={fourth} size="small" />
                <ArticleCard article={fifth} size="small" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
