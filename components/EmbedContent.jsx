// components/EmbedContent.jsx
"use client";
import React, { useEffect } from "react";

export default function EmbedContent({ url }) {
  useEffect(() => {
    const loadScript = (id, src) => {
      if (!document.getElementById(id)) {
        const s = document.createElement("script");
        s.id = id;
        s.src = src;
        s.async = true;
        document.body.appendChild(s);
      }
    };

    loadScript("instagram-embed", "https://www.instagram.com/embed.js");
    loadScript("tiktok-embed", "https://www.tiktok.com/embed.js");
    loadScript("twitter-embed", "https://platform.twitter.com/widgets.js");

    const processAll = () => {
      window.instgrm?.Embeds?.process?.();
      window.FB?.XFBML?.parse?.();
      window.twttr?.widgets?.load?.();
    };
    const t = setTimeout(processAll, 800);
    return () => clearTimeout(t);
  }, [url]);

  const wrapperClass =
    "embed-box flex justify-center items-center mt-0 sm:mt-0 mb-0 w-full max-w-full text-center";

  // === YouTube ===
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    let videoId = "";
    if (url.includes("shorts/")) videoId = url.split("shorts/")[1]?.split("?")[0];
    else if (url.includes("watch?v=")) videoId = url.split("v=")[1]?.split("&")[0];
    else videoId = url.split("/").pop()?.split("?")[0];
    return (
      <div className={wrapperClass}>
        <div className="w-full max-w-[720px] aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            allowFullScreen
            title="YouTube Video"
            className="w-full h-full rounded-xl"
          />
        </div>
      </div>
    );
  }

  // === TikTok ===
  if (url.includes("tiktok.com")) {
    const videoId = url.split("/video/")[1]?.split("?")[0];
    return (
      <div className={wrapperClass}>
        <blockquote
          className="tiktok-embed"
          cite={url}
          data-video-id={videoId}
          style={{ maxWidth: "360px", minWidth: "320px", margin: 0 }}
        >
          <a href={url}></a>
        </blockquote>
      </div>
    );
  }

  // === Instagram ===
  if (url.includes("instagram.com")) {
    return (
      <div className={wrapperClass}>
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{ maxWidth: "400px", margin: "0 auto" }}
        />
      </div>
    );
  }


  // === Twitter / X ===
  if (url.includes("twitter.com") || url.includes("x.com")) {
    const fixedUrl = url.replace("x.com", "twitter.com");
    return (
      <div className={wrapperClass}>
        <blockquote className="twitter-tweet">
          <a href={fixedUrl}></a>
        </blockquote>
      </div>
    );
  }

  // === Default ===
  return (
    <div className={wrapperClass}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline break-words"
      >
        {url}
      </a>
    </div>
  );
}
