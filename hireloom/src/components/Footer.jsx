import React, { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ── Aesthetic: "Gilded Broadsheet" — dark editorial newspaper meets luxury brand ──
// Ink black base, aged gold accents, serif display titles, tight editorial grid

const C = {
  ink:     "#080705",
  inkSoft: "#111008",
  gold:    "#C9A84C",
  goldL:   "#E8D5A0",
  goldD:   "#9A7A2E",
  paper:   "#FAFAF7",
  muted:   "#6B6560",
  border:  "#232018",
  rule:    "#2A2418",
  smoke:   "#1A1710",
};

const ease = [0.22, 1, 0.36, 1];

const stagger = (delay = 0.06) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, delayChildren: 0.1 } },
});

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease, delay } },
});

const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.4, ease } },
};

// ── Animated counter ──────────────────────────────────────────
const Counter = ({ to, suffix = "" }) => {
  const ref  = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  React.useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 40);
    const interval = setInterval(() => {
      start = Math.min(start + step, to);
      setCount(start);
      if (start >= to) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [inView, to]);

  return (
    <span ref={ref} className="font-black tabular-nums" style={{ color: C.gold }}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

// ── Column link ────────────────────────────────────────────────
const FooterLink = ({ href = "/", children, delay = 0 }) => (
  <motion.li variants={fadeUp(delay)}>
    <a
      href={href}
      className="group flex items-center gap-2.5 text-sm transition-all duration-200"
      style={{ color: C.muted }}
      onMouseEnter={(e) => { e.currentTarget.style.color = C.goldL; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = C.muted; }}
    >
      <motion.span
        className="w-3 h-px shrink-0 transition-all duration-300"
        style={{ background: C.muted }}
        whileHover={{ scaleX: 2, background: C.gold }}
      />
      {children}
    </a>
  </motion.li>
);

// ── Social button ──────────────────────────────────────────────
const SocialBtn = ({ href, label, children }) => (
  <motion.a
    href={href}
    title={label}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.12, y: -2 }}
    whileTap={{ scale: 0.93 }}
    className="flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200 group"
    style={{ background: C.smoke, border: `1px solid ${C.rule}` }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = C.gold;
      e.currentTarget.style.background = `${C.gold}18`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = C.rule;
      e.currentTarget.style.background = C.smoke;
    }}
  >
    <span style={{ color: C.muted }} className="group-hover:text-yellow-400 transition-colors duration-200">
      {children}
    </span>
  </motion.a>
);

// ── Divider rule with ornament ─────────────────────────────────
const OrnamentRule = ({ animate = false }) => (
  <div className="flex items-center gap-4 w-full">
    <div className="flex-1 h-px" style={{ background: C.rule }} />
    <motion.div
      animate={animate ? { rotate: [0, 180, 360] } : {}}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      className="text-xs" style={{ color: C.goldD }}
    >
      ✦
    </motion.div>
    <div className="flex-1 h-px" style={{ background: C.rule }} />
  </div>
);

// ── Main Footer ────────────────────────────────────────────────
const Footer = () => {
  const [email,     setEmail]     = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused,   setFocused]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
    setTimeout(() => setSubmitted(false), 4000);
  };

  const footerRef = useRef(null);
  const inView    = useInView(footerRef, { once: true, margin: "-80px" });

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden"
      style={{ background: C.ink, fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* ── Atmospheric layers ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Dot-grid */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle, ${C.gold} 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }} />
        {/* Diagonal stripes */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, ${C.gold} 0, ${C.gold} 1px, transparent 1px, transparent 20px)`,
          }} />
        {/* Gold glows */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.1, 0.06] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl"
          style={{ background: C.gold }}
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl"
          style={{ background: C.goldD }}
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -15, 0], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-2xl"
          style={{ background: C.gold }}
        />
      </div>

      {/* ══════════ NEWSLETTER BANNER ══════════ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-0">
        <motion.div
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={fadeUp(0)}
          className="relative overflow-hidden rounded-3xl mb-16"
          style={{
            background: C.smoke,
            border: `1px solid ${C.rule}`,
          }}
        >
          {/* Banner inner glow */}
          <div className="absolute inset-0 opacity-50"
            style={{
              background: `radial-gradient(ellipse at 20% 50%, ${C.gold}0C 0%, transparent 60%)`,
            }} />
          {/* Gold rule top */}
          <div className="h-0.5 w-full"
            style={{ background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />

          <div className="relative px-8 py-12 md:px-14 md:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Left copy */}
              <motion.div initial="hidden" animate={inView ? "show" : "hidden"} variants={stagger(0.1)}>
                <motion.p variants={fadeUp(0)}
                  className="text-[10px] font-black uppercase tracking-[0.25em] mb-4"
                  style={{ color: C.goldD }}>
                  ✦ Newsletter
                </motion.p>
                <motion.h2 variants={fadeUp(0.05)}
                  className="font-black leading-none mb-4"
                  style={{
                    fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                    color: "#fff",
                    letterSpacing: "-0.04em",
                    lineHeight: 1.05,
                  }}>
                  Join the{" "}
                  <span style={{
                    backgroundImage: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>
                    Hireloom
                  </span>{" "}
                  Community
                </motion.h2>
                <motion.p variants={fadeUp(0.1)}
                  className="text-sm leading-relaxed max-w-md"
                  style={{ color: C.muted }}>
                  Stay ahead with the latest opportunities, career insights, and exclusive resources delivered straight to your inbox.
                </motion.p>

                {/* Stats row */}
                <motion.div variants={fadeUp(0.15)}
                  className="flex gap-8 mt-8">
                  {[
                    { val: 54000, suffix: "+", label: "Members"    },
                    { val: 12000, suffix: "+", label: "Companies"  },
                    { val: 98,    suffix: "k+",label: "Jobs listed" },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-xl font-black leading-none" style={{ color: C.gold }}>
                        <Counter to={s.val} suffix={s.suffix} />
                      </p>
                      <p className="text-[11px] font-semibold mt-1" style={{ color: C.muted }}>{s.label}</p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right form */}
              <motion.div variants={fadeUp(0.2)} initial="hidden" animate={inView ? "show" : "hidden"}>
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ scale: 0.88, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.88, opacity: 0 }}
                      className="flex flex-col items-center justify-center py-8 text-center gap-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 280, damping: 18 }}
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                        style={{ background: `${C.gold}18`, border: `1px solid ${C.gold}40` }}
                      >
                        ✦
                      </motion.div>
                      <p className="font-black text-lg" style={{ color: "#fff", letterSpacing: "-0.02em" }}>
                        You're in!
                      </p>
                      <p className="text-sm" style={{ color: C.muted }}>
                        Welcome to the Hireloom community. Check your inbox.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-3"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                      {/* Email input */}
                      <div
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
                        style={{
                          background: "#0D0C09",
                          border: `1.5px solid ${focused ? C.gold : C.rule}`,
                          boxShadow: focused ? `0 0 0 3px ${C.gold}18` : "none",
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 20 20" fill="none"
                          style={{ color: focused ? C.gold : C.muted, flexShrink: 0 }}>
                          <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h13A1.5 1.5 0 0 1 18 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 14.5v-9z"
                            stroke="currentColor" strokeWidth="1.4" />
                          <path d="M2 6l8 5 8-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setFocused(true)}
                          onBlur={() => setFocused(false)}
                          placeholder="your@email.com"
                          required
                          style={{
                            flex: 1,
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            fontSize: "14px",
                            color: "#fff",
                            fontFamily: "inherit",
                          }}
                        />
                      </div>

                      {/* Subscribe button */}
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full py-3.5 rounded-2xl text-sm font-black transition-all duration-200"
                        style={{
                          background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
                          color: C.ink,
                          boxShadow: `0 8px 32px ${C.gold}30`,
                          letterSpacing: "0.02em",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = `linear-gradient(135deg, ${C.goldL}, ${C.gold})`}
                        onMouseLeave={(e) => e.currentTarget.style.background = `linear-gradient(135deg, ${C.gold}, ${C.goldD})`}
                      >
                        Subscribe Now ✦
                      </motion.button>

                      <p className="text-[11px] text-center" style={{ color: C.muted }}>
                        No spam, ever. Unsubscribe in one click.
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          {/* Gold rule bottom */}
          <div className="h-0.5 w-full"
            style={{ background: `linear-gradient(90deg, transparent, ${C.goldD}, transparent)` }} />
        </motion.div>

        {/* ══════════ LINK COLUMNS ══════════ */}
        <OrnamentRule animate />

        <motion.div
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={stagger(0.08)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-16"
        >

          {/* Col 1 — Brand */}
          <motion.div variants={fadeUp(0)}>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
                style={{
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
                  color: C.ink,
                }}
              >
                H
              </div>
              <span className="font-black text-lg tracking-tight"
                style={{
                  color: "#fff",
                  letterSpacing: "-0.03em",
                }}>
                Hireloo<span style={{ color: C.gold }}>m</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: C.muted }}>
              The future of professional networking and career development. Built for people who mean business.
            </p>
            <ul className="space-y-3" style={{ listStyle: "none", padding: 0 }}>
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/">Dashboard</FooterLink>
              <FooterLink href="/">Jobs</FooterLink>
              <FooterLink href="/">Features</FooterLink>
            </ul>
          </motion.div>

          {/* Col 2 — Job Seekers */}
          <motion.div variants={fadeUp(0.06)}>
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: C.goldD }}>
                ✦ For you
              </p>
              <h3 className="text-base font-black" style={{ color: "#fff", letterSpacing: "-0.02em" }}>
                Job Seekers
              </h3>
            </div>
            <ul className="space-y-3.5" style={{ listStyle: "none", padding: 0 }}>
              <FooterLink href="/">Resume Builder</FooterLink>
              <FooterLink href="/">Job Listings</FooterLink>
              <FooterLink href="/">Career Guidance</FooterLink>
              <FooterLink href="/">Skill Development</FooterLink>
              <FooterLink href="/">Interview Prep</FooterLink>
            </ul>
          </motion.div>

          {/* Col 3 — Resources */}
          <motion.div variants={fadeUp(0.12)}>
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: C.goldD }}>
                ✦ Learn
              </p>
              <h3 className="text-base font-black" style={{ color: "#fff", letterSpacing: "-0.02em" }}>
                Resources
              </h3>
            </div>
            <ul className="space-y-3.5" style={{ listStyle: "none", padding: 0 }}>
              <FooterLink href="/">FAQs</FooterLink>
              <FooterLink href="/">Quick Start</FooterLink>
              <FooterLink href="/">Documentation</FooterLink>
              <FooterLink href="/">User Guide</FooterLink>
              <FooterLink href="/">Blog</FooterLink>
            </ul>
          </motion.div>

          {/* Col 4 — Support */}
          <motion.div variants={fadeUp(0.18)}>
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: C.goldD }}>
                ✦ Help
              </p>
              <h3 className="text-base font-black" style={{ color: "#fff", letterSpacing: "-0.02em" }}>
                Support
              </h3>
            </div>
            <ul className="space-y-3.5" style={{ listStyle: "none", padding: 0 }}>
              <FooterLink href="/">Customer Support</FooterLink>
              <FooterLink href="/">Cookies Policy</FooterLink>
              <FooterLink href="/">License Info</FooterLink>
              <FooterLink href="/">Terms & Conditions</FooterLink>
              <FooterLink href="/">Privacy Policy</FooterLink>
            </ul>
          </motion.div>
        </motion.div>

        <OrnamentRule />

        {/* ══════════ SOCIAL + BOTTOM ══════════ */}
        <motion.div
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={stagger(0.06)}
          className="py-10 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Brand mark */}
          <motion.div variants={fadeUp(0)} className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
              style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`, color: C.ink }}>
              H
            </div>
            <span className="font-black text-base" style={{ color: "#fff", letterSpacing: "-0.03em" }}>
              Hireloo<span style={{ color: C.gold }}>m</span>
            </span>
          </motion.div>

          {/* Social icons */}
          <motion.div variants={fadeUp(0.06)} className="flex items-center gap-3">
            {/* X / Twitter */}
            <SocialBtn href="https://x.com/mzher_x" label="Twitter / X">
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
              </svg>
            </SocialBtn>

            {/* LinkedIn */}
            <SocialBtn href="https://www.linkedin.com/in/mzhrx/" label="LinkedIn">
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/>
              </svg>
            </SocialBtn>

            {/* GitHub */}
            <SocialBtn href="https://github.com/mzherx" label="GitHub">
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
              </svg>
            </SocialBtn>

            {/* Instagram */}
            <SocialBtn href="https://instagram.com/mzherx" label="Instagram">
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"/>
              </svg>
            </SocialBtn>
          </motion.div>

          {/* Legal links */}
          <motion.div variants={fadeUp(0.12)} className="flex items-center gap-5">
            {["Privacy", "Terms", "Sitemap"].map((l) => (
              <a key={l} href="/"
                className="text-xs font-semibold transition-colors duration-200"
                style={{ color: C.muted }}
                onMouseEnter={(e) => e.currentTarget.style.color = C.goldL}
                onMouseLeave={(e) => e.currentTarget.style.color = C.muted}
              >
                {l}
              </a>
            ))}
          </motion.div>
        </motion.div>

        {/* Copyright */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center text-xs pb-8"
          style={{ color: C.border }}
        >
          © {new Date().getFullYear()} Hireloom. All rights reserved. Built with care ✦
        </motion.p>
      </div>

      {/* ── Animated gold bottom rule ── */}
      <div className="relative h-0.5 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{
            background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.goldL}, ${C.gold}, transparent)`,
            backgroundSize: "200% 100%",
          }}
        />
      </div>
    </footer>
  );
};

export default Footer;