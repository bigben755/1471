import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { CREST_URL, NAV_ITEMS } from "../../data/content";
import { Roundel } from "./Motifs";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Solid header everywhere except the top of the home page (transparent over hero).
  const solid = scrolled || !isHome;

  const go = (to) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <header
      data-testid="site-header"
      className={`${isHome ? "fixed" : "sticky"} top-0 inset-x-0 z-50 transition-all duration-300 ${
        solid ? "bg-white/95 backdrop-blur-md border-b border-raf-sky shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="flex items-center justify-between h-[68px]">
          <button
            data-testid="brand-home-link"
            onClick={() => go("/")}
            className="flex items-center gap-3 group"
          >
            <img src={CREST_URL} alt="1471 Horwich Squadron crest" className="h-11 w-11 object-contain" />
            <span className="hidden sm:flex flex-col leading-none text-left">
              <span className={`font-display font-extrabold tracking-tight text-[15px] ${solid ? "text-raf-navy" : "text-white"}`}>
                1471 Horwich Squadron
              </span>
              <span className={`text-[10px] uppercase tracking-[0.2em] mt-1 ${solid ? "text-raf-slate" : "text-raf-sky"}`}>
                RAF Air Cadets
              </span>
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.slice(0, -1).map((item) => {
              const active = location.pathname === item.to;
              return (
                <button
                  key={item.to}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  onClick={() => go(item.to)}
                  className={`px-3 py-2 text-sm font-medium rounded-sm transition-colors ${
                    solid
                      ? active ? "text-raf-red" : "text-raf-navy hover:text-raf-red"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <a
              data-testid="nav-signin"
              href="/portal"
              className={`px-3 py-2 text-sm font-medium rounded-sm transition-colors ${
                solid ? "text-raf-navy hover:text-raf-red" : "text-white/90 hover:text-white"
              }`}
            >
              Sign in
            </a>
            <button
              data-testid="nav-join-cta"
              onClick={() => go("/join")}
              className="ml-2 px-5 py-2.5 text-sm font-semibold bg-raf-red text-white hover:bg-[#A00926] transition-colors"
            >
              Join
            </button>
          </nav>

          <button
            data-testid="mobile-menu-toggle"
            onClick={() => setOpen((v) => !v)}
            className={`lg:hidden p-2 ${solid ? "text-raf-navy" : "text-white"}`}
            aria-label="Toggle menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        data-testid="mobile-menu"
        className={`lg:hidden fixed inset-0 top-[68px] bg-raf-navy transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="route-lines absolute inset-0 opacity-40" />
        <Roundel className="absolute -right-16 -bottom-16 w-64 h-64 opacity-10" />
        <nav className="relative flex flex-col p-6 gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.to}
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
              onClick={() => go(item.to)}
              className="text-left py-4 text-2xl font-display font-bold text-white border-b border-white/10 hover:text-raf-red hover:pl-2 transition-all duration-200"
            >
              {item.label}
            </button>
          ))}
          <a
            data-testid="mobile-nav-signin"
            href="/portal"
            className="text-left py-4 text-2xl font-display font-bold text-raf-sky border-b border-white/10 hover:text-raf-red hover:pl-2 transition-all duration-200"
          >
            Members sign in
          </a>
          <button
            onClick={() => go("/join")}
            className="mt-6 w-full py-4 bg-raf-red text-white font-display font-bold text-xl text-center animate-pulse-cta hover:bg-[#A00926] transition-colors"
          >
            Join as a Cadet &rarr;
          </button>
        </nav>
      </div>
    </header>
  );
};
