import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "../../api";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "../ui/dialog";
import {
  Loader2, Plus, Pencil, Trash2, Newspaper, Image as ImageIcon, Eye, Send, X,
} from "lucide-react";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;
const imgUrl = (u) => u && u.startsWith("/api") ? `${BASE_URL}${u}` : u;
const inp = "w-full border border-raf-sky px-3 py-2.5 outline-none focus:border-raf-blue text-sm";
const empty = { title: "", excerpt: "", body: "", cover_image_url: "", images: [], facebook_post_url: "", status: "draft" };

export const BlogAdminPanel = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const coverRef = useRef(null);
  const galRef = useRef(null);

  const load = useCallback(async () => {
    try { const { data } = await api.get("/blogs"); setPosts(data); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const uploadImage = async (file, target) => {
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const { data } = await api.post("/blogs/upload-image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (target === "cover") setEdit((e) => ({ ...e, cover_image_url: data.url }));
      else setEdit((e) => ({ ...e, images: [...e.images, data.url] }));
    } catch (err) { toast.error(err.response?.data?.detail || "Image upload failed."); }
    finally { setUploading(false); }
  };

  const save = async (status) => {
    if (!edit.title || !edit.body) { toast.error("Title and body are required."); return; }
    setBusy(true);
    try {
      const payload = { ...edit, status: status || edit.status };
      if (edit.id) await api.patch(`/blogs/${edit.id}`, payload);
      else await api.post("/blogs", payload);
      toast.success(payload.status === "published" ? "Post published." : "Draft saved.");
      setEdit(null); load();
    } catch (err) { toast.error(err.response?.data?.detail || "Could not save."); }
    finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    await api.delete(`/blogs/${id}`); setPosts((p) => p.filter((x) => x.id !== id)); toast.success("Deleted.");
  };

  return (
    <div>
      <PanelHeading title="News & blog" intro="Write posts that appear on the public website News page and in members' dashboards." />
      <button data-testid="new-post-btn" onClick={() => setEdit({ ...empty })} className="inline-flex items-center gap-2 px-5 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors mb-6">
        <Plus size={18} /> New post
      </button>

      {loading ? (
        <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading...</div>
      ) : posts.length === 0 ? (
        <div className="bg-white p-10 text-center text-raf-slate border border-white"><Newspaper className="mx-auto mb-2 text-raf-sky" /> No posts yet.</div>
      ) : (
        <div className="space-y-3" data-testid="posts-list">
          {posts.map((p) => (
            <div key={p.id} data-testid={`post-${p.id}`} className="bg-white border border-white p-4 flex flex-wrap items-center gap-3">
              <div className="w-14 h-14 bg-raf-sky/40 overflow-hidden shrink-0 flex items-center justify-center">
                {p.cover_image_url ? <img src={imgUrl(p.cover_image_url)} alt="" className="w-full h-full object-cover" /> : <Newspaper size={18} className="text-raf-blue/50" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-bold text-raf-navy truncate">{p.title}</h3>
                  <span className={`text-[10px] uppercase px-2 py-0.5 ${p.status === "published" ? "bg-emerald-600 text-white" : "bg-raf-sky text-raf-blue"}`}>{p.status}</span>
                </div>
                <div className="text-xs text-raf-slate mt-1">{p.author_name} · {new Date(p.created_at).toLocaleDateString("en-GB")}</div>
              </div>
              <div className="flex items-center gap-2">
                {p.status === "published" && <a data-testid={`post-view-${p.id}`} href={`/news/${p.slug}`} target="_blank" rel="noreferrer" className="p-2 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors" title="View"><Eye size={15} /></a>}
                <button data-testid={`post-edit-${p.id}`} onClick={() => setEdit({ id: p.id, title: p.title, excerpt: p.excerpt || "", body: p.body, cover_image_url: p.cover_image_url || "", images: p.images || [], facebook_post_url: p.facebook_post_url || "", status: p.status })} className="p-2 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors" title="Edit"><Pencil size={15} /></button>
                <button data-testid={`post-delete-${p.id}`} onClick={() => remove(p.id)} className="p-2 bg-red-50 text-raf-red hover:bg-raf-red hover:text-white transition-colors" title="Delete"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent data-testid="post-editor" className="max-w-2xl rounded-none max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display text-raf-navy">{edit?.id ? "Edit post" : "New post"}</DialogTitle><DialogDescription className="sr-only">Write a news post</DialogDescription></DialogHeader>
          {edit && (
            <div className="space-y-3">
              <input data-testid="post-title" className={inp} placeholder="Post title" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
              <textarea data-testid="post-excerpt" className={inp} rows={2} placeholder="Short summary (shown on cards)" value={edit.excerpt} onChange={(e) => setEdit({ ...edit, excerpt: e.target.value })} />
              <input data-testid="post-facebook-link" className={inp} placeholder="Facebook post link (optional)" value={edit.facebook_post_url || ""} onChange={(e) => setEdit({ ...edit, facebook_post_url: e.target.value })} />
              <textarea data-testid="post-body" className={inp} rows={8} placeholder="Write your story... (blank line = new paragraph)" value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} />

              <div>
                <div className="text-xs font-semibold text-raf-navy mb-1">Cover image</div>
                <input ref={coverRef} type="file" accept="image/*" data-testid="post-cover-input" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "cover")} />
                {edit.cover_image_url ? (
                  <div className="relative inline-block">
                    <img src={imgUrl(edit.cover_image_url)} alt="cover" className="h-28 object-cover border border-raf-sky" />
                    <button onClick={() => setEdit({ ...edit, cover_image_url: "" })} className="absolute -top-2 -right-2 bg-raf-red text-white p-1"><X size={12} /></button>
                  </div>
                ) : (
                  <button type="button" data-testid="post-cover-btn" onClick={() => coverRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 px-3 py-2 text-xs border border-dashed border-raf-sky text-raf-slate hover:border-raf-blue transition-colors">
                    {uploading ? <Loader2 className="animate-spin" size={13} /> : <ImageIcon size={13} />} Upload cover
                  </button>
                )}
              </div>

              <div>
                <div className="text-xs font-semibold text-raf-navy mb-1">Photos</div>
                <input ref={galRef} type="file" accept="image/*" data-testid="post-gallery-input" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "gallery")} />
                <div className="flex flex-wrap gap-2">
                  {edit.images.map((src, i) => (
                    <div key={i} className="relative">
                      <img src={imgUrl(src)} alt="" className="h-16 w-16 object-cover border border-raf-sky" />
                      <button onClick={() => setEdit({ ...edit, images: edit.images.filter((_, j) => j !== i) })} className="absolute -top-2 -right-2 bg-raf-red text-white p-1"><X size={10} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => galRef.current?.click()} disabled={uploading} className="h-16 w-16 border border-dashed border-raf-sky flex items-center justify-center text-raf-slate hover:border-raf-blue transition-colors"><Plus size={16} /></button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <button data-testid="post-save-draft" onClick={() => save("draft")} disabled={busy} className="px-4 py-2.5 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors disabled:opacity-60">Save draft</button>
            <button data-testid="post-publish" onClick={() => save("published")} disabled={busy} className="inline-flex items-center gap-2 px-6 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors disabled:opacity-60">
              {busy ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Publish
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
