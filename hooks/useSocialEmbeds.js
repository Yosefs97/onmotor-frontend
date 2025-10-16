// hooks/useSocialEmbeds.js
"use client";
import { useEffect } from "react";

export default function useSocialEmbeds(deps = []) {
  useEffect(() => {
    // Instagram
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }

    // Facebook
    if (window.FB) {
      window.FB.XFBML.parse();
    }

    // Twitter/X
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load();
    }
  }, deps);
}
