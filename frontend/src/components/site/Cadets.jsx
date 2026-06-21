import { CADET_BULLETS, CLOUDS_WIDE } from "../../data/content";
import { useNavigate } from "react-router-dom";
import { Reveal } from "./Reveal";
import { Roundel } from "./Motifs";
import { Check, ArrowRight } from "lucide-react";

export const Cadets = () => {
  const navigate = useNavigate();
  return (
  <section
    id="cadets"
    data-testid="cadets-section"
    className="relative py-20 md:py-28 bg-raf-navy overflow-hidden"
  >
    <div className="absolute inset-0">
      <img src={CLOUDS_WIDE} alt="" className="w-full h-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-raf-navy/85" />
      <div className="absolute inset-0 route-lines opacity-30" />
    </div>
    <Roundel className="absolute -right-20 top-10 w-72 h-72 opacity-[0.07]" />

    <div className="relative max-w-7xl mx-auto px-5 md:px-10">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <Reveal>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[3px] w-8 bg-raf-red" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-raf-sky">
                For young people
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Thinking about joining as a cadet?
            </h2>
            <p className="mt-6 text-base md:text-lg text-white/85 leading-relaxed">
              If you want to try something different, meet new people and build
              skills that can help you in school, college, work and life, Air
              Cadets could be for you. You do not need military experience,
              aviation knowledge or previous qualifications. You just need a
              willingness to get involved, learn and take part.
            </p>
            <button
              data-testid="cadets-register-cta"
              onClick={() => navigate("/join", { state: { enquiryType: "Join as a Cadet" } })}
              className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors"
            >
              Register your interest <ArrowRight size={18} />
            </button>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-4">
          {CADET_BULLETS.map((b, i) => (
            <Reveal key={b} delay={i * 0.06}>
              <div
                data-testid={`cadet-bullet-${i}`}
                className="h-full flex items-start gap-3 bg-white/[0.06] border border-white/10 p-5 hover:bg-white/10 transition-colors"
              >
                <span className="shrink-0 w-7 h-7 flex items-center justify-center bg-raf-red text-white">
                  <Check size={16} />
                </span>
                <span className="text-white/90 leading-relaxed">{b}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
  );
};
