import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentEmployee, updateEmployeeProfile } from "../redux/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// ── Design tokens ──────────────────────────────────────────────
const C = {
  ink:    "#0D0D0D",
  paper:  "#FAFAF8",
  cream:  "#F5F0E8",
  gold:   "#C9A84C",
  goldL:  "#E8D5A0",
  goldD:  "#9A7A2E",
  muted:  "#8A8680",
  border: "#E4DDD4",
  card:   "#FFFFFF",
  sage:   "#4D7C5F",
  red:    "#D94F3D",
  blue:   "#0A66C2",
};

const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease } }),
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

// ── Section labels used for sidebar progress ──────────────────
const SECTIONS = [
  { id: "basic",     label: "Personal",   icon: "👤" },
  { id: "links",     label: "Links",      icon: "🔗" },
  { id: "education", label: "Education",  icon: "🎓" },
  { id: "resume",    label: "Resume",     icon: "📄" },
];

// ── Avatar initials ───────────────────────────────────────────
const Avatar = ({ name, size = 72 }) => {
  const initials = name?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  return (
    <div className="rounded-3xl flex items-center justify-center font-black shrink-0"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${C.gold}50, ${C.ink}18)`,
        border: `2px solid ${C.goldL}`,
        fontSize: size * 0.28,
        color: C.ink,
        letterSpacing: "-0.02em",
      }}>
      {initials}
    </div>
  );
};

// ── Luxury input ──────────────────────────────────────────────
const LuxField = ({ label, error, multiline, icon, hint, required, ...props }) => {
  const [focused, setFocused] = useState(false);
  const Tag = multiline ? "textarea" : "input";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em]"
          style={{ color: focused ? C.gold : C.muted }}>
          {icon && <span>{icon}</span>}
          {label}
          {required && <span style={{ color: C.gold }}>*</span>}
        </label>
        {hint && <span className="text-[10px]" style={{ color: C.muted }}>{hint}</span>}
      </div>
      <Tag
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={multiline ? "resize-none" : ""}
        style={{
          width: "100%",
          background: focused ? C.cream : C.paper,
          border: `1.5px solid ${error ? C.red : focused ? C.gold : C.border}`,
          borderRadius: "12px",
          padding: multiline ? "13px 16px" : "11px 16px",
          fontSize: "14px",
          color: C.ink,
          outline: "none",
          fontFamily: "inherit",
          transition: "all 0.2s",
          boxShadow: focused ? `0 0 0 3px ${C.gold}1A` : "none",
        }}
      />
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="text-[11px] font-semibold mt-1 ml-1" style={{ color: C.red }}>
          {error}
        </motion.p>
      )}
    </div>
  );
};

// ── Social link row ────────────────────────────────────────────
const SocialField = ({ icon, label, color, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex items-center gap-3 rounded-2xl border overflow-hidden transition-all duration-200"
      style={{
        borderColor:  focused ? color : C.border,
        background:   C.card,
        boxShadow:    focused ? `0 0 0 3px ${color}18` : "none",
      }}>
      <div className="w-12 h-12 flex items-center justify-center shrink-0 border-r text-lg"
        style={{ borderColor: C.border, background: `${color}0D` }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] mb-0.5" style={{ color: C.muted }}>{label}</p>
        <input
          {...props}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "13px",
            color: C.ink,
            fontFamily: "inherit",
            paddingBottom: "4px",
          }}
        />
      </div>
      {props.value && (
        <motion.a initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          href={props.value.startsWith("http") ? props.value : `https://${props.value}`}
          target="_blank" rel="noopener noreferrer"
          className="mr-3 text-xs font-black px-3 py-1.5 rounded-lg shrink-0 transition-colors"
          style={{ background: `${color}14`, color }}>
          Open →
        </motion.a>
      )}
    </div>
  );
};

// ── Resume drop zone ──────────────────────────────────────────
const ResumeZone = ({ file, onChange, onClear }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onChange(f);
  };

  return (
    <div>
      <motion.div
        animate={{ borderColor: dragging ? C.gold : file ? C.sage : C.border }}
        onClick={() => !file && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="relative rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden"
        style={{
          background: dragging ? `${C.gold}08` : file ? `${C.sage}06` : C.paper,
          cursor: file ? "default" : "pointer",
        }}
      >
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx"
          className="hidden" onChange={(e) => e.target.files[0] && onChange(e.target.files[0])} />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div key="has-file"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-5 px-6 py-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                style={{ background: `${C.sage}14` }}>📄</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate" style={{ color: C.ink }}>{file.name}</p>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                  {(file.size / 1024).toFixed(0)} KB · Ready to upload
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="h-1 rounded-full flex-1" style={{ background: C.border }}>
                    <motion.div className="h-full rounded-full" style={{ background: C.sage }}
                      initial={{ width: 0 }} animate={{ width: "100%" }}
                      transition={{ duration: 1, ease }} />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: C.sage }}>Ready</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => inputRef.current?.click()}
                  className="text-xs font-black px-3 py-1.5 rounded-lg"
                  style={{ background: `${C.gold}14`, color: C.gold }}>
                  Replace
                </button>
                <button type="button" onClick={onClear}
                  className="text-xs font-black px-3 py-1.5 rounded-lg"
                  style={{ background: `${C.red}10`, color: C.red }}>
                  Remove
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center px-6">
              <motion.div
                animate={dragging ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
                className="text-5xl mb-4">📎
              </motion.div>
              <p className="text-sm font-black mb-1" style={{ color: C.ink }}>
                {dragging ? "Drop it here!" : "Upload your resume"}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
                Drag & drop or click to browse · PDF, DOC, DOCX · Max 5 MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// ── Section card wrapper ───────────────────────────────────────
const SectionCard = ({ id, title, emoji, children, i }) => (
  <motion.div
    id={id}
    custom={i} variants={fadeUp} initial="hidden" animate="show"
    className="rounded-3xl overflow-hidden"
    style={{ background: C.card, border: `1px solid ${C.border}` }}
  >
    {/* Header */}
    <div className="flex items-center gap-3 px-7 py-5 border-b" style={{ borderColor: C.border }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
        style={{ background: `${C.gold}14` }}>
        {emoji}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: C.muted }}>Section</p>
        <p className="text-base font-black leading-tight" style={{ color: C.ink, letterSpacing: "-0.02em" }}>{title}</p>
      </div>
    </div>
    <div className="px-7 py-6">{children}</div>
  </motion.div>
);

// ── Skeleton ──────────────────────────────────────────────────
const SkeletonPage = () => (
  <div className="min-h-screen" style={{ background: C.paper }}>
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-5 animate-pulse">
      <div className="h-40 rounded-3xl" style={{ background: C.border }} />
      {[1,2,3,4].map(n => <div key={n} className="h-48 rounded-3xl" style={{ background: C.border }} />)}
    </div>
  </div>
);

// ── Progress dot ──────────────────────────────────────────────
const ProgressDot = ({ filled, label, icon }) => (
  <div className="flex items-center gap-2">
    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 transition-all duration-300"
      style={{
        background: filled ? C.gold : "transparent",
        border: `2px solid ${filled ? C.gold : C.border}`,
        color: filled ? C.ink : C.muted,
      }}>
      {filled ? "✓" : icon}
    </div>
    <span className="text-[11px] font-semibold hidden sm:block" style={{ color: filled ? C.ink : C.muted }}>
      {label}
    </span>
  </div>
);

// ── Main ──────────────────────────────────────────────────────
const EditProfile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((s) => s.auth);

  const [formData,    setFormData]    = useState({});
  const [resumeFile,  setResumeFile]  = useState(null);
  const [saved,       setSaved]       = useState(false);
  const [errors,      setErrors]      = useState({});
  const [charCount,   setCharCount]   = useState(0);

  // ── Fetch ─────────────────────────────────────────────────
  useEffect(() => { dispatch(getCurrentEmployee()); }, [dispatch]);

  // ── Pre-fill ──────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      setFormData({
        name:           user.name            || "",
        phone:          user.phone           || "",
        location:       user.location        || "",
        experience:     user.experience      || "",
        bio:            user.bio             || "",
        github:         user.github          || "",
        linkedin:       user.linkedin        || "",
        degree:         user.education?.degree         || "",
        branch:         user.education?.branch         || "",
        college:        user.education?.college        || "",
        graduationYear: user.education?.graduationYear || "",
      });
      setCharCount((user.bio || "").length);
    }
  }, [user]);

  // ── Handle change ─────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (name === "bio") setCharCount(value.length);
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  // ── Validate ──────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!formData.name?.trim()) e.name = "Name is required";
    if (formData.github && !/^https?:\/\/.+/.test(formData.github))
      e.github = "Enter a full URL starting with https://";
    if (formData.linkedin && !/linkedin\.com/.test(formData.linkedin))
      e.linkedin = "Enter a valid LinkedIn URL";
    if (formData.graduationYear && (Number(formData.graduationYear) < 1900 || Number(formData.graduationYear) > 2030))
      e.graduationYear = "Enter a valid graduation year";
    return e;
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const fd = new FormData();
    Object.keys(formData).forEach((k) => {
      if (formData[k] !== "" && formData[k] !== null) fd.append(k, formData[k]);
    });
    if (resumeFile) fd.append("resume", resumeFile);

    dispatch(updateEmployeeProfile(fd));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── Completion check ──────────────────────────────────────
  const completion = {
    basic:     !!(formData.name && formData.phone && formData.location),
    links:     !!(formData.github || formData.linkedin),
    education: !!(formData.degree && formData.college),
    resume:    !!resumeFile,
  };
  const completedCount = Object.values(completion).filter(Boolean).length;
  const completionPct  = Math.round((completedCount / 4) * 100);

  if (loading && !user) return <SkeletonPage />;

  return (
    <div className="min-h-screen" style={{ background: C.paper, fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-30 bg-white border-b px-6 lg:px-10 py-4 flex items-center justify-between"
        style={{ borderColor: C.border }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs"
            style={{ background: C.ink, color: "#fff" }}>T</div>
          <span className="font-bold tracking-tight" style={{ color: C.ink }}>TalentHub</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Progress bar */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-24 h-1.5 rounded-full" style={{ background: C.border }}>
              <motion.div className="h-full rounded-full" style={{ background: C.gold }}
                animate={{ width: `${completionPct}%` }} transition={{ duration: 0.5, ease }} />
            </div>
            <span className="text-xs font-bold" style={{ color: C.muted }}>{completionPct}%</span>
          </div>
          <Link to="/profile" className="text-sm font-semibold hover:underline" style={{ color: C.muted }}>
            ← Profile
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-10">

        {/* ── Hero banner ── */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show"
          className="relative overflow-hidden rounded-3xl mb-7 px-8 py-8"
          style={{ background: C.ink }}>
          {/* Blobs */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-10 blur-3xl" style={{ background: C.gold }} />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full opacity-5 blur-2xl"  style={{ background: C.gold }} />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: `radial-gradient(circle, ${C.gold} 1px, transparent 1px)`, backgroundSize: "26px 26px" }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-5">
              <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}>
                <Avatar name={formData.name || user?.name} size={72} />
              </motion.div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: `${C.gold}88` }}>
                  Editing profile
                </p>
                <h1 className="font-black leading-tight" style={{ fontSize: "clamp(1.3rem,2.5vw,1.8rem)", color: "#fff", letterSpacing: "-0.03em" }}>
                  {formData.name || user?.name || "Your Name"}
                </h1>
                <p className="text-xs mt-1" style={{ color: "#5A5450" }}>{user?.email}</p>
              </div>
            </div>

            {/* Completion pills */}
            <div className="flex flex-wrap gap-2">
              {SECTIONS.map((s) => (
                <ProgressDot key={s.id} filled={completion[s.id]} label={s.label} icon={s.icon} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5 text-sm font-semibold overflow-hidden"
              style={{ background: `${C.red}0D`, border: `1px solid ${C.red}30`, color: C.red }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke={C.red} strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 10.5v.5" stroke={C.red} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ═══ SECTION 1 — Personal ═══ */}
          <SectionCard id="basic" title="Personal information" emoji="👤" i={1}>
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <motion.div variants={fadeUp} className="sm:col-span-2">
                <LuxField label="Full name" name="name" type="text" required
                  placeholder="Alex Johnson"
                  value={formData.name || ""} onChange={handleChange} error={errors.name} />
              </motion.div>
              <motion.div variants={fadeUp}>
                <LuxField label="Phone" name="phone" type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone || ""} onChange={handleChange} />
              </motion.div>
              <motion.div variants={fadeUp}>
                <LuxField label="Location" name="location" type="text"
                  placeholder="Mumbai, India"
                  value={formData.location || ""} onChange={handleChange} />
              </motion.div>
              <motion.div variants={fadeUp}>
                <LuxField label="Experience" name="experience" type="number"
                  placeholder="3"
                  hint="Years"
                  value={formData.experience || ""} onChange={handleChange} />
              </motion.div>
              <motion.div variants={fadeUp} className="sm:col-span-2">
                <LuxField label="Bio / tagline" name="bio" multiline rows={4}
                  placeholder="Frontend developer passionate about clean code and great UX…"
                  hint={`${charCount}/300`}
                  maxLength={300}
                  value={formData.bio || ""} onChange={handleChange} />
              </motion.div>
            </motion.div>
          </SectionCard>

          {/* ═══ SECTION 2 — Links ═══ */}
          <SectionCard id="links" title="Links & social" emoji="🔗" i={2}>
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
              <motion.div variants={fadeUp}>
                <SocialField
                  icon={<svg width="18" height="18" fill={C.ink} viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/></svg>}
                  label="GitHub"
                  color="#333"
                  name="github"
                  placeholder="https://github.com/yourusername"
                  value={formData.github || ""}
                  onChange={handleChange}
                />
                {errors.github && <p className="text-[11px] text-red-500 font-semibold mt-1 ml-1">{errors.github}</p>}
              </motion.div>

              <motion.div variants={fadeUp}>
                <SocialField
                  icon={<svg width="18" height="18" fill={C.blue} viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>}
                  label="LinkedIn"
                  color={C.blue}
                  name="linkedin"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedin || ""}
                  onChange={handleChange}
                />
                {errors.linkedin && <p className="text-[11px] text-red-500 font-semibold mt-1 ml-1">{errors.linkedin}</p>}
              </motion.div>
            </motion.div>
          </SectionCard>

          {/* ═══ SECTION 3 — Education ═══ */}
          <SectionCard id="education" title="Education" emoji="🎓" i={3}>
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <motion.div variants={fadeUp}>
                <LuxField label="Degree" name="degree" type="text"
                  placeholder="B.Tech / B.Sc / MBA…"
                  value={formData.degree || ""} onChange={handleChange} />
              </motion.div>
              <motion.div variants={fadeUp}>
                <LuxField label="Branch / Major" name="branch" type="text"
                  placeholder="Computer Science"
                  value={formData.branch || ""} onChange={handleChange} />
              </motion.div>
              <motion.div variants={fadeUp} className="sm:col-span-2">
                <LuxField label="College / University" name="college" type="text"
                  placeholder="IIT Bombay, VIT…"
                  value={formData.college || ""} onChange={handleChange} />
              </motion.div>
              <motion.div variants={fadeUp}>
                <LuxField label="Graduation year" name="graduationYear" type="number"
                  placeholder="2024"
                  value={formData.graduationYear || ""} onChange={handleChange}
                  error={errors.graduationYear} />
              </motion.div>
            </motion.div>
          </SectionCard>

          {/* ═══ SECTION 4 — Resume ═══ */}
          <SectionCard id="resume" title="Resume / CV" emoji="📄" i={4}>
            <ResumeZone
              file={resumeFile}
              onChange={(f) => setResumeFile(f)}
              onClear={() => setResumeFile(null)}
            />
            {user?.resumeUrl && !resumeFile && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center justify-between mt-4 px-4 py-3 rounded-xl"
                style={{ background: `${C.sage}0D`, border: `1px solid ${C.sage}25` }}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">📋</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: C.ink }}>Existing resume on file</p>
                    <p className="text-xs" style={{ color: C.muted }}>Upload a new file to replace it</p>
                  </div>
                </div>
                <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-black px-4 py-2 rounded-lg"
                  style={{ background: `${C.sage}14`, color: C.sage }}>
                  Download →
                </a>
              </motion.div>
            )}
          </SectionCard>

          {/* ═══ Submit ═══ */}
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show"
            className="flex items-center justify-between gap-4 py-4">
            <Link to="/profile"
              className="text-sm font-semibold hover:underline"
              style={{ color: C.muted }}>
              ← Cancel
            </Link>

            <motion.button type="submit" disabled={saved}
              whileHover={{ scale: saved ? 1 : 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 text-sm font-black px-8 py-3.5 rounded-2xl transition-all duration-300"
              style={{
                background:  saved ? "#059669" : `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
                color:       saved ? "#fff"    : C.ink,
                boxShadow:   saved ? "0 4px 20px #05996940" : `0 8px 30px ${C.gold}40`,
                cursor:      saved ? "not-allowed" : "pointer",
              }}>
              {saved ? (
                <>
                  <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.5"/>
                    <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </motion.svg>
                  Profile updated!
                </>
              ) : (
                <>
                  Save all changes ✦
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;