import { Faq } from "../../components/site/Faq";
import { Seo } from "../../components/site/Seo";
import { FAQS } from "../../data/content";

export default function FaqPage() {
  return (
    <div data-testid="faq-page">
      <Seo
        title="FAQ | 1471 Horwich Squadron RAF Air Cadets"
        description="Frequently asked questions about RAF Air Cadets in Horwich, including joining age, flying, DofE, parade nights, parent guidance, volunteering routes and where to send enquiries."
        faqs={FAQS}
      />
      <Faq />
    </div>
  );
}
