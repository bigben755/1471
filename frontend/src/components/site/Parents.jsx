import { PARENT_CARDS, PARENTS_IMG } from "../../data/content";
import { useNavigate } from "react-router-dom";
import { Reveal, SectionHeading } from "./Reveal";
import { ArrowRight } from "lucide-react";

export const Parents = () => {
  const navigate = useNavigate();
  return (
  <section id="parents" data-testid="parents-section" className="py-20 md:py-28 bg-white">
    <div className="max-w-7xl mx-auto px-5 md:px-10">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <Reveal>
          <SectionHeading
            eyebrow="For parents and carers"
            title="Information for parents and carers"
            intro="Parents and carers naturally want to know that activities are organised, supervised and worthwhile. RAF Air Cadets provides a structured youth development environment with trained adult volunteers, clear policies and a programme designed to help young people grow in confidence, responsibility and resilience."
          />
        </Reveal>
        <Reveal delay={0.12}>
          <div className="relative">
            <div className="absolute -inset-2 border border-raf-sky -z-10" />
            <img
              src={PARENTS_IMG}
              alt="Cadets recognised at a 1471 Squadron presentation evening"
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="absolute bottom-0 left-0 h-1.5 w-24 bg-raf-red" />
          </div>
        </Reveal>
      </div>

      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PARENT_CARDS.map((card, i) => (
          <Reveal key={card.title} delay={i * 0.08}>
            <div
              data-testid={`parent-card-${i}`}
              className="group h-full bg-raf-sky/60 border border-raf-sky p-7 hover:bg-white hover:border-raf-blue transition-colors"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-white text-raf-blue border border-raf-sky group-hover:bg-raf-blue group-hover:text-white transition-colors">
                <card.icon size={22} />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-raf-navy">
                {card.title}
              </h3>
              <p className="mt-3 text-sm text-raf-slate leading-relaxed">
                {card.text}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-raf-blue p-8 md:p-10">
          <p className="text-white text-lg md:text-xl font-display font-bold max-w-xl">
            Still have a question? We&rsquo;re happy to help before your child joins.
          </p>
          <button
            data-testid="parents-ask-cta"
            onClick={() => navigate("/join", { state: { enquiryType: "Parent/Carer Enquiry" } })}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-raf-navy font-semibold hover:bg-raf-sky transition-colors whitespace-nowrap"
          >
            Ask a question <ArrowRight size={18} />
          </button>
        </div>
      </Reveal>
    </div>
  </section>
  );
};
