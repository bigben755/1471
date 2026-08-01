import { useEffect } from "react";

const TITLE_MAX = 60;
const DESC_MAX = 160;
const DESC_MIN = 120;
const DEFAULT_DESCRIPTION = "1471 Horwich Squadron RAF Air Cadets in Horwich for ages 12 to 17, with flying, adventure training, DofE, leadership and volunteer opportunities.";

const setMeta = (name, content, attr = "name") => {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const norm = (text = "") => text.replace(/\s+/g, " ").trim();

const clipToWord = (text, max) => {
  const base = norm(text);
  if (base.length <= max) return base;
  const soft = base.slice(0, max - 1);
  const cut = soft.lastIndexOf(" ");
  return `${(cut > 24 ? soft.slice(0, cut) : soft).trim()}...`;
};

const cleanTitle = (title) => {
  const base = norm(title);
  if (!base) return "1471 Horwich Squadron RAF Air Cadets";
  return clipToWord(base, TITLE_MAX);
};

const cleanDescription = (description) => {
  let base = norm(description || DEFAULT_DESCRIPTION);
  if (base.length < DESC_MIN) {
    base = `${base} Find out about parade nights, activities and how to join in Horwich.`;
  }
  return clipToWord(base, DESC_MAX);
};

// Per-page title/description + optional FAQ JSON-LD.
export const Seo = ({ title, description, faqs }) => {
  useEffect(() => {
    const safeTitle = cleanTitle(title);
    const safeDescription = cleanDescription(description);

    if (safeTitle) {
      document.title = safeTitle;
      setMeta("og:title", safeTitle, "property");
    }
    setMeta("description", safeDescription);
    setMeta("og:description", safeDescription, "property");
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
