import { ABOUT_CARDS } from "../../data/content";
import { Reveal, SectionHeading } from "./Reveal";
import { Roundel } from "./Motifs";

export const About = () => (
  <section id="about" data-testid="about-section" className="relative py-20 md:py-28 bg-white topo-lines">
    <div className="max-w-7xl mx-auto px-5 md:px-10">
      <Reveal>
        <SectionHeading
          eyebrow="About the Squadron"
          title="A national youth organisation, on your doorstep"
          intro="1471 Horwich Squadron is part of the Royal Air Force Air Cadets, a national youth organisation offering young people the chance to develop confidence, leadership, teamwork and practical skills through aviation-themed training and adventurous activity."
        />
      </Reveal>

      <Reveal delay={0.1}>
        <p className="mt-6 max-w-3xl text-base md:text-lg text-raf-slate leading-relaxed">
          Cadets can take part in a wide range of activities, from aviation
          studies and leadership tasks to camps, sport, first aid, DofE,
          fieldcraft, drill and community events. The squadron provides a
          structured, supportive environment where cadets can grow at their own
          pace while being encouraged to take on new challenges.
        </p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
        {ABOUT_CARDS.map((card, i) => (
          <Reveal key={card.title} delay={0.1 + i * 0.08}>
            <div
              data-testid={`about-card-${i}`}
              className="group relative h-full bg-white border border-raf-sky p-7 hover:border-raf-blue transition-colors overflow-hidden"
            >
              <Roundel className="absolute -right-8 -top-8 w-24 h-24 opacity-[0.06] group-hover:opacity-10 transition-opacity" />
              <div className="w-12 h-12 flex items-center justify-center bg-raf-blue text-white">
                <card.icon size={22} />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-raf-navy">
                {card.title}
              </h3>
              <p className="mt-3 text-raf-slate leading-relaxed">{card.text}</p>
              <div className="mt-5 h-[3px] w-10 bg-raf-red group-hover:w-20 transition-all duration-300" />
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
