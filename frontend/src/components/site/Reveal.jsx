import { motion } from "framer-motion";

export const Reveal = ({ children, delay = 0, className = "", y = 24 }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.55, delay, ease: [0.21, 0.6, 0.35, 1] }}
  >
    {children}
  </motion.div>
);

export const SectionHeading = ({ eyebrow, title, intro, light = false, center = false }) => (
  <div className={`${center ? "text-center mx-auto" : ""} max-w-3xl`}>
    {eyebrow && (
      <div
        className={`flex items-center gap-3 mb-4 ${center ? "justify-center" : ""}`}
      >
        <span className="h-[3px] w-8 bg-raf-red" />
        <span
          className={`text-xs font-semibold uppercase tracking-[0.22em] ${
            light ? "text-raf-sky" : "text-raf-red"
          }`}
        >
          {eyebrow}
        </span>
      </div>
    )}
    <h2
      className={`font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight ${
        light ? "text-white" : "text-raf-navy"
      }`}
    >
      {title}
    </h2>
    {intro && (
      <p
        className={`mt-5 text-base md:text-lg leading-relaxed ${
          light ? "text-raf-sky/90" : "text-raf-slate"
        }`}
      >
        {intro}
      </p>
    )}
  </div>
);
