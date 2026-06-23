import { ACTIVITIES } from "../../data/content";
import { useNavigate } from "react-router-dom";
import { Reveal, SectionHeading } from "./Reveal";
import { Info, ArrowRight } from "lucide-react";

export const Activities = () => {
  const navigate = useNavigate();
  return (
  <section
    id="activities"
    data-testid="activities-section"
    className="relative py-20 md:py-28 bg-raf-sky"
  >
    <div className="max-w-7xl mx-auto px-5 md:px-10">
      <Reveal>
        <SectionHeading
          eyebrow="What cadets do"
          title="Activities and opportunities"
          intro="From the flight line to the hills, cadets can build skills and experiences across a broad programme. Opportunities are subject to availability, eligibility, training and RAFAC procedures."
        />
      </Reveal>

      <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {ACTIVITIES.map((act, i) => (
          <Reveal key={act.title} delay={(i % 3) * 0.06}>
            <button
              data-testid={`activity-card-${i}`}
              onClick={() => navigate(`/activities/${act.slug}`)}
              className="group w-full text-left h-full bg-white border border-white p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 flex items-center justify-center bg-raf-sky text-raf-blue group-hover:bg-raf-blue group-hover:text-white transition-colors">
                  <act.icon size={20} />
                </div>
                <span className="font-display text-xs font-bold text-raf-sky group-hover:text-raf-red transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-raf-navy">
                {act.title}
              </h3>
              <p className="mt-2 text-sm text-raf-slate leading-relaxed">
                {act.text}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-raf-red">
                Learn more <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-10 flex items-start gap-3 bg-white border-l-4 border-raf-blue p-5 max-w-3xl">
          <Info className="text-raf-blue shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-raf-slate leading-relaxed">
            Activities are delivered in line with RAF Air Cadets policy,
            availability, supervision, eligibility and local programme planning.
          </p>
        </div>
      </Reveal>
    </div>
  </section>
  );
};
