import { useState } from "react";
import { PanelHeading } from "./PortalShell";
import { Globe } from "lucide-react";

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

export const SiteContentPanel = () => {
  const [route, setRoute] = useState("/");

  const openDirectEditor = () => {
    const url = `${window.location.origin}${route}?cms_editor=1`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      <PanelHeading
        title="Website Content"
        intro="Single admin entry point for website editing. Choose a page and launch the direct editor."
      />

      <div className="bg-white border border-white p-5 space-y-4" data-testid="site-content-panel">
        <div className="grid md:grid-cols-[280px_auto] gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-raf-navy mb-1">Page</label>
            <select value={route} onChange={(e) => setRoute(e.target.value)} className={inputCls} data-testid="site-route-select">
              {ROUTES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button type="button" onClick={openDirectEditor} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors" data-testid="site-content-open-direct">
            <Globe size={16} /> Open direct editor
          </button>
        </div>
        <div className="text-sm text-raf-slate inline-flex items-center gap-2">
          <Globe size={16} className="text-raf-blue" /> Editing is available only through this admin launch action.
        </div>
      </div>
    </div>
  );
};
