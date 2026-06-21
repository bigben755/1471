import { useNavigate } from "react-router-dom";
import { CREST_URL, LINKS, VENUE, NAV_ITEMS } from "../../data/content";
import { Roundel, SwooshDivider } from "./Motifs";
import { Facebook, ExternalLink, MapPin, Clock } from "lucide-react";

export const Footer = () => {
  const navigate = useNavigate();
  return (
  <footer data-testid="site-footer" className="relative bg-raf-navy text-white overflow-hidden">
    <SwooshDivider fill="#071A2F" className="-mt-px" />
    <Roundel className="absolute -right-24 -bottom-24 w-80 h-80 opacity-[0.06]" />
    <div className="absolute inset-0 route-lines opacity-20" />

    <div className="relative max-w-7xl mx-auto px-5 md:px-10 py-16">
      <div className="grid md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <div className="flex items-center gap-4">
            <img src={CREST_URL} alt="1471 Horwich Squadron crest" className="h-14 w-14 object-contain" />
            <div>
              <div className="font-display font-extrabold text-lg leading-tight">1471 Horwich Squadron</div>
              <div className="text-xs uppercase tracking-[0.2em] text-raf-sky mt-1">RAF Air Cadets</div>
            </div>
          </div>
          <p className="mt-6 text-white/70 leading-relaxed max-w-sm">
            1471 Horwich Squadron RAF Air Cadets &mdash; Horwich, Greater
            Manchester. Part of the Royal Air Force Air Cadets.
          </p>
          <div className="mt-6 space-y-3 text-sm text-white/80">
            <div className="flex items-start gap-3">
              <Clock size={18} className="text-raf-sky shrink-0 mt-0.5" />
              <span>{VENUE.nights}, {VENUE.time}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-raf-sky shrink-0 mt-0.5" />
              <span>{VENUE.name}, {VENUE.address}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-xs uppercase tracking-[0.2em] text-raf-sky font-semibold">Explore</h4>
          <ul className="mt-5 space-y-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <button
                  data-testid={`footer-nav-${item.label.toLowerCase()}`}
                  onClick={() => navigate(item.to)}
                  className="text-white/75 hover:text-white transition-colors"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <h4 className="text-xs uppercase tracking-[0.2em] text-raf-sky font-semibold">Official links</h4>
          <div className="mt-5 space-y-3">
            <a
              data-testid="footer-national-link"
              href={LINKS.national}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ExternalLink size={16} /> RAF Air Cadets national website
            </a>
            <a
              data-testid="footer-facebook-link"
              href={LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <Facebook size={16} /> 1471 Horwich RAFAC on Facebook
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-white/10">
        <p className="text-xs text-white/55 leading-relaxed max-w-4xl">
          This website supports local squadron communication and recruitment.
          Official RAF Air Cadets policies, joining procedures and activity
          authorisation processes remain managed through RAFAC channels.
        </p>
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white/45">
          <span>&copy; {new Date().getFullYear()} 1471 Horwich Squadron RAF Air Cadets</span>
          <a data-testid="footer-admin-link" href="/portal" className="hover:text-white/80 transition-colors">Members area sign in</a>
        </div>
      </div>
    </div>
  </footer>
  );
};
