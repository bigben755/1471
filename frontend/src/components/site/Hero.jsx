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
          alt="Glider soaring under open sky"
          className="w-full h-full object-cover object-center"
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
              Join a local squadron where young people develop skills, make
              friends, take on challenges and discover opportunities linked to
              aviation, adventure training, leadership, sport, first aid, DofE
              and community service &mdash; and much more.
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
                className="px-7 py-3.5 bg-raf-red text-white font-semibold hover:bg-[#A00926] transition-colors"
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
          </div>

          {/* Crest panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:flex lg:col-span-5 justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 -m-6 border border-white/15 rounded-full" />
              <img
                src={CREST_URL}
                alt="1471 Horwich Squadron crest"
                className="w-72 h-72 object-contain drop-shadow-2xl"
              />
            </div>
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
              className="bg-white/10 backdrop-blur-md border border-white/15 p-4 md:p-5"
            >
              <Icon className="text-raf-sky mb-3" size={22} />
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                {label}
              </div>
              <div className="text-white font-display font-bold text-base md:text-lg mt-1">
                {value}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
