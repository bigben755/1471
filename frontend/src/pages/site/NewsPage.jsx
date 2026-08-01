import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Seo } from "../../components/site/Seo";
import { Reveal, SectionHeading } from "../../components/site/Reveal";
import { Newspaper, ArrowRight, Loader2, ExternalLink } from "lucide-react";
import { LINKS } from "../../data/content";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
export const imgUrl = (u) => u && u.startsWith("/api") ? `${process.env.REACT_APP_BACKEND_URL}${u}` : u;
export const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

export default function NewsPage() {
  const [posts, setPosts] = useState([]);
  const [fbPosts, setFbPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/public/blogs`),
      axios.get(`${API}/facebook/public-scan`, { params: { limit: 5 } }).catch(() => ({ data: [] })),
    ]).then(([{ data: blogs }, { data: fb }]) => {
      setPosts(blogs);
      setFbPosts(fb);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="news-page">
      <Seo title="News | 1471 Horwich Squadron RAF Air Cadets in Horwich" description="Latest stories, achievements, activities and events from 1471 Horwich Squadron RAF Air Cadets, including cadet progression and community highlights." />

      <section className="relative bg-raf-navy text-white overflow-hidden">
        <div className="absolute inset-0 route-lines opacity-30" />
        <div className="absolute top-0 right-0 h-full w-[5px] bg-raf-red" />
        <div className="relative max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-4"><span className="h-[3px] w-8 bg-raf-red" /><span className="text-raf-sky text-sm uppercase tracking-[0.2em]">Squadron News</span></div>
          <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight">Latest from the Squadron</h1>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <Reveal>
            <div className="mb-10 grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 border border-raf-sky bg-raf-sky/40 p-6 md:p-7">
                <h2 className="font-display text-2xl font-bold text-raf-navy">What you will find in squadron news</h2>
                <p className="mt-3 text-raf-slate leading-relaxed">
                  We share activity highlights, cadet achievements, parade milestones and community events so prospective cadets and families can see what squadron life looks like in practice.
                </p>
              </div>
              <button
                onClick={() => navigate("/join", { state: { enquiryType: "Join as a Cadet" } })}
                className="text-left border border-raf-blue bg-raf-blue text-white p-6 md:p-7 hover:bg-raf-navy transition-colors"
              >
                <p className="font-display text-xl font-bold">Inspired by what you see?</p>
                <p className="mt-2 text-white/80 text-sm leading-relaxed">Send a cadet enquiry and start your own journey with the squadron.</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                  Join now <ArrowRight size={15} />
                </span>
              </button>
            </div>
          </Reveal>

          {loading ? (
            <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading...</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-raf-slate py-16"><Newspaper className="mx-auto mb-3 text-raf-sky" size={40} /> No news posts yet — check back soon.</div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.05}>
                  <button data-testid={`news-card-${p.slug}`} onClick={() => navigate(`/news/${p.slug}`)} className="group w-full text-left bg-white border border-raf-sky/60 h-full flex flex-col overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="aspect-[16/10] overflow-hidden bg-raf-sky/40">
                      {p.cover_image_url ? (
                        <img src={imgUrl(p.cover_image_url)} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-raf-blue/40"><Newspaper size={40} /></div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <span className="text-xs text-raf-slate">{fmtDate(p.published_at)}</span>
                      <h2 className="mt-2 font-display text-lg font-bold text-raf-navy">{p.title}</h2>
                      <p className="mt-2 text-sm text-raf-slate leading-relaxed flex-1">{p.excerpt}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-raf-red">Read more <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" /></span>
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Facebook posts */}
      {fbPosts.length > 0 && (
        <section className="py-14 md:py-20 bg-gradient-to-b from-raf-sky/40 to-white border-t border-raf-sky">
          <div className="max-w-7xl mx-auto px-5 md:px-10">
            <Reveal>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#1877F2] shrink-0" aria-label="Facebook">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.023 4.386 11.016 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.273h3.328l-.532 3.49h-2.796v8.437C19.614 23.089 24 18.096 24 12.073z" />
                  </svg>
                  <h2 className="font-display text-2xl font-bold text-raf-navy">From our Facebook Page</h2>
                </div>
                <a
                  href={LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1877F2] hover:underline"
                >
                  Follow us on Facebook <ExternalLink size={14} />
                </a>
              </div>
            </Reveal>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {fbPosts.map((p, i) => (
                <Reveal key={p.fb_id} delay={i * 0.04}>
                  <a
                    href={p.permalink_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`fb-post-${p.fb_id}`}
                    className="group block bg-white border border-raf-sky/60 h-full flex flex-col overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    {p.full_picture && (
                      <div className="aspect-[16/10] overflow-hidden bg-raf-sky/20">
                        <img
                          src={p.full_picture}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#1877F2] shrink-0">
                          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.023 4.386 11.016 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.273h3.328l-.532 3.49h-2.796v8.437C19.614 23.089 24 18.096 24 12.073z" />
                        </svg>
                        <span className="text-xs text-raf-slate">{p.time_label || fmtDate(p.created_time) || "Latest"}</span>
                      </div>
                      <p className="text-base font-semibold text-raf-navy leading-snug flex-1 line-clamp-3">{p.headline || p.message || "View latest update"}</p>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1877F2]">
                        View on Facebook <ExternalLink size={13} />
                      </span>
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
