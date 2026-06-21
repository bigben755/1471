import { VOLUNTEER_ROLES } from "../../data/content";
import { useNavigate } from "react-router-dom";
import { Reveal, SectionHeading } from "./Reveal";
import { Roundel } from "./Motifs";
import { ArrowRight } from "lucide-react";

export const Volunteer = () => {
  const navigate = useNavigate();
  return (
  <section
    id="volunteer"
    data-testid="volunteer-section"
    className="relative py-20 md:py-28 bg-raf-sky overflow-hidden"
  >
    <Roundel className="absolute -left-24 bottom-0 w-80 h-80 opacity-[0.05]" />
    <div className="relative max-w-7xl mx-auto px-5 md:px-10">
      <Reveal>
        <SectionHeading
          eyebrow="For adults"
          title="Could you support the next generation?"
          intro="Adult volunteers are essential to the RAF Air Cadets. You do not need to have served in the Armed Forces or have aviation experience. Volunteers support cadet development, help deliver activities, provide specialist skills, assist with administration, support events and contribute to the life of the squadron."
        />
      </Reveal>

      <Reveal delay={0.08}>
        <p className="mt-5 max-w-3xl text-raf-slate leading-relaxed">
          New adult volunteers complete an induction and training before taking
          on responsibilities. Induction helps new staff understand the
          organisation, its training, welfare and culture, and the development
          expected of volunteers over time.
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {VOLUNTEER_ROLES.map((role, i) => (
          <Reveal key={role.title} delay={(i % 3) * 0.07}>
            <div
              data-testid={`volunteer-role-${i}`}
              className="group h-full bg-white border border-white p-7 hover:border-raf-blue transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-raf-navy text-white group-hover:bg-raf-red transition-colors">
                  <role.icon size={22} />
                </div>
                <h3 className="font-display text-lg font-bold text-raf-navy">
                  {role.title}
                </h3>
              </div>
              <p className="mt-4 text-sm text-raf-slate leading-relaxed">
                {role.text}
              </p>
            </div>
          </Reveal>
        ))}

        <Reveal delay={0.14}>
          <div className="h-full bg-raf-blue p-7 flex flex-col justify-between">
            <p className="text-white font-display text-xl font-bold leading-snug">
              Bring your skills. Make a real difference locally.
            </p>
            <button
              data-testid="volunteer-cta"
              onClick={() => navigate("/join", { state: { enquiryType: "Adult Volunteer Enquiry" } })}
              className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors"
            >
              Become an Adult Volunteer <ArrowRight size={18} />
            </button>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
  );
};
