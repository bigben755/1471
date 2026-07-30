import { FAQS } from "../../data/content";
import { Reveal, SectionHeading } from "./Reveal";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageSquare, Users, UserPlus } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "../ui/accordion";

export const Faq = () => {
  const navigate = useNavigate();

  return (
  <section id="faq" data-testid="faq-section" className="py-20 md:py-28 bg-raf-sky">
    <div className="max-w-5xl mx-auto px-5 md:px-10">
      <Reveal>
        <SectionHeading
          center
          eyebrow="Questions answered"
          title="Frequently asked questions"
          intro="Everything young people, parents and prospective volunteers commonly ask about Air Cadets in Horwich."
        />
      </Reveal>

      <Reveal delay={0.06}>
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/join", { state: { enquiryType: "Join as a Cadet" } })}
            className="text-left bg-white border border-raf-sky p-5 hover:border-raf-blue transition-colors"
          >
            <UserPlus className="text-raf-blue" size={22} />
            <p className="mt-3 font-display text-lg font-bold text-raf-navy">Joining as a cadet</p>
            <p className="mt-1 text-sm text-raf-slate">Ready to join? Send a quick cadet enquiry.</p>
          </button>

          <button
            onClick={() => navigate("/join", { state: { enquiryType: "Parent/Carer Enquiry" } })}
            className="text-left bg-white border border-raf-sky p-5 hover:border-raf-blue transition-colors"
          >
            <Users className="text-raf-blue" size={22} />
            <p className="mt-3 font-display text-lg font-bold text-raf-navy">Parent support</p>
            <p className="mt-1 text-sm text-raf-slate">Ask about safeguarding, timings and expectations.</p>
          </button>

          <button
            onClick={() => navigate("/join", { state: { enquiryType: "Adult Volunteer Enquiry" } })}
            className="text-left bg-white border border-raf-sky p-5 hover:border-raf-blue transition-colors"
          >
            <MessageSquare className="text-raf-blue" size={22} />
            <p className="mt-3 font-display text-lg font-bold text-raf-navy">Volunteer questions</p>
            <p className="mt-1 text-sm text-raf-slate">Discuss routes, roles and induction steps.</p>
          </button>
        </div>
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

      <Reveal delay={0.12}>
        <div className="mt-10 bg-raf-blue p-7 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-white font-display text-xl font-bold">Still unsure? Start with a no-pressure enquiry.</p>
          <button
            onClick={() => navigate("/join")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-raf-navy font-semibold hover:bg-raf-sky transition-colors"
          >
            Contact the squadron <ArrowRight size={17} />
          </button>
        </div>
      </Reveal>
    </div>
  </section>
  );
};
