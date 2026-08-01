import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ACTIVITIES, getActivity, ACTIVITY_FOCUS } from "../../data/content";
import { api } from "../../api";
import { Seo } from "../../components/site/Seo";
import { Reveal } from "../../components/site/Reveal";
import { Roundel } from "../../components/site/Motifs";
import { Check, ArrowRight, ArrowLeft, Info, X, Star, Sparkles, Loader2, Plane, Wind, Mountain, Award, HeartPulse, Compass, Tent, Trophy, TentTree, Shield, BookOpen, HeartHandshake, GraduationCap, Users, Target, Rocket, Globe2, Briefcase, Wrench, Flag } from "lucide-react";

const CUSTOM_ICON_MAP = {
  Plane, Wind, Mountain, Award, HeartPulse, Compass, Tent, Trophy, TentTree,
  Shield, BookOpen, HeartHandshake, GraduationCap, Users, Target, Rocket,
  Globe2, Sparkles, Star, Briefcase, Wrench, Flag,
};
const getCustomIcon = (name) => CUSTOM_ICON_MAP[name] || Compass;

export default function ActivityDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const staticActivity = getActivity(slug);
  const [customActivity, setCustomActivity] = useState(null);
  const [customLoading, setCustomLoading] = useState(!staticActivity);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    if (!staticActivity) {
      api.get(`/activities/custom/${slug}`)
        .then(({ data }) => setCustomActivity({
          ...data,
          whatToExpect: data.what_to_expect || [],
          quickFacts: data.quick_facts || [],
        }))
        .catch(() => setCustomActivity(null))
        .finally(() => setCustomLoading(false));
    }
  }, [slug, staticActivity]);

  if (!staticActivity && customLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] gap-3 text-raf-slate">
        <Loader2 className="animate-spin" /> Loading activity…
      </div>
    );
  }

  const activity = staticActivity || customActivity;
  if (!activity) return <Navigate to="/activities" replace />;

  const related = ACTIVITIES.filter((a) => a.slug !== slug).slice(0, 3);
  const isCustom = !staticActivity;
  const Icon = isCustom ? getCustomIcon(activity.icon_name) : activity.icon;
  const gallery = activity.gallery || [];
  const bannerFocus = ACTIVITY_FOCUS[activity.slug] || "object-center";
  const bannerImage = isCustom ? activity.image_url : activity.image;
  const bannerVideo = isCustom ? null : activity.video;

  return (
    <div data-testid="activity-detail-page">
      <Seo
        title={`${activity.title} | Activities | 1471 Horwich Squadron RAF Air Cadets`}
        description={activity.text}
      />

      {/* Header band */}
      <section className="relative bg-raf-navy text-white overflow-hidden">
        {(bannerVideo || bannerImage) && (
          <div className="absolute inset-0">
            {bannerVideo ? (
              <video src={bannerVideo} autoPlay muted loop playsInline aria-hidden="true"
                className="w-full h-full object-cover" />
            ) : (
              <img src={bannerImage} alt={activity.title} className={`w-full h-full object-cover ${bannerFocus}`} />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-raf-navy via-raf-navy/88 to-raf-navy/58" />
          </div>
        )}
        <div className="absolute inset-0 route-lines opacity-30" />
        <div className="absolute -left-20 top-10 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
        <Roundel className="absolute -right-20 -bottom-24 w-72 h-72 opacity-[0.07]" />
        <div className="absolute top-0 right-0 h-full w-[5px] bg-raf-red" />
        <div className="relative max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-24">
          <button
            data-testid="back-to-activities"
            onClick={() => navigate("/activities")}
            className="inline-flex items-center gap-2 text-sm text-raf-sky hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} /> All activities
          </button>
          <div className="flex items-center gap-3 mb-5">
            <div className="inline-flex px-3 py-1 text-[11px] uppercase tracking-[0.16em] bg-white/15 border border-white/20">
              Activity profile
            </div>
            {activity.video && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] uppercase tracking-[0.14em] bg-raf-red text-white">
                <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3 shrink-0"><polygon points="5,3 19,12 5,21" /></svg>
                Live footage
              </div>
            )}
          </div>
          {activity.strapline && (
            <p className="mb-5 max-w-2xl text-white/85 text-base md:text-lg leading-relaxed">{activity.strapline}</p>
          )}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center bg-raf-red text-white shrink-0">
              <Icon size={26} />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight">{activity.title}</h1>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="relative py-16 md:py-24 bg-white overflow-hidden">
        <div className="absolute inset-0 topo-lines opacity-40 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 md:px-10 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <Reveal>
              <div className="space-y-5 bg-white/95 border border-raf-sky p-7 md:p-9 shadow-[0_12px_35px_rgba(7,26,47,0.08)]">
                {activity.long.map((p, i) => (
                  <p key={i} className="text-base md:text-lg text-raf-slate leading-relaxed">{p}</p>
                ))}
              </div>
            </Reveal>

            {activity.quickFacts?.length > 0 && (
              <Reveal delay={0.07}>
                <div className="mt-8 bg-raf-navy text-white p-6 md:p-7 border-l-4 border-raf-red">
                  <h2 className="font-display text-xl font-bold">Mission snapshot</h2>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {activity.quickFacts.map((fact) => (
                      <span key={fact} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 text-sm">
                        <Star size={14} className="text-raf-sky" />
                        {fact}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {activity.whatToExpect?.length > 0 && (
              <Reveal delay={0.1}>
                <div className="mt-8">
                  <h2 className="font-display text-2xl font-bold text-raf-navy">What your experience can include</h2>
                  <div className="mt-5 grid sm:grid-cols-2 gap-3.5">
                    {activity.whatToExpect.map((item, i) => (
                      <div key={item} className="bg-white border border-raf-sky p-4 shadow-sm">
                        <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-raf-red font-semibold">
                          <Sparkles size={14} /> Stage {i + 1}
                        </div>
                        <p className="mt-2 text-sm text-raf-slate leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

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
            <aside className="bg-gradient-to-b from-raf-sky to-white border border-raf-sky p-7 shadow-sm">
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

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="relative py-14 md:py-20 bg-raf-sky/40 border-t border-raf-sky overflow-hidden" data-testid="activity-gallery">
          <div className="absolute inset-0 route-lines opacity-20" />
          <div className="max-w-7xl mx-auto px-5 md:px-10">
            <div className="flex items-center gap-3 mb-8">
              <span className="h-[3px] w-8 bg-raf-red" />
              <h2 className="font-display text-2xl font-bold text-raf-navy">Squadron photos</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {gallery.map((g, i) => (
                <button
                  key={g.src}
                  data-testid={`gallery-item-${i}`}
                  onClick={() => setLightbox(g)}
                  className={`group relative overflow-hidden bg-raf-navy/10 ${i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : "aspect-square"}`}
                >
                  {g.type === "video" ? (
                    <>
                      <video
                        src={g.src}
                        muted
                        autoPlay
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-raf-navy/70 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5"><polygon points="5,3 19,12 5,21" /></svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={g.src}
                      alt={g.caption}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-raf-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-white text-xs font-medium leading-snug">{g.caption}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          data-testid="gallery-lightbox"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[120] bg-raf-navy/95 flex items-center justify-center p-4 md:p-10"
        >
          <button
            data-testid="lightbox-close"
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-raf-red text-white transition-colors"
          >
            <X size={22} />
          </button>
          <figure className="max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {lightbox.type === "video" ? (
              <video
                src={lightbox.src}
                controls
                autoPlay
                playsInline
                className="max-h-[80vh] w-auto mx-auto"
              />
            ) : (
              <img src={lightbox.src} alt={lightbox.caption} className="max-h-[80vh] w-auto mx-auto object-contain" />
            )}
            <figcaption className="mt-4 text-center text-white/80 text-sm">{lightbox.caption}</figcaption>
          </figure>
        </div>
      )}

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
                className="group text-left bg-white border border-raf-sky p-6 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                {a.image && (
                  <div className="mb-4 aspect-[16/9] overflow-hidden bg-raf-sky">
                    <img src={a.image} alt={a.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
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
