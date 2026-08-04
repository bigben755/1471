import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import axios from "axios";
import { Seo } from "../../components/site/Seo";
import { imgUrl, fmtDate } from "./NewsPage";
import { ArrowLeft, Facebook, Loader2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function NewsDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(undefined);

  useEffect(() => {
    axios.get(`${API}/public/blogs/${slug}`).then(({ data }) => setPost(data)).catch(() => setPost(null));
  }, [slug]);

  if (post === undefined) return <div className="flex items-center gap-2 text-raf-slate p-20 justify-center"><Loader2 className="animate-spin" /> Loading...</div>;
  if (post === null) return <Navigate to="/news" replace />;

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareFb = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank", "width=640,height=520");

  return (
    <div data-testid="news-detail-page">
      <Seo title={`${post.title} | News | 1471 Horwich Squadron RAF Air Cadets`} description={post.excerpt || post.title} />

      <section className="relative bg-raf-navy text-white overflow-hidden">
        {post.cover_image_url && (
          <div className="absolute inset-0">
            <img src={imgUrl(post.cover_image_url)} alt={post.title} className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-r from-raf-navy via-raf-navy/85 to-raf-navy/55" />
          </div>
        )}
        <div className="absolute top-0 right-0 h-full w-[5px] bg-raf-red" />
        <div className="relative max-w-4xl mx-auto px-5 md:px-10 py-16 md:py-24">
          <button data-testid="back-to-news" onClick={() => navigate("/news")} className="inline-flex items-center gap-2 text-sm text-raf-sky hover:text-white transition-colors mb-6"><ArrowLeft size={16} /> All news</button>
          <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight">{post.title}</h1>
          <p className="mt-4 text-raf-sky text-sm">{fmtDate(post.published_at)} · {post.author_name}</p>
        </div>
      </section>

      <article className="py-14 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-5 md:px-10">
          {post.excerpt && <p className="text-lg text-raf-navy font-medium leading-relaxed mb-8">{post.excerpt}</p>}
          <div className="space-y-5">
            {post.body.split("\n\n").map((p, i) => (
              <p key={i} className="text-base md:text-lg text-raf-slate leading-relaxed whitespace-pre-line">{p}</p>
            ))}
          </div>

          {post.images?.length > 0 && (
            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-3" data-testid="news-gallery">
              {post.images.map((src, i) => (
                <img key={i} src={imgUrl(src)} alt={`${post.title} ${i + 1}`} loading="lazy" className="w-full aspect-square object-cover" />
              ))}
            </div>
          )}

          {post.facebook_post_url && (
            <div className="mt-8">
              <a
                data-testid="news-facebook-post-link"
                href={post.facebook_post_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1877F2] text-white font-semibold hover:bg-[#0f66d0] transition-colors"
              >
                <Facebook size={18} /> View linked Facebook post
              </a>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-raf-sky flex items-center gap-3">
            <span className="text-sm text-raf-slate">Share this story:</span>
            <button data-testid="share-facebook" onClick={shareFb} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1877F2] text-white font-semibold hover:bg-[#0f66d0] transition-colors">
              <Facebook size={18} /> Share to Facebook
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
