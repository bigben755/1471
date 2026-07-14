import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Seo } from "../../components/site/Seo";
import { Reveal, SectionHeading } from "../../components/site/Reveal";
import { Newspaper, ArrowRight, Loader2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
export const imgUrl = (u) => u && u.startsWith("/api") ? `${process.env.REACT_APP_BACKEND_URL}${u}` : u;
export const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

export default function NewsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/public/blogs`).then(({ data }) => setPosts(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="news-page">
      <Seo title="News | 1471 Horwich Squadron RAF Air Cadets" description="Latest news, achievements and events from 1471 Horwich Squadron RAF Air Cadets." />

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
    </div>
  );
}
