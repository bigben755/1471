import { VALUE_CARDS, CLOUDS_WIDE } from "../../data/content";
import { Reveal, SectionHeading } from "./Reveal";

export const Qualifications = () => (
  <section
    id="value"
    data-testid="value-section"
    className="relative py-20 md:py-28 bg-raf-navy overflow-hidden"
  >
    <div className="absolute inset-0">
      <img src={CLOUDS_WIDE} alt="" className="w-full h-full object-cover opacity-[0.12]" />
      <div className="absolute inset-0 bg-gradient-to-b from-raf-navy via-raf-navy/95 to-raf-blue/90" />
    </div>

    <div className="relative max-w-7xl mx-auto px-5 md:px-10">
      <Reveal>
        <SectionHeading
          light
          eyebrow="Lasting value"
          title="Skills, awards and experience that last"
          intro="Air Cadets is not only about activities. Cadets can build real experience they can talk about in school, college, university, job applications and interviews. Depending on eligibility and availability, cadets may work towards recognised awards and qualifications through RAFAC-linked opportunities."
        />
      </Reveal>

      <Reveal delay={0.08}>
        <p className="mt-5 max-w-3xl text-white/75 leading-relaxed">
          Through CV College, qualifications can include vocational
          qualifications and awards such as Pearson BTEC qualifications and
          Institute of Leadership and Management awards, where available and
          applicable. Staff can also generate a Cadet CV when needed &mdash; for
          example when a cadet is leaving or applying for work, college or
          university.
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {VALUE_CARDS.map((card, i) => (
          <Reveal key={card.title} delay={(i % 3) * 0.07}>
            <div
              data-testid={`value-card-${i}`}
              className="h-full bg-white/[0.06] border border-white/10 p-6 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-raf-red text-white">
                  <card.icon size={18} />
                </div>
                <h3 className="font-display text-base font-bold text-white">
                  {card.title}
                </h3>
              </div>
              <p className="mt-3 text-sm text-white/75 leading-relaxed">
                {card.text}
              </p>
            </div>
          </Reveal>
          ))}
        </div>
    </div>
  </section>
);
