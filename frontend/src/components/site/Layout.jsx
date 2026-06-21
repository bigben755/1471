import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LINKS } from "../../data/content";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Site-wide Organisation JSON-LD (injected once).
function OrgSchema() {
  useEffect(() => {
    const data = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "1471 Horwich Squadron RAF Air Cadets",
      alternateName: "1471 (Horwich) Squadron Air Training Corps",
      url: window.location.origin,
      sameAs: [LINKS.national, LINKS.facebook],
      address: {
        "@type": "PostalAddress",
        streetAddress: "St Joseph's Secondary School & Sports College, Chorley New Road",
        addressLocality: "Horwich", addressRegion: "Greater Manchester",
        postalCode: "BL6 6HW", addressCountry: "GB",
      },
      areaServed: ["Horwich", "Bolton", "Greater Manchester"],
    };
    let s = document.getElementById("ld-org");
    if (!s) {
      s = document.createElement("script");
      s.type = "application/ld+json";
      s.id = "ld-org";
      document.head.appendChild(s);
    }
    s.textContent = JSON.stringify(data);
  }, []);
  return null;
}

export const Layout = () => (
  <div>
    <ScrollToTop />
    <OrgSchema />
    <Header />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);
