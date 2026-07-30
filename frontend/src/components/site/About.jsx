import { ABOUT_CARDS, ABOUT_IMG } from "../../data/content";
import { Reveal, SectionHeading } from "./Reveal";
import { Roundel } from "./Motifs";
import { Compass, Shield, Users, Rocket } from "lucide-react";

const HOW_IT_WORKS = [
  {
    title: "Join and settle in",
    text: "New cadets are introduced to parade nights, routines and expectations in a supportive environment.",
    icon: Users,
  },
  {
    title: "Train and develop",
    text: "Cadets progress through structured training, learning practical and leadership skills step by step.",
    icon: Compass,
  },
  {
    title: "Take on challenges",
    text: "From fieldcraft to first aid and aviation, cadets apply learning in real activities and team settings.",
    icon: Rocket,
  },
  {
    title: "Progress and lead",
    text: "As confidence grows, cadets can take on responsibility, support others and work towards recognised milestones.",
    icon: Shield,
  },
];

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

      <div className="mt-8 grid lg:grid-cols-2 gap-10 items-center">
        <Reveal delay={0.1}>
          <p className="max-w-3xl text-base md:text-lg text-raf-slate leading-relaxed">
            Cadets can take part in a wide range of activities, from aviation
            studies and leadership tasks to camps, sport, first aid, DofE,
            fieldcraft, drill and community events. The squadron provides a
            structured, supportive environment where cadets can grow at their own
            pace while being encouraged to take on new challenges.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="relative">
            <div className="absolute -inset-2 border border-raf-sky -z-10" />
            <img
              src={ABOUT_IMG}
              alt="Cadets of 1471 Horwich Squadron on parade"
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="absolute bottom-0 left-0 h-1.5 w-24 bg-raf-red" />
          </div>
        </Reveal>
      </div>

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

      <div className="mt-16 md:mt-20">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="A clear path from joining to progression"
            intro="Cadet development is structured so young people can build skills and confidence in manageable steps."
          />
        </Reveal>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HOW_IT_WORKS.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <div className="h-full bg-white border border-raf-sky p-6">
                <div className="w-11 h-11 flex items-center justify-center bg-raf-blue text-white">
                  <item.icon size={20} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-raf-navy">{item.title}</h3>
                <p className="mt-2 text-sm text-raf-slate leading-relaxed">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={0.12}>
        <div className="mt-12 border border-raf-sky bg-raf-sky/40 p-7 md:p-9">
          <h3 className="font-display text-2xl font-bold text-raf-navy">What makes cadet life different?</h3>
          <p className="mt-4 text-raf-slate leading-relaxed">
            Cadet life combines structure and adventure. Young people are expected to show commitment and teamwork,
            while being supported to try new experiences that build independence, resilience and pride.
          </p>
        </div>
      </Reveal>
    </div>
  </section>
);
