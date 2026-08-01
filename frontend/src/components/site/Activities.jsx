import { useEffect, useState } from "react";
import { ACTIVITIES } from "../../data/content";
import { ACTIVITY_FOCUS } from "../../data/content";
import { useNavigate } from "react-router-dom";
import { Reveal, SectionHeading } from "./Reveal";
import { Info, ArrowRight, Sparkles, Plane, Wind, Mountain, Award, HeartPulse, Compass, Tent, Trophy, TentTree, Shield, BookOpen, HeartHandshake, GraduationCap, Users, Target, Rocket, Globe2, Briefcase, Wrench, Flag, Star } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CUSTOM_ICON_MAP = {
  Plane, Wind, Mountain, Award, HeartPulse, Compass, Tent, Trophy, TentTree,
  Shield, BookOpen, HeartHandshake, GraduationCap, Users, Target, Rocket,
  Globe2, Sparkles, Star, Briefcase, Wrench, Flag,
};
const getCustomIcon = (name) => CUSTOM_ICON_MAP[name] || Compass;

export const Activities = () => {
  const navigate = useNavigate();
  const [customActs, setCustomActs] = useState([]);

  useEffect(() => {
    axios.get(`${API}/activities/custom`)
      .then(({ data }) => setCustomActs(data))
      .catch(() => {});
  }, []);

  // Merge: static activities first, then custom ones not already present
  const existingSlugs = new Set(ACTIVITIES.map((a) => a.slug));
  const allActivities = [
    ...ACTIVITIES,
    ...customActs
      .filter((c) => !existingSlugs.has(c.slug))
      .map((c) => ({
        ...c,
        icon: getCustomIcon(c.icon_name),
        image: c.image_url || undefined,
        quickFacts: c.quick_facts || [],
        whatToExpect: c.what_to_expect || [],
      })),
  ];
  return (
  <section
    id="activities"
    data-testid="activities-section"
    className="relative py-20 md:py-28 bg-gradient-to-b from-raf-sky via-white to-raf-sky/50 overflow-hidden"
  >
    <div className="absolute inset-0 topo-lines opacity-70" />
    <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-raf-blue/10 blur-3xl" />
    <div className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-raf-red/10 blur-3xl" />
    <div className="max-w-7xl mx-auto px-5 md:px-10">
      <Reveal>
        <div className="relative bg-white/90 border border-raf-sky p-7 md:p-10 shadow-[0_14px_40px_rgba(7,26,47,0.08)]">
          <div className="absolute top-0 left-0 w-20 h-1.5 bg-raf-red" />
          <SectionHeading
            eyebrow="What cadets do"
            title="Activities and opportunities"
            intro="From the flight line to the hills, cadets can build skills and experiences across a broad programme. Opportunities are subject to availability, eligibility, training and RAFAC procedures."
          />
        </div>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
        {allActivities.map((act, i) => (
          <Reveal key={act.title} delay={(i % 3) * 0.06}>
            <button
              data-testid={`activity-card-${i}`}
              onClick={() => navigate(`/activities/${act.slug}`)}
              className="group w-full text-left h-full bg-white border border-[#dbe8ef] hover:shadow-[0_22px_55px_rgba(7,26,47,0.18)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col"
            >
              {act.image && (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={act.image}
                    alt={act.title}
                    loading="lazy"
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${ACTIVITY_FOCUS[act.slug] || "object-center"}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-raf-navy/75 via-raf-navy/15 to-transparent" />
                  <span className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center bg-raf-red text-white text-[11px] font-bold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {act.strapline && (
                    <div className="hidden sm:block absolute left-3 bottom-3 right-3 px-3 py-2 bg-raf-navy/70 backdrop-blur-sm border border-white/20">
                      <p className="text-white text-xs leading-snug font-medium">{act.strapline}</p>
                    </div>
                  )}
                </div>
              )}
              <div className="p-2.5 sm:p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center bg-raf-sky text-raf-blue group-hover:bg-raf-blue group-hover:text-white transition-colors shrink-0">
                    <act.icon size={14} />
                  </div>
                  <h3 className="font-display text-[12px] sm:text-base md:text-lg font-bold text-raf-navy leading-tight">
                    {act.title}
                  </h3>
                </div>
                <p className="hidden sm:block mt-2 text-sm text-raf-slate leading-relaxed flex-1">
                  {act.text}
                </p>
                {act.whatToExpect?.length > 0 && (
                  <div className="hidden sm:block mt-4 space-y-1.5">
                    {act.whatToExpect.slice(0, 2).map((item) => (
                      <div key={item} className="flex items-start gap-2 text-xs text-raf-slate leading-relaxed">
                        <Sparkles size={13} className="text-raf-red shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
                {act.quickFacts?.length > 0 && (
                  <div className="hidden sm:flex mt-3 flex-wrap gap-1">
                    {act.quickFacts.slice(0, 2).map((fact) => (
                      <span key={fact} className="px-2 py-1 text-[11px] font-medium bg-raf-sky text-raf-blue border border-[#cfe1ea]">
                        {fact}
                      </span>
                    ))}
                  </div>
                )}
                <span className="mt-2 sm:mt-4 inline-flex items-center gap-1 text-[11px] sm:text-sm font-semibold text-raf-red">
                  <span className="sm:hidden">View</span>
                  <span className="hidden sm:inline">Learn more</span>
                  <ArrowRight size={11} className="sm:hidden group-hover:translate-x-1 transition-transform" />
                  <ArrowRight size={14} className="hidden sm:inline group-hover:translate-x-1.5 transition-transform" />
                </span>
              </div>
              {/* Bottom accent bar */}
              <div className="h-[3px] w-0 group-hover:w-full bg-raf-red transition-all duration-500" />
            </button>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-10 flex items-start gap-3 bg-white/90 border border-raf-sky border-l-4 border-l-raf-blue p-5 max-w-3xl shadow-sm">
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
