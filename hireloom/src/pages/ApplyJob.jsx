import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { applyJob } from "../redux/jobSlice";
import { motion, AnimatePresence } from "framer-motion";

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
};

const ease = [0.22, 1, 0.36, 1];

// ── Word counter helper ────────────────────────────────────────
const WordCount = ({ text }) => {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const color = words < 50 ? C.red : words < 150 ? C.gold : C.sage;
  return (
    <div className="flex items-center gap-3 mt-2">
      <div className="flex-1 h-1 rounded-full" style={{ background: C.border }}>
        <motion.div className="h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min((words / 200) * 100, 100)}%`, background: color }} />
      </div>
      <span className="text-[11px] font-semibold shrink-0" style={{ color }}>
        {words} words · {chars} chars
      </span>
    </div>
  );
};

// ── Floating label textarea ────────────────────────────────────
const LuxTextarea = ({ label, value, onChange, placeholder, rows = 6, hint }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] font-black uppercase tracking-[0.18em]"
          style={{ color: focused ? C.gold : C.muted }}>{label}</label>
        {hint && <span className="text-[10px]" style={{ color: C.muted }}>{hint}</span>}
      </div>
      <textarea
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={rows}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: focused ? C.cream : C.paper,
          border: `1.5px solid ${focused ? C.gold : C.border}`,
          borderRadius: "16px",
          padding: "16px",
          fontSize: "14px",
          color: C.ink,
          outline: "none",
          fontFamily: "inherit",
          lineHeight: "1.7",
          resize: "none",
          transition: "all 0.2s",
          boxShadow: focused ? `0 0 0 3px ${C.gold}18` : "none",
        }}
      />
    </div>
  );
};

// ── Resume drop zone ───────────────────────────────────────────
const ResumeZone = ({ file, onChange }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onChange(f);
  };

  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-[0.18em] mb-2"
        style={{ color: C.muted }}>Resume / CV</label>

      <motion.div
        animate={{
          borderColor: dragging ? C.gold : file ? C.sage : C.border,
          background: dragging ? `${C.gold}08` : file ? `${C.sage}06` : C.paper,
        }}
        transition={{ duration: 0.2 }}
        onClick={() => !file && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="relative rounded-2xl border-2 border-dashed overflow-hidden transition-all"
        style={{ cursor: file ? "default" : "pointer" }}
      >
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx"
          className="hidden" onChange={(e) => e.target.files[0] && onChange(e.target.files[0])} />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div key="file"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-4 px-6 py-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: `${C.sage}14` }}>📄</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate" style={{ color: C.ink }}>{file.name}</p>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                  {(file.size / 1024).toFixed(0)} KB · Ready to submit
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="h-1 rounded-full flex-1" style={{ background: C.border }}>
                    <motion.div className="h-full rounded-full" style={{ background: C.sage }}
                      initial={{ width: 0 }} animate={{ width: "100%" }}
                      transition={{ duration: 0.9, ease }} />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: C.sage }}>Ready</span>
                </div>
              </div>
              <motion.button type="button" whileTap={{ scale: 0.93 }}
                onClick={(e) => { e.stopPropagation(); onChange(null); }}
                className="text-xs font-black px-3 py-1.5 rounded-lg shrink-0"
                style={{ background: `${C.red}10`, color: C.red }}>
                Remove
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 text-center px-6">
              <motion.div
                animate={dragging ? { scale: 1.25, rotate: 10 } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.2 }}
                className="text-4xl mb-3">📎
              </motion.div>
              <p className="text-sm font-black mb-1" style={{ color: C.ink }}>
                {dragging ? "Drop it here!" : "Attach your resume"}
              </p>
              <p className="text-xs" style={{ color: C.muted }}>
                Drag & drop · PDF, DOC, DOCX · Max 5 MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// ── Writing tips ───────────────────────────────────────────────
const TIPS = [
  "Start with why you're excited about this specific role",
  "Mention 1–2 concrete achievements with numbers",
  "Keep it concise — 150–250 words is ideal",
  "Close with a clear call to action",
];

// ── Main ───────────────────────────────────────────────────────
const ApplyJob = () => {
  const { id }   = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  console.log("PARAM ID:", id);

  const { loading, successMessage, error } = useSelector((s) => s.jobs);

  const [formData, setFormData] = useState({ coverLetter: "", resume: null });
  const [submitted, setSubmitted] = useState(false);
  const [showTips, setShowTips]   = useState(false);

  // ── Original handlers (unchanged) ─────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, coverLetter: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, resume: e.target.files?.[0] || null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("coverLetter", formData.coverLetter);
    if (formData.resume) data.append("resume", formData.resume);
    dispatch(applyJob({ jobId: id, formData: data }));
  };

  // Watch for success
  useEffect(() => {
    if (successMessage) setSubmitted(true);
  }, [successMessage]);

  // ── Success screen ─────────────────────────────────────────
  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: C.paper, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease }}
        className="text-center max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 18 }}
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6"
          style={{ background: `${C.sage}14`, border: `2px solid ${C.sage}30` }}>
          ✅
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="font-black text-2xl mb-2" style={{ color: C.ink, letterSpacing: "-0.03em" }}>
          Application sent!
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-sm mb-8 leading-relaxed" style={{ color: C.muted }}>
          {successMessage || "Your application has been submitted. The employer will review it and get back to you soon."}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="flex flex-col gap-3">
          <button onClick={() => navigate("/jobs")} className="py-3 rounded-2xl text-sm font-black transition-all"
            style={{ background: C.ink, color: "#fff" }}>
            Browse more jobs
          </button>
          <button onClick={() => navigate("/applications")} className="py-3 rounded-2xl text-sm font-bold transition-all"
            style={{ background: `${C.gold}14`, color: C.gold }}>
            View my applications
          </button>
        </motion.div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: C.paper, fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ background: C.ink }}>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: C.gold }} />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full blur-2xl opacity-5" style={{ background: C.gold }} />
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: `radial-gradient(circle, ${C.gold} 1px, transparent 1px)`, backgroundSize: "26px 26px" }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `repeating-linear-gradient(45deg, ${C.gold} 0, ${C.gold} 1px, transparent 1px, transparent 16px)` }} />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <motion.button initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="text-sm font-semibold mb-8 block transition-colors"
            style={{ color: "#5A5450" }}
            onMouseEnter={(e) => e.currentTarget.style.color = C.goldL}
            onMouseLeave={(e) => e.currentTarget.style.color = "#5A5450"}>
            ← Back
          </motion.button>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease }}>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-3" style={{ color: `${C.gold}88` }}>
              ✦ Job Application
            </p>
            <h1 className="font-black leading-tight mb-2"
              style={{ fontSize: "clamp(1.6rem,3.5vw,2.5rem)", color: "#fff", letterSpacing: "-0.04em" }}>
              Apply for this role 🚀
            </h1>
            <p className="text-sm" style={{ color: "#6B6460" }}>
              A great cover letter increases your chances by <span style={{ color: C.goldL, fontWeight: 700 }}>3×</span>
            </p>
          </motion.div>
        </div>

        <motion.div className="h-0.5 w-full"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{ background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.goldL}, ${C.gold}, transparent)`, backgroundSize: "200% 100%" }} />
      </div>

      {/* ── Form ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — form (2/3) */}
          <div className="lg:col-span-2 space-y-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4, ease }}
              className="rounded-3xl border overflow-hidden"
              style={{ background: C.card, borderColor: C.border }}>
              {/* Card header */}
              <div className="flex items-center justify-between px-7 py-5 border-b" style={{ borderColor: C.border }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: `${C.gold}14` }}>✍️</div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: C.muted }}>Step 1</p>
                    <p className="text-base font-black" style={{ color: C.ink, letterSpacing: "-0.02em" }}>Cover letter</p>
                  </div>
                </div>
                <motion.button type="button" whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTips((p) => !p)}
                  className="text-xs font-black px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    background: showTips ? `${C.gold}18` : "transparent",
                    color: showTips ? C.gold : C.muted,
                    border: `1px solid ${showTips ? C.gold : C.border}`,
                  }}>
                  💡 Tips
                </motion.button>
              </div>

              {/* Tips accordion */}
              <AnimatePresence>
                {showTips && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease }}
                    className="overflow-hidden">
                    <div className="px-7 py-4 border-b" style={{ borderColor: C.border, background: `${C.gold}06` }}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: C.goldD }}>
                        Writing tips
                      </p>
                      {TIPS.map((tip, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-start gap-2.5 mb-2 last:mb-0">
                          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5"
                            style={{ background: `${C.gold}20`, color: C.gold }}>{i + 1}</span>
                          <p className="text-xs leading-relaxed" style={{ color: C.muted }}>{tip}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Textarea */}
              <div className="px-7 py-6">
                <LuxTextarea
                  label="Cover letter"
                  value={formData.coverLetter}
                  onChange={handleChange}
                  placeholder={`Hi,\n\nI'm excited to apply for this position because...\n\n[Share what makes you a great fit]\n\nLooking forward to hearing from you.`}
                  rows={9}
                  hint="150–250 words recommended"
                />
                <WordCount text={formData.coverLetter} />
              </div>
            </motion.div>

            {/* Resume section */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4, ease }}
              className="rounded-3xl border overflow-hidden"
              style={{ background: C.card, borderColor: C.border }}>
              <div className="flex items-center gap-3 px-7 py-5 border-b" style={{ borderColor: C.border }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: `${C.sage}14` }}>📄</div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: C.muted }}>Step 2</p>
                  <p className="text-base font-black" style={{ color: C.ink, letterSpacing: "-0.02em" }}>Resume</p>
                </div>
              </div>
              <div className="px-7 py-6">
                <ResumeZone
                  file={formData.resume}
                  onChange={(f) => setFormData({ ...formData, resume: f })}
                />
              </div>
            </motion.div>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold overflow-hidden"
                  style={{ background: `${C.red}0D`, border: `1px solid ${C.red}30`, color: C.red }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke={C.red} strokeWidth="1.5"/>
                    <path d="M8 5v3.5M8 10.5v.5" stroke={C.red} strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT — summary sidebar (1/3) */}
          <div className="space-y-4">
            {/* Checklist */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4, ease }}
              className="rounded-2xl border p-5"
              style={{ background: C.card, borderColor: C.border }}>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-4" style={{ color: C.muted }}>
                Checklist
              </p>
              {[
                { label: "Cover letter written", done: formData.coverLetter.trim().length > 30 },
                { label: "Resume attached",       done: !!formData.resume },
              ].map((item, i) => (
                <motion.div key={i}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 py-2.5"
                  style={{ borderBottom: i === 0 ? `1px solid ${C.border}` : "none" }}>
                  <motion.div
                    animate={{ background: item.done ? C.sage : "transparent", borderColor: item.done ? C.sage : C.border }}
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                    transition={{ duration: 0.25 }}>
                    {item.done && (
                      <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 18 }}
                        width="9" height="9" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </motion.svg>
                    )}
                  </motion.div>
                  <span className="text-xs font-semibold" style={{ color: item.done ? C.ink : C.muted }}>
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Submit button */}
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.03, y: loading ? 0 : -2 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.4, ease }}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-black transition-all duration-200"
              style={{
                background: loading ? C.goldL : `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
                color:      C.ink,
                boxShadow:  loading ? "none" : `0 10px 32px ${C.gold}40`,
                cursor:     loading ? "not-allowed" : "pointer",
                letterSpacing: "0.01em",
              }}>
              {loading ? (
                <>
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke={C.goldD} strokeOpacity="0.3" strokeWidth="3"/>
                    <path d="M22 12a10 10 0 0 0-10-10" stroke={C.goldD} strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Submitting…
                </>
              ) : "Submit application ✦"}
            </motion.button>

            {/* Privacy note */}
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-[11px] text-center leading-relaxed" style={{ color: C.muted }}>
              Your application is shared only with the hiring employer. We do not sell your data.
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyJob;