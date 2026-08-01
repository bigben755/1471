import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { extractPageEditableContent } from "../../lib/siteCmsDom";
import { Loader2, X, Type, Image as ImageIcon } from "lucide-react";

const inputCls = "w-full border border-raf-sky px-3 py-2.5 outline-none focus:border-raf-blue text-sm";

function normalize(overrides) {
  return {
    texts: overrides?.texts || {},
    images: overrides?.images || {},
  };
}

export const SiteQuickEditDrawer = ({
  open,
  path,
  rootRef,
  onClose,
  savedOverrides,
  draftOverrides,
  onDraftChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [texts, setTexts] = useState([]);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try {
        const root = rootRef?.current;
        if (!root) throw new Error("Could not inspect page");
        const scanned = extractPageEditableContent(root);
        const source = normalize(draftOverrides || savedOverrides);
        const textMap = source.texts;
        const imageMap = source.images;
        setTexts(scanned.texts.map((t) => ({ ...t, value: textMap[t.key] ?? t.value })));
        setImages(scanned.images.map((img) => ({
          ...img,
          valueSrc: imageMap[img.key]?.src ?? img.src,
          valueAlt: imageMap[img.key]?.alt ?? img.alt,
        })));
      } catch (err) {
        toast.error(err?.message || "Could not load editable page content.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, path, rootRef, savedOverrides, draftOverrides]);

  const publishDraft = (nextTexts, nextImages) => {
    if (!onDraftChange) return;
    const textPayload = {};
    nextTexts.forEach((t) => {
      textPayload[t.key] = t.value || "";
    });
    const imagePayload = {};
    nextImages.forEach((img) => {
      imagePayload[img.key] = { src: img.valueSrc || "", alt: img.valueAlt || "" };
    });
    onDraftChange(path, { texts: textPayload, images: imagePayload });
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

  return (
    <div
      data-cms-ignore="true"
      className={`fixed inset-y-0 right-0 z-[120] w-full sm:w-[560px] bg-white border-l border-raf-sky shadow-2xl transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}
      aria-hidden={!open}
    >
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-raf-sky bg-raf-navy text-white flex items-center gap-3">
          <div>
            <h3 className="font-display text-lg font-bold">Edit this page</h3>
            <p className="text-xs text-white/75">{path}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto p-2 bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close editor"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 border-b border-raf-sky">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search text or image fields"
            className={inputCls}
            data-testid="quick-edit-search"
          />
          <p className="mt-2 text-[11px] text-raf-slate">
            Changes are staged across pages. Use Save in the top-right editor controls to publish live.
          </p>
          <div className="mt-2 text-xs text-raf-slate">
            <span className="inline-flex items-center gap-1.5 mr-3"><Type size={12} className="text-raf-blue" /> {texts.length} text fields</span>
            <span className="inline-flex items-center gap-1.5"><ImageIcon size={12} className="text-raf-blue" /> {images.length} images</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-raf-slate"><Loader2 size={16} className="animate-spin" /> Loading editable fields...</div>
          ) : (
            <>
              {filteredTexts.map((t, idx) => (
                <div key={t.key} className="border border-raf-sky p-3" data-testid={`quick-text-${idx}`}>
                  <div className="text-[11px] text-raf-slate mb-1 break-all">{t.key}</div>
                  <textarea
                    rows={2}
                    className={inputCls}
                    value={t.value}
                    onChange={(e) => {
                      setTexts((all) => {
                        const nextTexts = all.map((x) => x.key === t.key ? { ...x, value: e.target.value } : x);
                        publishDraft(nextTexts, images);
                        return nextTexts;
                      });
                    }}
                  />
                </div>
              ))}

              {filteredImages.map((img, idx) => (
                <div key={img.key} className="border border-raf-sky p-3" data-testid={`quick-image-${idx}`}>
                  <div className="text-[11px] text-raf-slate mb-1 break-all">{img.key}</div>
                  <label className="block text-xs font-semibold text-raf-navy mb-1">Image URL</label>
                  <input
                    className={inputCls}
                    value={img.valueSrc}
                    onChange={(e) => {
                      setImages((all) => {
                        const nextImages = all.map((x) => x.key === img.key ? { ...x, valueSrc: e.target.value } : x);
                        publishDraft(texts, nextImages);
                        return nextImages;
                      });
                    }}
                  />
                  <label className="block text-xs font-semibold text-raf-navy mt-2 mb-1">Alt text</label>
                  <input
                    className={inputCls}
                    value={img.valueAlt}
                    onChange={(e) => {
                      setImages((all) => {
                        const nextImages = all.map((x) => x.key === img.key ? { ...x, valueAlt: e.target.value } : x);
                        publishDraft(texts, nextImages);
                        return nextImages;
                      });
                    }}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
