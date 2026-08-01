import { useCallback, useEffect, useState } from "react";
import { api } from "../../api";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import {
  Loader2, Plus, Pencil, Trash2, Eye, EyeOff, ArrowRight, X,
} from "lucide-react";

const inp = "w-full border border-raf-sky px-3 py-2.5 outline-none focus:border-raf-blue text-sm";
const ICON_OPTIONS = [
  "Plane", "Wind", "Mountain", "Award", "HeartPulse", "Compass", "Tent",
  "Trophy", "TentTree", "Shield", "BookOpen", "HeartHandshake", "GraduationCap",
  "Users", "Target", "Rocket", "Globe2", "Sparkles", "Star", "Briefcase",
  "Camera", "Music", "Wrench", "Flag", "Zap",
];

const blank = {
  slug: "",
  title: "",
  strapline: "",
  text: "",
  long: [""],
  highlights: [""],
  quick_facts: [""],
  what_to_expect: [""],
  image_url: "",
  icon_name: "Compass",
  published: true,
};

const listField = (arr, setter, label, placeholder) => (
  <div>
    <label className="block text-xs font-semibold text-raf-navy mb-1">{label}</label>
    {arr.map((v, i) => (
      <div key={i} className="flex gap-2 mb-1.5">
        <input
          className={inp}
          placeholder={`${placeholder} ${i + 1}`}
          value={v}
          onChange={(e) => setter((a) => a.map((x, j) => j === i ? e.target.value : x))}
        />
        {arr.length > 1 && (
          <button type="button" onClick={() => setter((a) => a.filter((_, j) => j !== i))}
            className="p-2 text-raf-red hover:bg-red-50 transition-colors shrink-0">
            <X size={14} />
          </button>
        )}
      </div>
    ))}
    <button type="button" onClick={() => setter((a) => [...a, ""])}
      className="text-xs text-raf-blue hover:underline mt-1">
      + Add {label.toLowerCase()}
    </button>
  </div>
);

export const CustomActivitiesPanel = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "new" | activity object
  const [form, setForm] = useState({ ...blank });
  const [longArr, setLongArr] = useState([""]);
  const [highlightsArr, setHighlightsArr] = useState([""]);
  const [factsArr, setFactsArr] = useState([""]);
  const [expectArr, setExpectArr] = useState([""]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/activities/custom", { params: { include_unpublished: true } });
      setActivities(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setForm({ ...blank });
    setLongArr([""]);
    setHighlightsArr([""]);
    setFactsArr([""]);
    setExpectArr([""]);
    setEditing("new");
  };

  const openEdit = (act) => {
    setForm({
      slug: act.slug,
      title: act.title,
      strapline: act.strapline || "",
      text: act.text || "",
      image_url: act.image_url || "",
      icon_name: act.icon_name || "Compass",
      published: act.published !== false,
    });
    setLongArr(act.long?.length ? act.long : [""]);
    setHighlightsArr(act.highlights?.length ? act.highlights : [""]);
    setFactsArr(act.quick_facts?.length ? act.quick_facts : [""]);
    setExpectArr(act.what_to_expect?.length ? act.what_to_expect : [""]);
    setEditing(act);
  };

  const save = async () => {
    if (!form.slug.trim() || !form.title.trim()) {
      toast.error("Slug and title are required.");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      toast.error("Slug must be lowercase letters, numbers and hyphens only.");
      return;
    }
    setBusy(true);
    const payload = {
      ...form,
      long: longArr.filter(Boolean),
      highlights: highlightsArr.filter(Boolean),
      quick_facts: factsArr.filter(Boolean),
      what_to_expect: expectArr.filter(Boolean),
    };
    try {
      if (editing === "new") {
        await api.post("/activities/custom", payload);
        toast.success("Activity created and will appear on the Activities page.");
      } else {
        await api.patch(`/activities/custom/${editing.slug}`, payload);
        toast.success("Activity updated.");
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not save activity.");
    } finally { setBusy(false); }
  };

  const togglePublished = async (act) => {
    try {
      await api.patch(`/activities/custom/${act.slug}`, { published: !act.published });
      setActivities((prev) => prev.map((a) => a.slug === act.slug ? { ...a, published: !a.published } : a));
    } catch { toast.error("Could not update."); }
  };

  const remove = async (act) => {
    if (!window.confirm(`Delete "${act.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/activities/custom/${act.slug}`);
      setActivities((prev) => prev.filter((a) => a.slug !== act.slug));
      toast.success("Activity deleted.");
    } catch (err) { toast.error(err.response?.data?.detail || "Could not delete."); }
  };

  const f = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  if (editing) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setEditing(null)} className="text-raf-slate hover:text-raf-navy transition-colors text-sm flex items-center gap-1">
            ← Back
          </button>
          <h2 className="font-display font-bold text-raf-navy text-xl">
            {editing === "new" ? "New custom activity" : `Edit: ${editing.title}`}
          </h2>
        </div>

        <div className="space-y-5 bg-white border border-white p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-raf-navy mb-1">Slug (URL path) *</label>
              <input className={inp} placeholder="e.g. photography" value={form.slug}
                onChange={(e) => f("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                disabled={editing !== "new"} />
              <p className="text-[11px] text-raf-slate mt-1">Will appear at /activities/{form.slug || "slug"}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-raf-navy mb-1">Icon</label>
              <select className={inp} value={form.icon_name} onChange={(e) => f("icon_name", e.target.value)}>
                {ICON_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-raf-navy mb-1">Title *</label>
            <input className={inp} placeholder="Activity name" value={form.title} onChange={(e) => f("title", e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-raf-navy mb-1">Strapline</label>
            <input className={inp} placeholder="Short one-line description shown on the card" value={form.strapline} onChange={(e) => f("strapline", e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-raf-navy mb-1">Short description (shown on the activities grid card)</label>
            <textarea className={inp} rows={2} value={form.text} onChange={(e) => f("text", e.target.value)} />
          </div>

          {listField(longArr, setLongArr, "Full description paragraphs (activity detail page)", "Paragraph")}
          {listField(highlightsArr, setHighlightsArr, "Highlights (sidebar bullet points)", "Highlight")}
          {listField(factsArr, setFactsArr, "Quick facts (badge chips)", "Fact")}
          {listField(expectArr, setExpectArr, "What to expect (experience cards)", "Experience")}

          <div>
            <label className="block text-xs font-semibold text-raf-navy mb-1">Banner / card image URL</label>
            <input className={inp} placeholder="/squadron/fieldcraft/photo.jpg or https://..." value={form.image_url} onChange={(e) => f("image_url", e.target.value)} />
            <p className="text-[11px] text-raf-slate mt-1">Use a path from /public/squadron/ or an absolute URL.</p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.published} onChange={(e) => f("published", e.target.checked)} className="w-4 h-4 accent-raf-blue" />
            Published (visible on the public Activities page)
          </label>

          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={busy} className="inline-flex items-center gap-2 px-6 py-2.5 bg-raf-blue text-white hover:bg-raf-navy transition-colors disabled:opacity-60">
              {busy && <Loader2 className="animate-spin" size={15} />}
              {editing === "new" ? "Create activity" : "Save changes"}
            </button>
            <button onClick={() => setEditing(null)} className="px-4 py-2.5 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PanelHeading
        title="Custom Activities"
        intro="Create additional activity pages that appear alongside the built-in ones on the Activities page and at their own URL."
        action={
          <button onClick={openNew} className="inline-flex items-center gap-2 px-5 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors">
            <Plus size={18} /> New activity
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center gap-2 text-raf-slate p-10 justify-center"><Loader2 className="animate-spin" /> Loading…</div>
      ) : activities.length === 0 ? (
        <div className="bg-white border border-white p-10 text-center">
          <p className="text-raf-slate mb-4">No custom activities yet.</p>
          <button onClick={openNew} className="inline-flex items-center gap-2 px-5 py-2.5 bg-raf-blue text-white hover:bg-raf-navy transition-colors">
            <Plus size={16} /> Create your first activity
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((act) => (
            <div key={act.slug} className="bg-white border border-white p-4 flex flex-wrap items-center gap-3">
              {act.image_url && (
                <img src={act.image_url} alt="" className="w-16 h-12 object-cover shrink-0 object-top" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold text-raf-navy">{act.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 uppercase font-bold ${act.published ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {act.published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="text-xs text-raf-slate mt-0.5">/activities/{act.slug}</div>
                {act.text && <div className="text-xs text-raf-slate mt-1 line-clamp-1">{act.text}</div>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={`/activities/${act.slug}`} target="_blank" rel="noreferrer"
                  className="p-2 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors" title="Preview">
                  <ArrowRight size={15} />
                </a>
                <button onClick={() => togglePublished(act)}
                  className="p-2 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors" title={act.published ? "Unpublish" : "Publish"}>
                  {act.published ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button onClick={() => openEdit(act)}
                  className="p-2 bg-raf-sky text-raf-blue hover:bg-raf-blue hover:text-white transition-colors" title="Edit">
                  <Pencil size={15} />
                </button>
                <button onClick={() => remove(act)}
                  className="p-2 bg-red-50 text-raf-red hover:bg-raf-red hover:text-white transition-colors" title="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
