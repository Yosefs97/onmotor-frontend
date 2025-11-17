"use client";
import { useEffect } from "react";

export default function SocialScripts() {
  useEffect(() => {
    // {// Facebook
    //if (!document.getElementById("facebook-embed-script")) {
    //  const s = document.createElement("script");
     // s.id = "facebook-embed-script";
    //  s.async = true;
    //  s.defer = true;
    //  s.crossOrigin = "anonymous";
    //  s.src = "https://connect.facebook.net/he_IL/sdk.js#xfbml=1&version=v18.0";
    //  document.body.appendChild(s);
    //}

    // Twitter/X
    if (!document.getElementById("twitter-embed-script")) {
      const s = document.createElement("script");
      s.id = "twitter-embed-script";
      s.async = true;
      s.src = "https://platform.twitter.com/widgets.js";
      document.body.appendChild(s);
    }

    // TikTok
    if (!document.getElementById("tiktok-embed-script")) {
      const s = document.createElement("script");
      s.id = "tiktok-embed-script";
      s.async = true;
      s.src = "https://www.tiktok.com/embed.js";
      document.body.appendChild(s);
    }
  }, []);

  return null; // לא מרנדר כלום למסך
}
