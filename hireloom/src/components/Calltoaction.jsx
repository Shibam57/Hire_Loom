import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { FiSearch, FiStar, FiArrowRight } from "react-icons/fi";

// ── Design tokens ──────────────────────────────────────────────
const C = {
  ink:    "#080705",
  gold:   "#C9A84C",
  goldL:  "#E8D5A0",
  goldD:  "#9A7A2E",
  muted:  "#6B6560",
  border: "#232018",
  smoke:  "#111008",
};

const ease = [0.22, 1, 0.36, 1];

// ── Floating particle ──────────────────────────────────────────
const Particle = ({ style }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={style}
    animate={{
      y:       [0, -60, 0],
      x:       [0, Math.random() * 30 - 15, 0],
      opacity: [0, 0.6, 0],
      scale:   [0.5, 1, 0.5],
    }}
    transition={{
      duration:  4 + Math.random() * 4,
      repeat:    Infinity,
      delay:     Math.random() * 6,
      ease:      "easeInOut",
    }}
  />
);

// ── Animated counter ──────────────────────────────────────────
const Counter = ({ to, prefix = "", suffix = "" }) => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val,   setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let cur  = 0;
    const step = Math.ceil(to / 50);
    const id   = setInterval(() => {
      cur = Math.min(cur + step, to);
      setVal(cur);
      if (cur >= to) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {prefix}{val.toLocaleString()}{suffix}
    </span>
  );
};

// ── Stat pill ──────────────────────────────────────────────────
const Stat = ({ icon, value, label, i }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 + i * 0.1, duration: 0.5, ease }}
    viewport={{ once: true }}
    className="flex items-center gap-3 px-5 py-3 rounded-2xl"
    style={{
      background: "rgba(255,255,255,0.04)",
      border:     `1px solid rgba(201,168,76,0.2)`,
      backdropFilter: "blur(8px)",
    }}
  >
    <span className="text-xl">{icon}</span>
    <div>
      <p className="font-black text-base leading-none" style={{ color: C.gold }}>
        <Counter to={value.num} suffix={value.suffix} />
      </p>
      <p className="text-[11px] font-semibold mt-0.5" style={{ color: C.muted }}>{label}</p>
    </div>
  </motion.div>
);

// ── Main ───────────────────────────────────────────────────────
const CallToAction = () => {
  const [hoverSearch,  setHoverSearch]  = useState(false);
  const [hoverExplore, setHoverExplore] = useState(false);
  const sectionRef = useRef(null);
  const inView     = useInView(sectionRef, { once: true, margin: "-80px" });

  // Generate particles once
  const particles = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      style: {
        width:  `${2 + Math.random() * 4}px`,
        height: `${2 + Math.random() * 4}px`,
        left:   `${Math.random() * 100}%`,
        bottom: `${Math.random() * 30}%`,
        background: i % 3 === 0 ? C.gold : i % 3 === 1 ? C.goldL : C.goldD,
      },
    }))
  ).current;

  const stats = [
    { icon: "💼", value: { num: 98000,  suffix: "+"  }, label: "Jobs listed"   },
    { icon: "🏢", value: { num: 12000,  suffix: "+"  }, label: "Companies"     },
    { icon: "👤", value: { num: 1000000, suffix: "+" }, label: "Professionals" },
    { icon: "⚡", value: { num: 9,       suffix: "d"  }, label: "Avg. hire"    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative px-4 py-20 sm:px-6 lg:px-8 overflow-hidden"
      style={{ background: C.ink, fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* ── Atmospheric layers ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle, ${C.gold} 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }} />
        {/* Diagonal stripes */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, ${C.gold} 0, ${C.gold} 1px, transparent 1px, transparent 18px)`,
          }} />

        {/* Glow blobs */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: C.gold }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] translate-x-1/2 translate-y-1/2 rounded-full blur-3xl"
          style={{ background: C.goldD }}
        />

        {/* Floating particles */}
        {particles.map((p) => <Particle key={p.id} style={p.style} />)}
      </div>

      {/* ── Top ornament rule ── */}
      <div className="relative z-10 max-w-5xl mx-auto mb-16">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.border})` }} />
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="text-sm" style={{ color: C.goldD }}
          >
            ✦
          </motion.span>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${C.border}, transparent)` }} />
        </div>
      </div>

      {/* ── Main card ── */}
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease }}
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border:     `1px solid rgba(201,168,76,0.18)`,
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Top gold rule */}
          <motion.div
            className="h-0.5 w-full"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{
              background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.goldL}, ${C.gold}, transparent)`,
              backgroundSize: "200% 100%",
            }}
          />

          {/* Inner radial glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${C.gold}0F 0%, transparent 60%)`,
            }} />

          <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.1, duration: 0.4, ease }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{
                background: `${C.gold}14`,
                border:     `1px solid ${C.gold}30`,
              }}
            >
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ color: C.gold, fontSize: "10px" }}
              >
                ✦
              </motion.span>
              <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: C.gold }}>
                Career Platform
              </span>
              <motion.span
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ color: C.gold, fontSize: "10px" }}
              >
                ✦
              </motion.span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6, ease }}
              className="font-black leading-none mb-5"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", letterSpacing: "-0.04em" }}
            >
              <span className="block text-white">Let's Get</span>
              <span
                className="block"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${C.goldL} 0%, ${C.gold} 50%, ${C.goldD} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Connected
              </span>
              <span className="block text-white" style={{ fontSize: "0.65em", opacity: 0.7, marginTop: "0.1em" }}>
                Find Your Dream Job
              </span>
            </motion.h2>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.32, duration: 0.5, ease }}
              className="max-w-xl mx-auto text-base leading-relaxed mb-12"
              style={{ color: C.muted }}
            >
              Your Career, Your Future — Simplified with{" "}
              <span style={{ color: C.goldL, fontWeight: 700 }}>Smart Matching Technology</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.44, duration: 0.5, ease }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
            >
              {/* Primary — Search Jobs */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onMouseEnter={() => setHoverSearch(true)}
                onMouseLeave={() => setHoverSearch(false)}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-black overflow-hidden transition-all duration-300"
                style={{
                  background:  `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
                  color:       C.ink,
                  boxShadow:   `0 12px 40px ${C.gold}35`,
                  minWidth:    "200px",
                  letterSpacing: "0.02em",
                }}
              >
                {/* Shimmer */}
                <AnimatePresence>
                  {hoverSearch && (
                    <motion.div
                      initial={{ x: "-100%", skewX: "-15deg" }}
                      animate={{ x: "200%" }}
                      exit={{}}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute inset-0 w-1/2"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
                    />
                  )}
                </AnimatePresence>
                <FiSearch size={16} />
                Search Jobs
                <motion.span animate={{ x: hoverSearch ? 4 : 0 }} transition={{ duration: 0.2 }}>
                  <FiArrowRight size={14} />
                </motion.span>
              </motion.button>

              {/* Secondary — Explore Features */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onMouseEnter={() => setHoverExplore(true)}
                onMouseLeave={() => setHoverExplore(false)}
                onClick={() => window.location.href = "/"}
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-black transition-all duration-300"
                style={{
                  background:  hoverExplore ? "rgba(255,255,255,0.08)" : "transparent",
                  color:       "#fff",
                  border:      `1.5px solid rgba(255,255,255,0.2)`,
                  minWidth:    "200px",
                  letterSpacing: "0.02em",
                }}
              >
                <FiStar size={16} style={{ color: C.gold }} />
                Explore Features
              </motion.button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.56, duration: 0.5, ease }}
              className="flex flex-wrap justify-center gap-3 mb-10"
            >
              {stats.map((s, i) => (
                <Stat key={s.label} {...s} i={i} />
              ))}
            </motion.div>

            {/* Trust line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="flex items-center justify-center gap-3"
            >
              <div className="flex -space-x-2">
                {["#C9A84C","#E8D5A0","#9A7A2E","#A8856B","#DDB96E"].map((bg, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-black"
                    style={{ borderColor: C.ink, background: bg, color: C.ink, zIndex: 5 - i }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm font-semibold" style={{ color: C.muted }}>
                Trusted by{" "}
                <span style={{ color: C.goldL, fontWeight: 700 }}>1M+ professionals</span>
                {" "}worldwide
              </p>
            </motion.div>
          </div>

          {/* Bottom gold rule */}
          <motion.div
            className="h-0.5 w-full"
            animate={{ backgroundPosition: ["100% 50%", "0% 50%", "100% 50%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{
              background: `linear-gradient(90deg, transparent, ${C.goldD}, ${C.gold}, ${C.goldD}, transparent)`,
              backgroundSize: "200% 100%",
            }}
          />
        </motion.div>
      </div>

      {/* ── Bottom ornament ── */}
      <div className="relative z-10 max-w-5xl mx-auto mt-16">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.border})` }} />
          <span className="text-xs" style={{ color: C.border }}>✦ ✦ ✦</span>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${C.border}, transparent)` }} />
        </div>
      </div>
    </section>
  );
};

export default CallToAction;