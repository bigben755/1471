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
        title="1471 Horwich Squadron RAF Air Cadets | Horwich"
        description="Join 1471 Horwich Squadron RAF Air Cadets for ages 12 to 17, serving Horwich, Westhoughton, Adlington, Blackrod and Lostock with flying, DofE and camps."
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

          <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
            {CARDS.map((c, i) => (
              <Reveal key={c.to} delay={(i % 3) * 0.07}>
                <button
                  data-testid={`home-card-${c.to.slice(1)}`}
                  onClick={() => navigate(c.to)}
                  className="group w-full text-left h-full bg-white border border-raf-sky hover:border-raf-blue hover:shadow-xl overflow-hidden relative transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-raf-red origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  <div className="p-4 sm:p-7">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center bg-raf-blue text-white group-hover:bg-raf-red transition-colors">
                      <c.icon size={18} />
                    </div>
                    <h3 className="mt-3 sm:mt-5 font-display text-[14px] sm:text-xl font-bold text-raf-navy leading-tight">{c.title}</h3>
                    <p className="hidden sm:block mt-2 text-raf-slate leading-relaxed text-sm">{c.text}</p>
                    <span className="mt-2 sm:mt-4 inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-sm font-semibold text-raf-red">
                      <span className="sm:hidden">View</span>
                      <span className="hidden sm:inline">Read more</span>
                      <ArrowRight size={11} className="sm:hidden group-hover:translate-x-1 transition-transform" />
                      <ArrowRight size={15} className="hidden sm:inline group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
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

      {/* Life at 1471 — 3-panel photo feature */}
      <section className="bg-raf-navy overflow-hidden" aria-label="Life at 1471 Horwich Squadron">
        <div className="grid md:grid-cols-3 h-[220px] sm:h-[300px] md:h-[400px]">
          {[
            { src: "/squadron/flying/flying-cadets-ready-for-flight.jpg", focus: "object-top",    label: "Flying",    sub: "Take to the skies" },
            { src: "/squadron/fieldcraft/20260720_190743.jpg",           focus: "object-center", label: "Fieldcraft", sub: "Master outdoor skills" },
            { src: "/squadron/air_shows/cosford airshow 4 - access all areas.jpg", focus: "object-center", label: "Airshows",  sub: "All-areas access" },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <div className="relative h-full overflow-hidden group cursor-default">
                <img
                  src={item.src}
                  alt={item.label}
                  loading="lazy"
                  className={`w-full h-full object-cover ${item.focus} group-hover:scale-105 transition-transform duration-700`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-raf-navy/90 via-raf-navy/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8">
                  <span className="block text-[9px] uppercase tracking-[0.28em] text-raf-sky mb-1.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-2xl md:text-3xl font-black text-white leading-tight">{item.label}</h3>
                  <p className="text-white/70 text-sm mt-1">{item.sub}</p>
                </div>
                <div className="absolute top-0 right-0 w-[3px] h-0 bg-raf-red group-hover:h-full transition-all duration-500" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Scrolling photo ticker */}
      <div className="bg-raf-navy py-3 overflow-hidden border-t border-white/10">
        <div className="flex animate-marquee gap-2">
          {[
            "/squadron/raf_station_visits/raf-station-visit-1-cadet-in-a-typhoon-raf-coningsby.jpg",
            "/squadron/gliding/gliding-cadet-in-glider.jpg",
            "/squadron/shooting/shooting (1).jpg",
            "/squadron/overseas/20260526_131607.jpg",
            "/squadron/awards/presentation-evening-2.jpg",
            "/squadron/stem/stem 3 - 1.jpg",
            "/squadron/adventure_training/adventure_training_images (1).jpg",
            "/squadron/first_aid/first_aid_images (1).jpg",
            "/squadron/sport/archery 1.jpg",
            "/squadron/rememberance/rememberance-parade-1.jpg",
            "/squadron/air_shows/riat (1).JPG",
            "/squadron/parades/parade 1 - confirmation of the King 1.jpg",
          ].flatMap((src, i) => [
            <div key={`a${i}`} className="shrink-0 w-44 h-24 overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
              <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
            </div>,
            <div key={`b${i}`} className="shrink-0 w-44 h-24 overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
              <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
            </div>,
          ])}
        </div>
      </div>

      <section className="py-16 md:py-20 bg-gradient-to-b from-raf-sky/40 to-white">
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
