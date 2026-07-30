import { useNavigate } from "react-router-dom";
import { Hero } from "../../components/site/Hero";
import { Reveal, SectionHeading } from "../../components/site/Reveal";
import { Seo } from "../../components/site/Seo";
import { VENUE } from "../../data/content";
import {
  Compass, Plane, Rocket, HeartHandshake, HelpCircle, GraduationCap, ArrowRight, MapPin, Clock,
} from "lucide-react";

const TRUST_SIGNALS = [
  {
    title: "Built for ages 12 to 17",
    text: "A youth development environment focused on confidence, teamwork and practical skills.",
  },
  {
    title: "Not a recruiting organisation",
    text: "Cadet experiences support any future path, whether that is college, work, apprenticeships or service.",
  },
  {
    title: "Structured parade nights",
    text: "Consistent weekly routines help cadets balance squadron life with school, hobbies and family commitments.",
  },
  {
    title: "Safeguarding and supervision",
    text: "Activities are delivered with trained staff, clear procedures and age-appropriate support.",
  },
];

const CARDS = [
  { to: "/about", title: "About the Squadron", text: "Who we are and what being part of the RAF Air Cadets involves.", icon: Compass },
  { to: "/activities", title: "Activities", text: "Explore detailed pathways in flying, overseas camp, fieldcraft, leadership, sport and more.", icon: Plane },
  { to: "/cadets", title: "For Cadets", text: "Thinking about joining? Here's what you could get involved in.", icon: Rocket },
  { to: "/parents", title: "For Parents & Carers", text: "Structure, supervision and the value of cadet experience.", icon: GraduationCap },
  { to: "/volunteer", title: "Volunteer", text: "Adults are essential to the squadron — discover how to help.", icon: HeartHandshake },
  { to: "/faq", title: "FAQ", text: "Quick answers to the questions we're asked most often.", icon: HelpCircle },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <div data-testid="home-page">
      <Seo
        title="1471 Horwich Squadron RAF Air Cadets | Horwich Air Cadets"
        description="Join 1471 Horwich Squadron RAF Air Cadets in Horwich. Explore flying, adventure, overseas camp, RAF station visits, airshows, leadership, first aid, DofE and youth development pathways, plus adult volunteer opportunities."
      />
      <Hero />

      <section className="py-20 md:py-28 bg-white topo-lines">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <Reveal>
            <SectionHeading
              eyebrow="Explore the squadron"
              title="Find your way in"
              intro="Start with the activity pages to see exactly what cadet life can look like, from first parade night to camps, flying and leadership milestones."
            />
          </Reveal>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {CARDS.map((c, i) => (
              <Reveal key={c.to} delay={(i % 3) * 0.07}>
                <button
                  data-testid={`home-card-${c.to.slice(1)}`}
                  onClick={() => navigate(c.to)}
                  className="group w-full text-left h-full bg-white border border-raf-sky p-7 hover:border-raf-blue hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-raf-blue text-white group-hover:bg-raf-red transition-colors">
                    <c.icon size={22} />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-raf-navy">{c.title}</h3>
                  <p className="mt-2 text-raf-slate leading-relaxed text-sm">{c.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-raf-red">
                    Read more <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 md:py-20 bg-raf-blue overflow-hidden">
        <div className="absolute inset-0 route-lines opacity-30" />
        <div className="relative max-w-7xl mx-auto px-5 md:px-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white">Parade with us in Horwich</h2>
            <div className="mt-4 space-y-2 text-white/85 text-sm">
              <div className="flex items-center gap-2"><Clock size={18} className="text-raf-sky" /> {VENUE.nights}, {VENUE.time}</div>
              <div className="flex items-start gap-2"><MapPin size={18} className="text-raf-sky shrink-0 mt-0.5" /> {VENUE.name}, {VENUE.address}</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row md:justify-end gap-3">
            <button data-testid="home-join-cadet" onClick={() => navigate("/join", { state: { enquiryType: "Join as a Cadet" } })} className="px-7 py-3.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors">
              Join as a Cadet
            </button>
            <button data-testid="home-volunteer" onClick={() => navigate("/join", { state: { enquiryType: "Adult Volunteer Enquiry" } })} className="px-7 py-3.5 bg-white text-raf-navy font-semibold hover:bg-raf-sky transition-colors">
              Volunteer
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <Reveal>
            <SectionHeading
              eyebrow="Why families choose us"
              title="Clear, trusted and youth-focused"
              intro="The RAF Air Cadets model combines challenge and progression with the structure and support families expect."
            />
          </Reveal>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST_SIGNALS.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="h-full border border-raf-sky bg-raf-sky/35 p-5">
                  <h3 className="font-display text-lg font-bold text-raf-navy">{item.title}</h3>
                  <p className="mt-2 text-sm text-raf-slate leading-relaxed">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
