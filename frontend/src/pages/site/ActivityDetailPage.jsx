import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ACTIVITIES, getActivity } from "../../data/content";
import { Seo } from "../../components/site/Seo";
import { Reveal } from "../../components/site/Reveal";
import { Roundel } from "../../components/site/Motifs";
import { Check, ArrowRight, ArrowLeft, Info, X } from "lucide-react";

export default function ActivityDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const activity = getActivity(slug);
  const [lightbox, setLightbox] = useState(null);

  if (!activity) return <Navigate to="/activities" replace />;

  const related = ACTIVITIES.filter((a) => a.slug !== slug).slice(0, 3);
  const Icon = activity.icon;
  const gallery = activity.gallery || [];

  return (
    <div data-testid="activity-detail-page">
      <Seo
        title={`${activity.title} | Activities | 1471 Horwich Squadron RAF Air Cadets`}
        description={activity.text}
      />

      {/* Header band */}
      <section className="relative bg-raf-navy text-white overflow-hidden">
        {activity.image && (
          <div className="absolute inset-0">
            <img src={activity.image} alt={activity.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-raf-navy via-raf-navy/85 to-raf-navy/55" />
          </div>
        )}
        <div className="absolute inset-0 route-lines opacity-30" />
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

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="py-14 md:py-20 bg-raf-sky/40 border-t border-raf-sky" data-testid="activity-gallery">
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
                  className="group relative aspect-square overflow-hidden bg-raf-navy/10"
                >
                  <img
                    src={g.src}
                    alt={g.caption}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
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
            <img src={lightbox.src} alt={lightbox.caption} className="max-h-[80vh] w-auto mx-auto object-contain" />
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
