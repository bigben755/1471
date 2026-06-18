import { useEffect } from "react";
import { FAQS, LINKS, VENUE } from "../../data/content";

export const SeoSchema = () => {
  useEffect(() => {
    document.title = "1471 Horwich Squadron RAF Air Cadets | Horwich Air Cadets";

    const setMeta = (name, content, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const description =
      "Join 1471 Horwich Squadron RAF Air Cadets in Horwich. Aviation, adventure training, leadership, DofE, first aid, camps, sport and youth development for young people, with opportunities for adult volunteers.";
    setMeta("description", description);
    setMeta("keywords", "Horwich Air Cadets, RAF Air Cadets Horwich, 1471 Horwich Squadron, Air Cadets near Bolton, youth organisation Horwich, cadets Greater Manchester, aviation youth activities, adult volunteer RAF Air Cadets, Duke of Edinburgh Air Cadets, RAFAC squadron Horwich");
    setMeta("og:title", "1471 Horwich Squadron RAF Air Cadets", "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", "website", "property");

    const org = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "1471 Horwich Squadron RAF Air Cadets",
      alternateName: "1471 (Horwich) Squadron Air Training Corps",
      description,
      url: typeof window !== "undefined" ? window.location.origin : "",
      sameAs: [LINKS.national, LINKS.facebook],
      address: {
        "@type": "PostalAddress",
        streetAddress: "St Joseph's Secondary School & Sports College, Chorley New Road",
        addressLocality: "Horwich",
        addressRegion: "Greater Manchester",
        postalCode: "BL6 6HW",
        addressCountry: "GB",
      },
      areaServed: ["Horwich", "Bolton", "Greater Manchester"],
    };

    const faq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    const ids = ["ld-org", "ld-faq"];
    [org, faq].forEach((data, i) => {
      let s = document.getElementById(ids[i]);
      if (!s) {
        s = document.createElement("script");
        s.type = "application/ld+json";
        s.id = ids[i];
        document.head.appendChild(s);
      }
      s.textContent = JSON.stringify(data);
    });
  }, []);

  return null;
};
