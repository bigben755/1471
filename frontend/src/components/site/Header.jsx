import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { CREST_URL, NAV_ITEMS } from "../../data/content";
import { Roundel } from "./Motifs";
import { scrollToId } from "../../utils/nav";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  const handleNav = (href) => {
    setOpen(false);
    setTimeout(() => scrollToId(href), 10);
  };

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-raf-sky shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="flex items-center justify-between h-[68px]">
          <button
            data-testid="brand-home-link"
            onClick={() => handleNav("#home")}
            className="flex items-center gap-3 group"
          >
            <img
              src={CREST_URL}
              alt="1471 Horwich Squadron crest"
              className="h-11 w-11 object-contain"
            />
            <span className="hidden sm:flex flex-col leading-none text-left">
              <span
                className={`font-display font-extrabold tracking-tight text-[15px] ${
                  scrolled ? "text-raf-navy" : "text-white"
                }`}
              >
                1471 Horwich Squadron
              </span>
              <span
                className={`text-[10px] uppercase tracking-[0.2em] mt-1 ${
                  scrolled ? "text-raf-slate" : "text-raf-sky"
                }`}
              >
                RAF Air Cadets
              </span>
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.slice(0, -1).map((item) => (
              <button
                key={item.href}
                data-testid={`nav-${item.label.toLowerCase()}`}
                onClick={() => handleNav(item.href)}
                className={`px-3 py-2 text-sm font-medium rounded-sm transition-colors ${
                  scrolled
                    ? "text-raf-navy hover:text-raf-red"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              data-testid="nav-join-cta"
              onClick={() => handleNav("#join")}
              className="ml-2 px-5 py-2.5 text-sm font-semibold bg-raf-red text-white hover:bg-[#A00926] transition-colors"
            >
              Join
            </button>
          </nav>

          <button
            data-testid="mobile-menu-toggle"
            onClick={() => setOpen((v) => !v)}
            className={`lg:hidden p-2 ${scrolled ? "text-raf-navy" : "text-white"}`}
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
              key={item.href}
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
              onClick={() => handleNav(item.href)}
              className="text-left py-4 text-2xl font-display font-bold text-white border-b border-white/10 hover:text-raf-red transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
