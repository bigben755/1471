import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS } from "../../api";
import { CREST_URL } from "../../data/content";
import { LogOut, ExternalLink } from "lucide-react";

const ROLE_BADGE = {
  admin: "bg-raf-red text-white",
  cfav: "bg-raf-red text-white",
  cadet: "bg-emerald-600 text-white",
  parent: "bg-raf-blue text-white",
};

export const PortalShell = ({ tabs, active, onTab, children }) => {
  const { user, logout } = useAuth();
  const roleText = user?.role === "cfav"
    ? (user?.is_uniformed ? "CFAV (uniformed)" : "CFAV (non-uniformed)")
    : ROLE_LABELS[user?.role];
  return (
    <div className="min-h-screen bg-raf-sky">
      <header className="bg-raf-navy text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={CREST_URL} alt="crest" className="h-10 w-10 object-contain" />
              <div className="leading-tight">
                <div className="font-display font-bold text-sm">1471 Members Area</div>
                <div className="text-[11px] text-raf-sky">{user?.first_name} {user?.last_name}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`hidden sm:inline-block text-[10px] uppercase tracking-wide px-2.5 py-1 ${ROLE_BADGE[user?.role]}`}>
                {roleText}
              </span>
              <a href="/" className="hidden md:flex items-center gap-1 text-xs text-raf-sky hover:text-white">
                <ExternalLink size={14} /> Website
              </a>
              <button
                data-testid="portal-logout"
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 transition-colors text-sm"
              >
                <LogOut size={15} /> <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto -mb-px">
            {tabs.map((t) => (
              <button
                key={t.key}
                data-testid={`tab-${t.key}`}
                onClick={() => onTab(t.key)}
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  active === t.key
                    ? "border-raf-red text-white"
                    : "border-transparent text-white/65 hover:text-white"
                }`}
              >
                {t.icon && <t.icon size={16} />} {t.label}
                {t.badge ? (
                  <span className="ml-1 text-[10px] bg-raf-red text-white px-1.5 py-0.5 rounded-full">{t.badge}</span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">{children}</main>
    </div>
  );
};

export const PanelHeading = ({ title, intro, action }) => (
  <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-extrabold text-raf-navy">{title}</h1>
      {intro && <p className="mt-1 text-raf-slate text-sm">{intro}</p>}
    </div>
    {action}
  </div>
);
