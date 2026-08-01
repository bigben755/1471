import { Faq } from "../../components/site/Faq";
import { Seo } from "../../components/site/Seo";
import { FAQS } from "../../data/content";

export default function FaqPage() {
  return (
    <div data-testid="faq-page">
      <Seo
        title="FAQ | 1471 Horwich Squadron RAF Air Cadets in Horwich"
        description="Frequently asked questions about joining age, parade nights, flying, DofE, volunteering, parent guidance and enquiries for 1471 Horwich Squadron RAF Air Cadets."
        faqs={FAQS}
      />
      <Faq />
    </div>
  );
}
