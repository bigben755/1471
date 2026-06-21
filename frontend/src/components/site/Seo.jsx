import { useEffect } from "react";

const setMeta = (name, content, attr = "name") => {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

// Per-page title/description + optional FAQ JSON-LD.
export const Seo = ({ title, description, faqs }) => {
  useEffect(() => {
    if (title) {
      document.title = title;
      setMeta("og:title", title, "property");
    }
    if (description) {
      setMeta("description", description);
      setMeta("og:description", description, "property");
    }
  }, [title, description]);

  useEffect(() => {
    if (!faqs) return;
    const data = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };
    let s = document.getElementById("ld-faq");
    if (!s) {
      s = document.createElement("script");
      s.type = "application/ld+json";
      s.id = "ld-faq";
      document.head.appendChild(s);
    }
    s.textContent = JSON.stringify(data);
    return () => { s && s.remove(); };
  }, [faqs]);

  return null;
};
