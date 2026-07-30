import { CADET_BULLETS, CLOUDS_WIDE } from "../../data/content";
import { useNavigate } from "react-router-dom";
import { Reveal } from "./Reveal";
import { Roundel } from "./Motifs";
import { Check, ArrowRight, CalendarDays, Coins, Shirt } from "lucide-react";

export const Cadets = () => {
  const navigate = useNavigate();
  const firstMonth = [
    "Attend parade nights, meet staff and get to know your intake.",
    "Start basic cadet training and learn squadron routines.",
    "Take part in practical sessions and team activities.",
    "Set early goals for badges, events and activity choices.",
  ];

  const pathways = [
    { title: "Aviation", slug: "flying", text: "Work towards flying, gliding and aviation studies opportunities." },
    { title: "Adventure", slug: "adventure-training", text: "Build resilience through fieldcraft, camp and outdoor challenge." },
    { title: "Leadership", slug: "leadership", text: "Develop confidence in speaking, planning and leading teams." },
    { title: "Service", slug: "community-events", text: "Represent the squadron at events and support the community." },
  ];

  const commitment = [
    {
      title: "Weekly rhythm",
      text: "Parade nights are usually twice a week, helping cadets build routine, confidence and consistency over time.",
      icon: CalendarDays,
    },
    {
      title: "Local subscription",
      text: "A small subscription may apply to help support local running costs. We explain this clearly during enquiries.",
      icon: Coins,
    },
    {
      title: "Uniform expectations",
      text: "Uniform is provided through cadet channels and must be looked after to maintain squadron standards and pride.",
      icon: Shirt,
    },
  ];

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

      <div className="mt-14 grid lg:grid-cols-2 gap-10">
        <Reveal>
          <div className="bg-white/[0.06] border border-white/10 p-7 md:p-8">
            <h3 className="font-display text-2xl font-bold text-white">Your first month</h3>
            <p className="mt-3 text-white/80 leading-relaxed">
              Joining can feel like a big step. Here is what new cadets typically experience during their first few weeks.
            </p>
            <ol className="mt-5 space-y-3">
              {firstMonth.map((step, i) => (
                <li key={step} className="flex items-start gap-3 text-white/90 text-sm leading-relaxed">
                  <span className="w-6 h-6 shrink-0 flex items-center justify-center bg-raf-red text-white font-bold text-xs">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="bg-white/[0.06] border border-white/10 p-7 md:p-8">
            <h3 className="font-display text-2xl font-bold text-white">Choose your pathway</h3>
            <p className="mt-3 text-white/80 leading-relaxed">
              As you settle in, you can shape your cadet experience around what excites you most.
            </p>
            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              {pathways.map((p) => (
                <button
                  key={p.slug}
                  onClick={() => navigate(`/activities/${p.slug}`)}
                  className="text-left border border-white/15 bg-white/[0.04] hover:bg-white/[0.1] transition-colors p-4"
                >
                  <p className="font-display text-lg font-bold text-white">{p.title}</p>
                  <p className="mt-1 text-xs text-white/80 leading-relaxed">{p.text}</p>
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-4">
        {commitment.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.06}>
            <div className="h-full border border-white/15 bg-white/[0.06] p-5">
              <div className="w-10 h-10 flex items-center justify-center bg-raf-red text-white">
                <item.icon size={19} />
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-white/80 leading-relaxed">{item.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
  );
};
