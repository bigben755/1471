import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CREST_URL, SKY_HERO, HIGHLIGHTS, VENUE } from "../../data/content";
import { Roundel } from "./Motifs";

export const Hero = () => {
  const navigate = useNavigate();
  const join = (enquiryType) => navigate("/join", { state: { enquiryType } });
  return (
    <section
      id="home"
      data-testid="hero-section"
      className="relative min-h-[100svh] flex items-center overflow-hidden bg-raf-navy"
    >
      {/* Aviation background */}
      <div className="absolute inset-0">
        <img
          src={SKY_HERO}
          alt="1471 Horwich Squadron cadets in the sky"
          className="w-full h-full object-cover object-center animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-raf-navy/95 via-raf-blue/85 to-raf-navy/80" />
        <div className="absolute inset-0 route-lines opacity-30" />
      </div>

      {/* Roundel + red accent */}
      <Roundel className="absolute -left-24 -bottom-24 w-72 h-72 md:w-96 md:h-96 opacity-[0.08]" />
      <div className="absolute top-0 right-0 h-full w-[5px] bg-raf-red" />

      <div className="relative w-full max-w-7xl mx-auto px-5 md:px-10 pt-28 pb-16">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 mb-6"
            >
              <span className="h-[3px] w-10 bg-raf-red" />
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-raf-sky">
                Royal Air Force Air Cadets
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.05 }}
              className="font-display font-black tracking-tight text-white text-4xl sm:text-5xl lg:text-6xl leading-[1.02]"
            >
              1471 Horwich
              <br />
              <span className="text-raf-sky">Squadron</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15 }}
              className="mt-6 max-w-xl text-base md:text-lg text-white/85 leading-relaxed"
            >
              Fly aircraft. Summit mountains. Lead expeditions. Compete
              nationally. 1471 Horwich Squadron opens extraordinary doors for
              young people aged 12 to 17 &mdash; no experience needed, just
              ambition.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.25 }}
              className="mt-9 flex flex-col sm:flex-row flex-wrap gap-3"
            >
              <button
                data-testid="hero-join-cadet"
                onClick={() => join("Join as a Cadet")}
                className="px-7 py-3.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors animate-pulse-cta"
              >
                Join as a Cadet
              </button>
              <button
                data-testid="hero-become-volunteer"
                onClick={() => join("Adult Volunteer Enquiry")}
                className="px-7 py-3.5 bg-white text-raf-navy font-semibold hover:bg-raf-sky transition-colors"
              >
                Become an Adult Volunteer
              </button>
              <button
                data-testid="hero-message-squadron"
                onClick={() => join("General Enquiry")}
                className="px-7 py-3.5 border-2 border-white/70 text-white font-semibold hover:bg-white hover:text-raf-navy transition-colors"
              >
                Message the Squadron
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 text-sm text-white/70"
            >
              {VENUE.nights} &middot; {VENUE.time} &middot; Horwich, Greater Manchester
            </motion.div>

            {/* Mobile photo grid — visible when desktop mosaic is hidden */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="lg:hidden mt-7 grid grid-cols-3 gap-1.5"
            >
              {[
                { src: "/squadron/flying/flying-cadet-in-cockpit-2.jpg", focus: "object-center", label: "Flying" },
                { src: "/squadron/fieldcraft/20260721_083302 (1).jpg", focus: "object-[50%_35%]", label: "Fieldcraft" },
                { src: "/squadron/overseas/overseas-1-group-photo.jpg", focus: "object-top", label: "Overseas" },
              ].map((img, i) => (
                <div key={i} className="relative aspect-[4/3] overflow-hidden">
                  <img src={img.src} alt={img.label} className={`w-full h-full object-cover ${img.focus}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-raf-navy/85 to-transparent" />
                  <span className="absolute bottom-1.5 left-2 text-[9px] text-raf-sky uppercase tracking-widest font-bold">{img.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Photo mosaic — right panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block lg:col-span-5 relative"
          >
            <div className="grid grid-cols-2 grid-rows-2 gap-2 h-[420px]">
              {/* Tall left photo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="row-span-2 relative overflow-hidden group"
              >
                <img
                  src="/squadron/flying/flying-cadet-in-cockpit-2.jpg"
                  alt="Cadet in cockpit"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-raf-navy/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] uppercase tracking-widest text-raf-sky">Flying</span>
                </div>
              </motion.div>
              {/* Top-right */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.45 }}
                className="relative overflow-hidden group"
              >
                <img
                  src="/squadron/fieldcraft/20260721_083302 (1).jpg"
                  alt="Fieldcraft training"
                  className="w-full h-full object-cover object-[50%_35%] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-raf-navy/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] uppercase tracking-widest text-raf-sky">Fieldcraft</span>
                </div>
              </motion.div>
              {/* Bottom-right */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.55 }}
                className="relative overflow-hidden group"
              >
                <img
                  src="/squadron/overseas/overseas-1-group-photo.jpg"
                  alt="Overseas camp"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-raf-navy/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] uppercase tracking-widest text-raf-sky">Overseas</span>
                </div>
              </motion.div>
            </div>
            {/* Floating crest badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="absolute -bottom-4 -left-4 bg-raf-navy border border-white/20 p-3 flex items-center gap-3 shadow-2xl"
            >
              <img src={CREST_URL} alt="Crest" className="w-10 h-10 object-contain" />
              <div>
                <div className="text-white font-display font-black text-sm leading-tight">1471 Horwich</div>
                <div className="text-raf-sky text-[10px] uppercase tracking-widest">RAF Air Cadets</div>
              </div>
            </motion.div>
            {/* Red accent bar */}
            <div className="absolute top-0 right-0 w-[3px] h-full bg-raf-red" />
          </motion.div>
        </div>

        {/* Highlight cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
        >
          {HIGHLIGHTS.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              data-testid={`hero-highlight-${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="relative bg-white/10 backdrop-blur-md border border-white/15 p-4 md:p-5 overflow-hidden group hover:bg-white/15 transition-colors"
            >
              <div className="absolute left-0 top-0 w-[3px] h-full bg-raf-red opacity-0 group-hover:opacity-100 transition-opacity" />
              <Icon className="text-raf-sky mb-2" size={20} />
              <div className="text-white font-display font-black text-xl sm:text-2xl md:text-3xl leading-none mt-0.5">
                {value}
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/55 mt-1.5">
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
