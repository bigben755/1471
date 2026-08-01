import { useMemo, useRef, useState } from "react";
import { api } from "../../api";
import { toast } from "sonner";
import { PanelHeading } from "./PortalShell";
import { extractPageEditableContent } from "../../lib/siteCmsDom";
import { Loader2, RefreshCcw, Save, Trash2, Globe, Image as ImageIcon, Type } from "lucide-react";

const ROUTES = [
  "/",
  "/about",
  "/activities",
  "/cadets",
  "/parents",
  "/volunteer",
  "/faq",
  "/news",
  "/join",
  // Activity detail pages
  "/activities/flying",
  "/activities/gliding",
  "/activities/adventure-training",
  "/activities/overseas-camp",
  "/activities/dofe",
  "/activities/first-aid",
  "/activities/leadership",
  "/activities/awards",
  "/activities/fieldcraft",
  "/activities/sport",
  "/activities/camps",
  "/activities/raf-station-visits",
  "/activities/airshows",
  "/activities/drill-and-uniform",
  "/activities/classification-training",
  "/activities/aviation-studies",
  "/activities/community-events",
  "/activities/shooting",
  "/activities/stem",
  "/activities/remembrance",
  "/activities/fun-activities",
];

const inputCls = "w-full border border-raf-sky px-3 py-2.5 outline-none focus:border-raf-blue text-sm";

function mergeScannedWithSaved(scanned, saved) {
  const textMap = saved?.texts || {};
  const imageMap = saved?.images || {};
  return {
    texts: scanned.texts.map((t) => ({ ...t, value: textMap[t.key] ?? t.value })),
    images: scanned.images.map((img) => ({
      ...img,
      valueSrc: imageMap[img.key]?.src ?? img.src,
      valueAlt: imageMap[img.key]?.alt ?? img.alt,
    })),
  };
}

export const SiteContentPanel = () => {
  const iframeRef = useRef(null);
  const [route, setRoute] = useState("/");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [texts, setTexts] = useState([]);
  const [images, setImages] = useState([]);

  const loadRoute = async () => {
    setLoading(true);
    try {
      await new Promise((resolve, reject) => {
        const frame = iframeRef.current;
        if (!frame) { reject(new Error("No iframe")); return; }
        const target = `${window.location.origin}${route}?cms_preview=1&t=${Date.now()}`;
        frame.onload = () => resolve();
        frame.onerror = () => reject(new Error("Could not load page"));
        frame.src = target;
      });

      const frame = iframeRef.current;
      const doc = frame?.contentDocument;
      const root = doc?.querySelector("main") || doc?.body;
      if (!root) throw new Error("Could not inspect page content");

      const scanned = extractPageEditableContent(root);
      const { data: saved } = await api.get("/site-content/page", { params: { path: route } });
      const merged = mergeScannedWithSaved(scanned, saved);
      setTexts(merged.texts);
      setImages(merged.images);
      setLoaded(true);
      toast.success(`Loaded ${merged.texts.length} text fields and ${merged.images.length} images.`);
    } catch (err) {
      toast.error(err?.message || "Could not load page content.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTexts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return texts;
    return texts.filter((t) => t.value.toLowerCase().includes(q) || t.key.toLowerCase().includes(q));
  }, [texts, search]);

  const filteredImages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return images;
    return images.filter((i) => (i.valueSrc || "").toLowerCase().includes(q) || (i.valueAlt || "").toLowerCase().includes(q) || i.key.toLowerCase().includes(q));
  }, [images, search]);

  const save = async () => {
    if (!loaded) return;
    setSaving(true);
    try {
      const textPayload = {};
      texts.forEach((t) => {
        if ((t.value || "") !== (t.original || "")) textPayload[t.key] = t.value || "";
      });
      const imagePayload = {};
      images.forEach((img) => {
        const srcChanged = (img.valueSrc || "") !== (img.src || "");
        const altChanged = (img.valueAlt || "") !== (img.alt || "");
        if (srcChanged || altChanged) imagePayload[img.key] = { src: img.valueSrc || "", alt: img.valueAlt || "" };
      });

      await api.put("/site-content/pages", { path: route, texts: textPayload, images: imagePayload });
      toast.success("Website page content saved.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not save content.");
    } finally {
      setSaving(false);
    }
  };

  const clearOverrides = async () => {
    if (!window.confirm(`Clear saved overrides for ${route}?`)) return;
    try {
      await api.delete("/site-content/pages", { params: { path: route } });
      toast.success("Overrides cleared for this page.");
      setLoaded(false);
      setTexts([]);
      setImages([]);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not clear overrides.");
    }
  };

  return (
    <div>
      <PanelHeading
        title="Website Content"
        intro="Edit text and image content for public site pages without changing code. Load a page, edit fields, then save."
      />

      <div className="bg-white border border-white p-5 space-y-4" data-testid="site-content-panel">
        <div className="grid md:grid-cols-[220px_1fr_auto_auto] gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-raf-navy mb-1">Page</label>
            <select value={route} onChange={(e) => setRoute(e.target.value)} className={inputCls} data-testid="site-route-select">
              {ROUTES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-raf-navy mb-1">Search loaded fields</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find text or image fields" className={inputCls} data-testid="site-content-search" />
          </div>
          <button type="button" onClick={loadRoute} disabled={loading} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-raf-blue text-white hover:bg-raf-navy transition-colors disabled:opacity-60" data-testid="site-content-load">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />} Load page
          </button>
          <button type="button" onClick={clearOverrides} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-raf-red hover:bg-raf-red hover:text-white transition-colors" data-testid="site-content-clear">
            <Trash2 size={16} /> Clear saved
          </button>
        </div>

        {loaded && (
          <>
            <div className="text-xs text-raf-slate">
              <span className="inline-flex items-center gap-1.5 mr-4"><Type size={13} className="text-raf-blue" /> {texts.length} text fields</span>
              <span className="inline-flex items-center gap-1.5"><ImageIcon size={13} className="text-raf-blue" /> {images.length} images</span>
            </div>

            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              {filteredTexts.map((t, idx) => (
                <div key={t.key} className="border border-raf-sky p-3" data-testid={`cms-text-${idx}`}>
                  <div className="text-[11px] text-raf-slate mb-1 break-all">{t.key}</div>
                  <textarea
                    rows={2}
                    className={inputCls}
                    value={t.value}
                    onChange={(e) => setTexts((all) => all.map((x) => x.key === t.key ? { ...x, value: e.target.value } : x))}
                  />
                </div>
              ))}

              {filteredImages.map((img, idx) => (
                <div key={img.key} className="border border-raf-sky p-3" data-testid={`cms-image-${idx}`}>
                  <div className="text-[11px] text-raf-slate mb-1 break-all">{img.key}</div>
                  <label className="block text-xs font-semibold text-raf-navy mb-1">Image URL</label>
                  <input
                    className={inputCls}
                    value={img.valueSrc}
                    onChange={(e) => setImages((all) => all.map((x) => x.key === img.key ? { ...x, valueSrc: e.target.value } : x))}
                  />
                  <label className="block text-xs font-semibold text-raf-navy mt-2 mb-1">Alt text</label>
                  <input
                    className={inputCls}
                    value={img.valueAlt}
                    onChange={(e) => setImages((all) => all.map((x) => x.key === img.key ? { ...x, valueAlt: e.target.value } : x))}
                  />
                  <div className="mt-2 text-xs text-raf-slate break-all">Current: {img.src}</div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors disabled:opacity-60" data-testid="site-content-save">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save page content
              </button>
            </div>
          </>
        )}

        {!loaded && (
          <div className="text-sm text-raf-slate inline-flex items-center gap-2">
            <Globe size={16} className="text-raf-blue" /> Choose a page and click Load page to begin editing.
          </div>
        )}
      </div>

      <iframe ref={iframeRef} title="site-cms-scanner" className="hidden" />
    </div>
  );
};
