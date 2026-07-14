import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { PanelHeading } from "./PortalShell";
import { Loader2, Newspaper, ArrowRight } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const BASE_URL = process.env.REACT_APP_BACKEND_URL;
const imgUrl = (u) => u && u.startsWith("/api") ? `${BASE_URL}${u}` : u;

export const MemberNewsPanel = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/public/blogs`); setPosts(data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <PanelHeading title="News" intro="The latest news and stories from the squadron." />
      {loading ? (
        <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading...</div>
      ) : posts.length === 0 ? (
        <div className="bg-white p-10 text-center text-raf-slate border border-white"><Newspaper className="mx-auto mb-2 text-raf-sky" /> No news yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2" data-testid="member-news-list">
          {posts.map((p) => (
            <a key={p.slug} data-testid={`member-news-${p.slug}`} href={`/news/${p.slug}`} target="_blank" rel="noreferrer" className="group bg-white border border-white overflow-hidden hover:shadow-lg transition-all flex flex-col">
              <div className="aspect-[16/9] overflow-hidden bg-raf-sky/40">
                {p.cover_image_url ? <img src={imgUrl(p.cover_image_url)} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-raf-blue/40"><Newspaper size={32} /></div>}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className="text-xs text-raf-slate">{p.published_at ? new Date(p.published_at).toLocaleDateString("en-GB") : ""}</span>
                <h3 className="mt-1 font-display font-bold text-raf-navy">{p.title}</h3>
                <p className="mt-2 text-sm text-raf-slate flex-1">{p.excerpt}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-raf-red">Read more <ArrowRight size={15} /></span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
