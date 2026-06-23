import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ACTIVITIES, getActivity } from "../../data/content";
import { Seo } from "../../components/site/Seo";
import { Reveal } from "../../components/site/Reveal";
import { Roundel } from "../../components/site/Motifs";
import { Check, ArrowRight, ArrowLeft, Info } from "lucide-react";

export default function ActivityDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const activity = getActivity(slug);

  if (!activity) return <Navigate to="/activities" replace />;

  const related = ACTIVITIES.filter((a) => a.slug !== slug).slice(0, 3);
  const Icon = activity.icon;

  return (
    <div data-testid="activity-detail-page">
      <Seo
        title={`${activity.title} | Activities | 1471 Horwich Squadron RAF Air Cadets`}
        description={activity.text}
      />

      {/* Header band */}
      <section className="relative bg-raf-navy text-white overflow-hidden">
        <div className="absolute inset-0 route-lines opacity-30" />
        <Roundel className="absolute -right-20 -bottom-24 w-72 h-72 opacity-[0.07]" />
        <div className="absolute top-0 right-0 h-full w-[5px] bg-raf-red" />
        <div className="relative max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-20">
          <button
            data-testid="back-to-activities"
            onClick={() => navigate("/activities")}
            className="inline-flex items-center gap-2 text-sm text-raf-sky hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} /> All activities
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center bg-raf-red text-white shrink-0">
              <Icon size={26} />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight">{activity.title}</h1>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <Reveal>
              <div className="space-y-5">
                {activity.long.map((p, i) => (
                  <p key={i} className="text-base md:text-lg text-raf-slate leading-relaxed">{p}</p>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-10 flex items-start gap-3 bg-raf-sky/60 border-l-4 border-raf-blue p-5">
                <Info className="text-raf-blue shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-raf-slate leading-relaxed">
                  Activities are delivered in line with RAF Air Cadets policy, availability,
                  supervision, eligibility and local programme planning. Opportunities are not
                  guaranteed for every cadet at every stage.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.08}>
            <aside className="bg-raf-sky/50 border border-raf-sky p-7">
              <h2 className="font-display text-lg font-bold text-raf-navy">What cadets can do</h2>
              <ul className="mt-5 space-y-3">
                {activity.highlights.map((h, i) => (
                  <li key={i} data-testid={`highlight-${i}`} className="flex items-start gap-3 text-sm text-raf-slate">
                    <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-raf-red text-white"><Check size={14} /></span>
                    {h}
                  </li>
                ))}
              </ul>
              <button
                data-testid="activity-join-cta"
                onClick={() => navigate("/join", { state: { enquiryType: "Join as a Cadet" } })}
                className="mt-7 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors"
              >
                Register your interest <ArrowRight size={18} />
              </button>
            </aside>
          </Reveal>
        </div>
      </section>

      {/* Related */}
      <section className="py-16 md:py-20 bg-raf-sky">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <h2 className="font-display text-2xl font-bold text-raf-navy mb-8">More activities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map((a) => (
              <button
                key={a.slug}
                data-testid={`related-${a.slug}`}
                onClick={() => navigate(`/activities/${a.slug}`)}
                className="group text-left bg-white border border-white p-6 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="w-11 h-11 flex items-center justify-center bg-raf-sky text-raf-blue group-hover:bg-raf-blue group-hover:text-white transition-colors">
                  <a.icon size={20} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-raf-navy">{a.title}</h3>
                <p className="mt-2 text-sm text-raf-slate leading-relaxed">{a.text}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
