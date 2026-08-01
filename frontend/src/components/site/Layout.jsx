import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LINKS } from "../../data/content";
import { api, getToken } from "../../api";
import { applyPageOverrides } from "../../lib/siteCmsDom";
import { SiteQuickEditDrawer } from "./SiteQuickEditDrawer";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const EMPTY_OVERRIDES = { texts: {}, images: {} };

function normalize(overrides) {
  return {
    texts: overrides?.texts || {},
    images: overrides?.images || {},
  };
}

function isSameOverrides(a, b) {
  const left = normalize(a);
  const right = normalize(b);
  return JSON.stringify(left.texts) === JSON.stringify(right.texts)
    && JSON.stringify(left.images) === JSON.stringify(right.images);
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Site-wide Organisation JSON-LD (injected once).
function OrgSchema() {
  useEffect(() => {
    const data = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "1471 Horwich Squadron RAF Air Cadets",
      alternateName: "1471 (Horwich) Squadron Air Training Corps",
      url: window.location.origin,
      sameAs: [LINKS.national, LINKS.facebook],
      address: {
        "@type": "PostalAddress",
        streetAddress: "St Joseph's Secondary School & Sports College, Chorley New Road",
        addressLocality: "Horwich", addressRegion: "Greater Manchester",
        postalCode: "BL6 6HW", addressCountry: "GB",
      },
      areaServed: ["Horwich", "Bolton", "Greater Manchester"],
    };
    let s = document.getElementById("ld-org");
    if (!s) {
      s = document.createElement("script");
      s.type = "application/ld+json";
      s.id = "ld-org";
      document.head.appendChild(s);
    }
    s.textContent = JSON.stringify(data);
  }, []);
  return null;
}

export const Layout = () => {
  const { pathname } = useLocation();
  const siteRef = useRef(null);
  const [savedByPath, setSavedByPath] = useState({});
  const [draftByPath, setDraftByPath] = useState({});
  const [sessionStartByPath, setSessionStartByPath] = useState({});
  const [canEdit, setCanEdit] = useState(false);
  const [editSessionActive, setEditSessionActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [undoing, setUndoing] = useState(false);

  const loadOverrides = (path) => api.get("/site-content/page", { params: { path } })
    .then(({ data }) => {
      setSavedByPath((prev) => ({ ...prev, [path]: normalize(data) }));
    })
    .catch(() => {
      setSavedByPath((prev) => ({ ...prev, [path]: EMPTY_OVERRIDES }));
    });

  const currentSaved = savedByPath[pathname] || EMPTY_OVERRIDES;
  const currentDraft = draftByPath[pathname];
  const currentOverrides = editSessionActive ? (currentDraft || currentSaved) : currentSaved;
  const stagedPages = Object.keys(draftByPath);
  const touchedPages = Object.keys(sessionStartByPath);

  useEffect(() => {
    loadOverrides(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!getToken()) {
      setCanEdit(false);
      return;
    }
    let live = true;
    api.get("/auth/me")
      .then(({ data }) => {
        if (!live) return;
        setCanEdit(data?.role === "admin");
      })
      .catch(() => {
        if (!live) return;
        setCanEdit(false);
      });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      if (siteRef.current) applyPageOverrides(siteRef.current, currentOverrides);
    });
    return () => window.cancelAnimationFrame(id);
  }, [pathname, currentOverrides]);

  const onDraftChange = (path, nextDraft) => {
    const normalizedDraft = normalize(nextDraft);
    const baseline = savedByPath[path] || EMPTY_OVERRIDES;

    setSessionStartByPath((prev) => {
      if (prev[path]) return prev;
      return { ...prev, [path]: baseline };
    });

    setDraftByPath((prev) => {
      const next = { ...prev };
      if (isSameOverrides(normalizedDraft, baseline)) {
        delete next[path];
      } else {
        next[path] = normalizedDraft;
      }
      return next;
    });
  };

  const startEditing = () => {
    setEditSessionActive(true);
  };

  const stopEditing = () => {
    if (stagedPages.length > 0 && !window.confirm("Discard staged website edits from this session?")) {
      return;
    }
    setEditSessionActive(false);
    setDraftByPath({});
    setSessionStartByPath({});
  };

  const saveSession = async () => {
    if (stagedPages.length === 0) {
      toast.info("No staged page edits to save.");
      return;
    }
    setSaving(true);
    try {
      for (const path of stagedPages) {
        const payload = normalize(draftByPath[path]);
        const hasValues = Object.keys(payload.texts).length > 0 || Object.keys(payload.images).length > 0;
        if (!hasValues) {
          await api.delete("/site-content/pages", { params: { path } });
        } else {
          await api.put("/site-content/pages", { path, texts: payload.texts, images: payload.images });
        }
      }
      setSavedByPath((prev) => {
        const next = { ...prev };
        stagedPages.forEach((path) => {
          next[path] = normalize(draftByPath[path]);
        });
        return next;
      });
      setDraftByPath({});
      toast.success(`Published ${stagedPages.length} page${stagedPages.length === 1 ? "" : "s"} live.`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not publish website edits.");
    } finally {
      setSaving(false);
    }
  };

  const undoSession = async () => {
    if (touchedPages.length === 0) {
      toast.info("No session edits to undo.");
      return;
    }
    if (!window.confirm("Revert all website edits from this editing session?")) return;
    setUndoing(true);
    try {
      for (const path of touchedPages) {
        const snapshot = normalize(sessionStartByPath[path]);
        const hasValues = Object.keys(snapshot.texts).length > 0 || Object.keys(snapshot.images).length > 0;
        if (!hasValues) {
          await api.delete("/site-content/pages", { params: { path } });
        } else {
          await api.put("/site-content/pages", { path, texts: snapshot.texts, images: snapshot.images });
        }
      }
      setSavedByPath((prev) => {
        const next = { ...prev };
        touchedPages.forEach((path) => {
          next[path] = normalize(sessionStartByPath[path]);
        });
        return next;
      });
      setDraftByPath({});
      setSessionStartByPath({});
      toast.success("Session changes were reverted to the previous live state.");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not undo this editing session.");
    } finally {
      setUndoing(false);
    }
  };

  return (
    <div ref={siteRef}>
      <ScrollToTop />
      <OrgSchema />
      <Header />

      {/* Admin website editing controls */}
      {canEdit && (
        <div
          data-cms-ignore="true"
          className="fixed right-3 top-[78px] z-[130] flex flex-col items-end gap-2"
        >
          <button
            type="button"
            onClick={() => (editSessionActive ? stopEditing() : startEditing())}
            className={`inline-flex items-center justify-center min-w-[128px] px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.18em] shadow-lg transition-colors ${
              editSessionActive
                ? "bg-raf-red text-white"
                : "bg-raf-navy/95 text-white hover:bg-raf-blue"
            }`}
            data-testid="site-editing-pill"
          >
            Editing
          </button>
          {editSessionActive && (
            <>
              <button
                type="button"
                onClick={saveSession}
                disabled={saving || undoing || stagedPages.length === 0}
                className="inline-flex items-center justify-center gap-1.5 min-w-[128px] px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-55 disabled:cursor-not-allowed transition-colors"
                data-testid="site-edit-save-pill"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
              </button>
              <button
                type="button"
                onClick={undoSession}
                disabled={saving || undoing || touchedPages.length === 0}
                className="inline-flex items-center justify-center gap-1.5 min-w-[128px] px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-55 disabled:cursor-not-allowed transition-colors"
                data-testid="site-edit-undo-pill"
              >
                {undoing ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />} Undo
              </button>
              <a
                href="/portal"
                className="inline-flex items-center justify-center min-w-[128px] px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] bg-white/90 text-raf-navy hover:bg-white transition-colors"
              >
                Portal
              </a>
              <div className="px-2 text-[10px] font-semibold text-white/80 bg-raf-navy/80 rounded-full">
                {stagedPages.length} staged {stagedPages.length === 1 ? "page" : "pages"}
              </div>
            </>
          )}
        </div>
      )}

      <main>
        <Outlet />
      </main>
      <Footer canEdit={canEdit} editOpen={editSessionActive} onEditToggle={() => (editSessionActive ? stopEditing() : startEditing())} />
      <SiteQuickEditDrawer
        open={canEdit && editSessionActive}
        path={pathname}
        rootRef={siteRef}
        onClose={stopEditing}
        savedOverrides={currentSaved}
        draftOverrides={currentDraft}
        onDraftChange={onDraftChange}
      />
    </div>
  );
};
