import { FAQS } from "../../data/content";
import { Reveal, SectionHeading } from "./Reveal";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "../ui/accordion";

export const Faq = () => (
  <section id="faq" data-testid="faq-section" className="py-20 md:py-28 bg-raf-sky">
    <div className="max-w-4xl mx-auto px-5 md:px-10">
      <Reveal>
        <SectionHeading
          center
          eyebrow="Questions answered"
          title="Frequently asked questions"
          intro="Everything young people, parents and prospective volunteers commonly ask about Air Cadets in Horwich."
        />
      </Reveal>

      <Reveal delay={0.1}>
        <Accordion type="single" collapsible className="mt-12 bg-white border border-white divide-y divide-raf-sky">
          {FAQS.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-0 border-b border-raf-sky last:border-b-0 px-5 md:px-7">
              <AccordionTrigger
                data-testid={`faq-trigger-${i}`}
                className="text-left font-display font-bold text-raf-navy hover:text-raf-red text-base md:text-lg py-5"
              >
                {item.q}
              </AccordionTrigger>
              <AccordionContent
                data-testid={`faq-content-${i}`}
                className="text-raf-slate leading-relaxed text-sm md:text-base pb-5"
              >
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </div>
  </section>
);
