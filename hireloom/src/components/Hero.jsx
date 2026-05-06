import React, { useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { filterJobs } from "../redux/jobSlice";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FiSearch, FiMapPin, FiArrowRight, FiBriefcase, FiUsers, FiTrendingUp } from "react-icons/fi";

// ── Design tokens ──────────────────────────────────────────────
const C = {
  ink:   "#080705",
  gold:  "#C9A84C",
  goldL: "#E8D5A0",
  goldD: "#9A7A2E",
  muted: "#6B6560",
  rule:  "#2A2418",
  smoke: "#111008",
};

const ease = [0.22, 1, 0.36, 1];

// ── Animated counter ──────────────────────────────────────────
const Counter = ({ target, suffix = "" }) => {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const id = setInterval(() => {
      cur = Math.min(cur + step, target);
      setVal(cur);
      if (cur >= target) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, [inView, target]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
};

// ── Floating particle ──────────────────────────────────────────
const Particle = ({ x, size, delay, color }) => (
  <motion.div
    className="absolute bottom-0 rounded-full pointer-events-none"
    style={{ left: `${x}%`, width: size, height: size, background: color }}
    animate={{ y: [0, -120, -200], opacity: [0, 0.7, 0], scale: [0.5, 1, 0.3] }}
    transition={{ duration: 5 + Math.random() * 3, repeat: Infinity, delay, ease: "easeOut" }}
  />
);

// ── Typing animation words ─────────────────────────────────────
const WORDS = ["Dream Job", "Next Chapter", "Perfect Role", "Career Path"];

const TypingWord = () => {
  const [idx,  setIdx]  = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % WORDS.length);
        setShow(true);
      }, 400);
    }, 2800);
    return () => clearInterval(cycle);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.span
          key={WORDS[idx]}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0,  opacity: 1, transition: { duration: 0.45, ease } }}
          exit={{   y: -30, opacity: 0, transition: { duration: 0.3,  ease } }}
          className="inline-block"
          style={{
            backgroundImage: `linear-gradient(135deg, ${C.goldL} 0%, ${C.gold} 50%, ${C.goldD} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {WORDS[idx]}
        </motion.span>
      )}
    </AnimatePresence>
  );
};

// ── Popular tag chip ───────────────────────────────────────────
const TagChip = ({ label, active, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.07, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="relative px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200"
    style={{
      background: active ? `linear-gradient(135deg, ${C.gold}, ${C.goldD})` : "rgba(255,255,255,0.07)",
      color:      active ? C.ink  : "rgba(255,255,255,0.6)",
      border:     `1px solid ${active ? "transparent" : "rgba(255,255,255,0.12)"}`,
      boxShadow:  active ? `0 4px 16px ${C.gold}40` : "none",
    }}
  >
    {active && (
      <motion.div
        layoutId="tagActive"
        className="absolute inset-0 rounded-full"
        style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`, zIndex: -1 }}
      />
    )}
    {label}
  </motion.button>
);

// ── Stat card ──────────────────────────────────────────────────
const StatCard = ({ Icon, num, suffix, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease }}
    className="flex items-center gap-3"
  >
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: `${C.gold}18`, border: `1px solid ${C.gold}30` }}
    >
      <Icon size={15} style={{ color: C.gold }} />
    </div>
    <div>
      <p className="font-black text-base leading-none text-white">
        <Counter target={num} suffix={suffix} />
      </p>
      <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>{label}</p>
    </div>
  </motion.div>
);

// ── Main ───────────────────────────────────────────────────────
const Hero = () => {
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const titleRef     = useRef(null);
  const locationRef  = useRef(null);
  const [activeTag,  setActiveTag]    = useState(null);
  const [titleFocus, setTitleFocus]   = useState(false);
  const [locFocus,   setLocFocus]     = useState(false);

  const popularTags = ["Developer", "Designer", "Marketing", "Remote", "Manager"];

  const particles = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id:    i,
      x:     Math.random() * 100,
      size:  `${2 + Math.random() * 4}px`,
      delay: Math.random() * 5,
      color: [C.gold, C.goldL, C.goldD][i % 3],
    }))
  ).current;

  // ── All original logic unchanged ──
  const onSearch = (e) => {
    e.preventDefault();
    const filters = {
      title:    titleRef.current.value,
      location: locationRef.current.value,
    };
    dispatch(filterJobs(filters));
    navigate("/jobs");
  };

  const handleTagClick = (tag) => {
    setActiveTag(tag);
    titleRef.current.value = tag;
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:    C.ink,
        fontFamily:    "'DM Sans', system-ui, sans-serif",
        minHeight:     "100vh",
        display:       "flex",
        flexDirection: "column",
        justifyContent:"center",
      }}
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

        {/* Top-left blob */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: C.gold }}
        />
        {/* Bottom-right blob */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.09, 0.05] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: C.goldD }}
        />
        {/* Centre pulse */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-3xl"
          style={{ background: C.gold }}
        />

        {/* Particles */}
        {particles.map((p) => <Particle key={p.id} {...p} />)}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-24 text-center">

        {/* Ornament */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, ease }}
          className="flex items-center justify-center gap-4 mb-10"
        >
          <div className="w-16 h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.goldD})` }} />
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="text-xs" style={{ color: C.goldD }}
          >
            ✦
          </motion.span>
          <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: C.goldD }}>
            Career Platform
          </span>
          <motion.span
            animate={{ rotate: [0, -360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="text-xs" style={{ color: C.goldD }}
          >
            ✦
          </motion.span>
          <div className="w-16 h-px" style={{ background: `linear-gradient(90deg, ${C.goldD}, transparent)` }} />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease }}
          className="font-black leading-none mb-5"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)", letterSpacing: "-0.04em" }}
        >
          <span className="block text-white">Find Your</span>
          <span className="block" style={{ minHeight: "1.15em", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TypingWord />
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease }}
          className="text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ color: C.muted }}
        >
          Search thousands of jobs and build your future with{" "}
          <span style={{ color: C.goldL, fontWeight: 700 }}>smart matching technology</span>
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease }}
          className="flex flex-wrap items-center justify-center gap-6 mb-12"
        >
          <StatCard Icon={FiBriefcase}  num={50000} suffix="+"  label="Active Jobs"    delay={0.45} />
          <div className="w-px h-8 hidden sm:block" style={{ background: C.rule }} />
          <StatCard Icon={FiUsers}      num={1000000} suffix="+"  label="Job Seekers"    delay={0.52} />
          <div className="w-px h-8 hidden sm:block" style={{ background: C.rule }} />
          <StatCard Icon={FiTrendingUp} num={95}    suffix="%"  label="Success Rate"   delay={0.59} />
        </motion.div>

        {/* ── Search bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease }}
          className="max-w-3xl mx-auto mb-8"
        >
          <form
            onSubmit={onSearch}
            className="flex flex-col sm:flex-row rounded-2xl overflow-hidden"
            style={{
              background:    "rgba(255,255,255,0.04)",
              border:        `1.5px solid ${(titleFocus || locFocus) ? C.gold : "rgba(255,255,255,0.1)"}`,
              backdropFilter: "blur(20px)",
              boxShadow:     (titleFocus || locFocus) ? `0 0 0 3px ${C.gold}22` : `0 24px 60px rgba(0,0,0,0.4)`,
              transition:    "all 0.25s",
            }}
          >
            {/* Title field */}
            <div
              className="flex items-center gap-3 flex-1 px-5 py-4 border-b sm:border-b-0 sm:border-r"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <FiSearch size={16} style={{ color: titleFocus ? C.gold : C.muted, flexShrink: 0, transition: "color 0.2s" }} />
              <input
                ref={titleRef}
                type="text"
                placeholder="Job title or skill…"
                onFocus={() => setTitleFocus(true)}
                onBlur={() => setTitleFocus(false)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "14px",
                  color: "#fff",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Location field */}
            <div
              className="flex items-center gap-3 flex-1 px-5 py-4 border-b sm:border-b-0 sm:border-r"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <FiMapPin size={16} style={{ color: locFocus ? C.gold : C.muted, flexShrink: 0, transition: "color 0.2s" }} />
              <input
                ref={locationRef}
                type="text"
                placeholder="City, state or remote…"
                onFocus={() => setLocFocus(true)}
                onBlur={() => setLocFocus(false)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "14px",
                  color: "#fff",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Search button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2.5 px-8 py-4 text-sm font-black transition-all duration-200 shrink-0"
              style={{
                background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
                color:      C.ink,
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = `linear-gradient(135deg, ${C.goldL}, ${C.gold})`}
              onMouseLeave={(e) => e.currentTarget.style.background = `linear-gradient(135deg, ${C.gold}, ${C.goldD})`}
            >
              Search
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <FiArrowRight size={15} />
              </motion.span>
            </motion.button>
          </form>
        </motion.div>

        {/* ── Popular tags ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5, ease }}
          className="flex flex-wrap justify-center items-center gap-2.5"
        >
          <span className="text-[11px] font-semibold mr-1" style={{ color: C.muted }}>
            Popular:
          </span>
          {popularTags.map((tag, i) => (
            <TagChip
              key={tag}
              label={tag}
              active={activeTag === tag}
              onClick={() => handleTagClick(tag)}
            />
          ))}
        </motion.div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          className="flex items-center justify-center gap-3 mt-10"
        >
          <div className="flex -space-x-2">
            {[C.gold, C.goldL, C.goldD, "#A8856B", "#DDB96E"].map((bg, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-black"
                style={{ borderColor: C.ink, background: bg, color: C.ink, zIndex: 5 - i }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <p className="text-sm" style={{ color: C.muted }}>
            Join{" "}
            <span style={{ color: C.goldL, fontWeight: 700 }}>1M+ professionals</span>
            {" "}who found their role here
          </p>
        </motion.div>
      </div>

      {/* ── Bottom fade to site background ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, transparent, ${C.ink})`,
        }}
      />

      {/* ── Animated gold bottom rule ── */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5">
        <motion.div
          className="h-full w-full"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{
            background:     `linear-gradient(90deg, transparent, ${C.gold}, ${C.goldL}, ${C.gold}, transparent)`,
            backgroundSize: "200% 100%",
          }}
        />
      </div>
    </section>
  );
};

export default Hero;