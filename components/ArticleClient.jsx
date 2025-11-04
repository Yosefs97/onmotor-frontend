//components\ArticleClient.jsx
'use client';
import { useEffect } from "react";
import { usePage } from "@/contexts/PageContext";
import ArticleHeader from "@/components/ArticleHeader";
import SimpleKeyValueTable from "@/components/SimpleKeyValueTable";
import Tags from "@/components/Tags";
import SimilarArticles from "@/components/SimilarArticles";
import CommentsSection from "@/components/CommentsSection";
import Gallery from "@/components/Gallery";
import ScrollToTableButton from "@/components/ScrollToTableButton";
import ScrollToGalleryButton from "@/components/ScrollToGalleryButton";

export default function ArticleClient({ article, breadcrumbs, SITE_URL, renderParagraph }) {
  const { setTitle, setBreadcrumbs } = usePage();

  useEffect(() => {
    setTitle(article.title);
    setBreadcrumbs(breadcrumbs);
  }, [article.title, breadcrumbs, setTitle, setBreadcrumbs]);

  const paragraphs = Array.isArray(article.content)
    ? article.content
    : article.content.split("\n\n");

  return (
    <>
      <div
        className="mx-auto max-w-[740px] space-y-2 text-right leading-relaxed text-base text-gray-800 px-2"
        style={{ fontFamily: article.font_family }}
      >
        <ArticleHeader
          author={article.author}
          date={article.date}
          time={article.time}
          image={article.image}
          imageAlt={article.imageAlt}
          title={article.headline}
          subdescription={article.subdescription}
          tags={article.tags}
        />

        {article.description && (
          <p className="font-bold text-2xl text-gray-600">{article.description}</p>
        )}
        {article.subdescription && (
          <p className="second-description text-gray-700 text-[18px]">{article.subdescription}</p>
        )}

        {paragraphs.map(renderParagraph)}

        {article.tableData && (
          <div className="article-table-section">
            <SimpleKeyValueTable data={article.tableData} />
          </div>
        )}

        <div className="article-gallery-section">
          <Gallery
            images={article.gallery}
            externalImageUrls={article.externalImageUrls}
            externalMediaUrl={article.externalMediaUrl}
            external_media_links={article.external_media_links}
          />
        </div>

        <Tags tags={article.tags} />
        <SimilarArticles currentSlug={article.slug} category={article.category} />
        <CommentsSection articleUrl={`${SITE_URL}${article.href}`} />
      </div>

      <ScrollToTableButton />
      <ScrollToGalleryButton />
    </>
  );
}
