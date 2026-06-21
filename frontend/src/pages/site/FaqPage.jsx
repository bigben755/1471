import { Faq } from "../../components/site/Faq";
import { Seo } from "../../components/site/Seo";
import { FAQS } from "../../data/content";

export default function FaqPage() {
  return (
    <div data-testid="faq-page">
      <Seo
        title="FAQ | 1471 Horwich Squadron RAF Air Cadets"
        description="Frequently asked questions about RAF Air Cadets in Horwich: joining age, flying, DofE, how often the squadron meets, what parents should know and how adults can volunteer."
        faqs={FAQS}
      />
      <Faq />
    </div>
  );
}
