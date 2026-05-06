import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getJobById, applyJob } from "../redux/jobSlice";
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.42, ease } }),
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

// ── Job type color map ─────────────────────────────────────────
const typeColors = {
  "Full-time":  { bg: `${C.sage}14`,  text: C.sage,    dot: C.sage    },
  "Part-time":  { bg: `${C.gold}14`,  text: C.gold,    dot: C.gold    },
  "Remote":     { bg: "#7C6AF714",    text: "#7C6AF7", dot: "#7C6AF7" },
  "Internship": { bg: `${C.red}12`,   text: C.red,     dot: C.red     },
  "Contract":   { bg: "#0EA5E912",    text: "#0EA5E9", dot: "#0EA5E9" },
};
const getType = (t) => typeColors[t] || { bg: `${C.muted}12`, text: C.muted, dot: C.muted };

// ── Company avatar ─────────────────────────────────────────────
const CompanyAvatar = ({ logo, name, size = 72 }) => {
  const [err, setErr] = useState(false);
  const initials = name?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  const cols = [[`${C.gold}30`, C.gold], [`${C.sage}25`, C.sage], ["#7C6AF722", "#7C6AF7"]];
  const [bg, fg] = cols[name?.charCodeAt(0) % cols.length] || cols[0];
  if (logo && !err) return (
    <img src={logo} alt={name} onError={() => setErr(true)}
      className="rounded-2xl object-contain border shrink-0"
      style={{ width: size, height: size, borderColor: C.border }} />
  );
  return (
    <div className="rounded-2xl flex items-center justify-center font-black shrink-0"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.28, border: `1.5px solid ${fg}30` }}>
      {initials}
    </div>
  );
};

// ── Skeleton ───────────────────────────────────────────────────
const Skel = ({ w = "w-full", h = "h-4", r = "rounded-lg" }) => (
  <div className={`${w} ${h} ${r} animate-pulse`} style={{ background: C.border }} />
);

const SkeletonDetail = () => (
  <div className="min-h-screen" style={{ background: C.paper }}>
    <div className="h-64" style={{ background: C.ink }} />
    <div className="max-w-5xl mx-auto px-6 -mt-16 space-y-5 pb-12">
      <div className="h-40 rounded-3xl" style={{ background: C.border }} />
      {[1,2,3].map(n => <div key={n} className="h-32 rounded-2xl" style={{ background: C.border }} />)}
    </div>
  </div>
);

// ── Info row ───────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
    <span className="text-base shrink-0 mt-0.5">{icon}</span>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: C.muted }}>{label}</p>
      <p className="text-sm font-semibold" style={{ color: value ? C.ink : C.border }}>{value || "—"}</p>
    </div>
  </div>
);

// ── Section heading ────────────────────────────────────────────
const SHead = ({ children }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: C.muted }}>{children}</span>
    <div className="flex-1 h-px" style={{ background: C.border }} />
  </div>
);

// ── Time ago ───────────────────────────────────────────────────
const timeAgo = (date) => {
  if (!date) return "Recently";
  const diff = Date.now() - new Date(date);
  const days = Math.floor(diff / 86400000);
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0)  return `${days}d ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0)   return `${hrs}h ago`;
  return "Just now";
};

// ── Salary ─────────────────────────────────────────────────────
const fmtSalary = (s) => {
  if (!s) return "Not disclosed";
  if (typeof s === "string") return s;
  if (s.min && s.max) return `₹${(s.min/100000).toFixed(0)}L – ₹${(s.max/100000).toFixed(0)}L`;
  if (s.amount) return `₹${s.amount}`;
  return "Not specified";
};

// ── Strip HTML ─────────────────────────────────────────────────
const clean = (html) => html ? html.replace(/<[^>]*>?/gm, "") : "";

// ── Main ───────────────────────────────────────────────────────
const JobDetails = () => {
  const { id }   = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { job, loading, error, successMessage } = useSelector((s) => s.jobs);

  const [applying,  setApplying]  = useState(false);
  const [applied,   setApplied]   = useState(false);
  const [descExp,   setDescExp]   = useState(false);

  useEffect(() => { dispatch(getJobById(id)); }, [dispatch, id]);

  useEffect(() => {
    if (successMessage) { setApplied(true); setApplying(false); }
  }, [successMessage]);

  const handleApply = () => {
    if (applied) return;
    setApplying(true);
    dispatch(applyJob({ jobId: id }));
  };

  if (loading) return <SkeletonDetail />;

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.paper }}>
      <div className="text-center px-6">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-base font-bold mb-4" style={{ color: C.ink }}>{error}</p>
        <button onClick={() => navigate(-1)} className="text-sm font-semibold hover:underline" style={{ color: C.gold }}>
          ← Go back
        </button>
      </div>
    </div>
  );

  if (!job) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.paper }}>
      <div className="text-center">
        <div className="text-5xl mb-4">📭</div>
        <p className="font-bold" style={{ color: C.muted }}>No job found</p>
      </div>
    </div>
  );

  const typeStyle = getType(job.jobType);
  const desc      = clean(job.description);
  const truncated = desc.slice(0, 320);
  const hasMore   = desc.length > 320;

  return (
    <div className="min-h-screen" style={{ background: C.paper, fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ══ HERO BANNER ══ */}
      <div className="relative overflow-hidden" style={{ background: C.ink }}>
        {/* Blobs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ background: C.gold }} />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full blur-2xl opacity-5" style={{ background: C.gold }} />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: `radial-gradient(circle, ${C.gold} 1px, transparent 1px)`, backgroundSize: "28px 28px" }} />
        {/* Diagonal stripes */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `repeating-linear-gradient(45deg, ${C.gold} 0, ${C.gold} 1px, transparent 1px, transparent 16px)` }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
          {/* Back btn */}
          <motion.button initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold mb-10 transition-colors"
            style={{ color: "#5A5450" }}
            onMouseEnter={(e) => e.currentTarget.style.color = C.goldL}
            onMouseLeave={(e) => e.currentTarget.style.color = "#5A5450"}>
            ← Back to jobs
          </motion.button>

          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            {/* Company avatar */}
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}>
              <CompanyAvatar logo={job.company?.logo || "/default-company.png"} name={job.company?.name} size={80} />
            </motion.div>

            <div className="flex-1 min-w-0">
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.45, ease }}>
                {/* Job type badge */}
                {job.jobType && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-3"
                    style={{ background: typeStyle.bg, color: typeStyle.text }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: typeStyle.dot }} />
                    {job.jobType}
                  </span>
                )}
                <h1 className="font-black leading-tight mb-1"
                  style={{ fontSize: "clamp(1.5rem,3.5vw,2.5rem)", color: "#fff", letterSpacing: "-0.04em" }}>
                  {job.title}
                </h1>
                <p className="text-base font-semibold" style={{ color: "#8A8278" }}>
                  {job.company?.name}
                  {job.company?.website && (
                    <a href={job.company.website} target="_blank" rel="noopener noreferrer"
                      className="ml-3 text-sm font-bold transition-colors"
                      style={{ color: C.goldD }}
                      onMouseEnter={(e) => e.currentTarget.style.color = C.gold}
                      onMouseLeave={(e) => e.currentTarget.style.color = C.goldD}>
                      {job.company.website.replace(/^https?:\/\//, "")} ↗
                    </a>
                  )}
                </p>
              </motion.div>
            </div>

            {/* Posted time */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
              className="shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.sage }} />
                <span className="text-xs font-semibold" style={{ color: "#6B6460" }}>
                  {timeAgo(job.createdAt)}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Quick meta tags */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.4, ease }}
            className="flex flex-wrap gap-2 mt-7">
            {[
              { icon: "📍", val: job.location },
              { icon: "💼", val: job.category },
              { icon: "💰", val: fmtSalary(job.salary) },
              { icon: "⏱",  val: job.experienceRequired ? `${job.experienceRequired} yrs exp` : null },
            ].filter((t) => t.val).map((t, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.07)", color: "#9A9288", border: "1px solid rgba(255,255,255,0.09)" }}>
                {t.icon} {t.val}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Animated gold bottom rule */}
        <motion.div className="h-0.5 w-full"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{ background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.goldL}, ${C.gold}, transparent)`, backgroundSize: "200% 100%" }} />
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — main content (2/3) */}
          <div className="lg:col-span-2 space-y-5">

            {/* Description */}
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show"
              className="rounded-2xl border p-7" style={{ background: C.card, borderColor: C.border }}>
              <SHead>Job description</SHead>
              <AnimatePresence initial={false}>
                <motion.p
                  key={descExp ? "full" : "short"}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-sm leading-loose" style={{ color: C.muted }}>
                  {descExp ? desc : truncated}{!descExp && hasMore && "…"}
                </motion.p>
              </AnimatePresence>
              {hasMore && (
                <button onClick={() => setDescExp((p) => !p)}
                  className="flex items-center gap-1.5 text-xs font-black mt-3 transition-colors"
                  style={{ color: C.gold }}>
                  <motion.span animate={{ rotate: descExp ? 180 : 0 }} transition={{ duration: 0.22 }}>▾</motion.span>
                  {descExp ? "Show less" : "Read full description"}
                </button>
              )}
            </motion.div>

            {/* Skills */}
            {job.skills?.length > 0 && (
              <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show"
                className="rounded-2xl border p-7" style={{ background: C.card, borderColor: C.border }}>
                <SHead>Skills required</SHead>
                <motion.div variants={stagger} initial="hidden" animate="show"
                  className="flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.05, type: "spring", stiffness: 280, damping: 20 }}
                      whileHover={{ y: -2, scale: 1.05 }}
                      className="text-xs font-bold px-3.5 py-2 rounded-full border transition-all duration-150 cursor-default"
                      style={{ background: `${C.ink}06`, color: C.ink, borderColor: C.border }}>
                      {skill}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Poster info */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show"
              className="rounded-2xl border p-7" style={{ background: C.card, borderColor: C.border }}>
              <SHead>Posting details</SHead>
              <div>
                <InfoRow icon="👤" label="Posted by"    value={job.createdBy?.name} />
                <InfoRow icon="📅" label="Posted on"    value={job.createdAt ? new Date(job.createdAt).toDateString() : null} />
                <InfoRow icon="🏷️" label="Experience"  value={job.experienceRequired ? `${job.experienceRequired} years` : null} />
                <InfoRow icon="💼" label="Category"     value={job.category} />
              </div>
            </motion.div>
          </div>

          {/* RIGHT — sidebar (1/3) */}
          <div className="space-y-5">

            {/* Apply card */}
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show"
              className="rounded-2xl border overflow-hidden"
              style={{ background: C.card, borderColor: C.border }}>
              {/* Gold top rule */}
              <div className="h-0.5 w-full"
                style={{ background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />
              <div className="p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: C.muted }}>
                  Ready to apply?
                </p>
                <p className="text-base font-black mb-4" style={{ color: C.ink, letterSpacing: "-0.02em" }}>
                  {job.title}
                </p>

                {/* Salary highlight */}
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5"
                  style={{ background: `${C.gold}0D`, border: `1px solid ${C.gold}25` }}>
                  <span className="text-lg">💰</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.goldD }}>Salary</p>
                    <p className="text-sm font-black" style={{ color: C.ink }}>{fmtSalary(job.salary)}</p>
                  </div>
                </div>

                {/* Apply button */}
                <AnimatePresence mode="wait">
                  {applied ? (
                    <motion.div key="applied"
                      initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-3 justify-center py-3.5 rounded-xl font-black text-sm"
                      style={{ background: `${C.sage}12`, color: C.sage, border: `1px solid ${C.sage}30` }}>
                      <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 350, damping: 20 }}
                        width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke={C.sage} strokeWidth="1.5"/>
                        <path d="M5 8l2 2 4-4" stroke={C.sage} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </motion.svg>
                      Application sent!
                    </motion.div>
                  ) : (
                    <motion.button key="apply"
                      whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                      onClick={handleApply}
                      disabled={applying}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-black text-sm transition-all duration-200"
                      style={{
                        background:  applying ? C.goldL : `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
                        color:       C.ink,
                        boxShadow:   applying ? "none" : `0 8px 28px ${C.gold}40`,
                        cursor:      applying ? "wait" : "pointer",
                      }}>
                      {applying ? (
                        <>
                          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke={C.goldD} strokeOpacity="0.3" strokeWidth="3"/>
                            <path d="M22 12a10 10 0 0 0-10-10" stroke={C.goldD} strokeWidth="3" strokeLinecap="round"/>
                          </svg>
                          Submitting…
                        </>
                      ) : <>Apply now 🚀</>}
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Success message from Redux */}
                <AnimatePresence>
                  {successMessage && (
                    <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-semibold text-center mt-3"
                      style={{ color: C.sage }}>
                      {successMessage}
                    </motion.p>
                  )}
                </AnimatePresence>

                <p className="text-[11px] text-center mt-3" style={{ color: C.muted }}>
                  Your profile will be shared with the employer
                </p>
              </div>
            </motion.div>

            {/* Company mini-card */}
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show"
              className="rounded-2xl border p-6" style={{ background: C.card, borderColor: C.border }}>
              <SHead>About company</SHead>
              <div className="flex items-center gap-4 mb-4">
                <CompanyAvatar logo={job.company?.logo || "/default-company.png"} name={job.company?.name} size={44} />
                <div className="min-w-0">
                  <p className="text-sm font-black truncate" style={{ color: C.ink }}>{job.company?.name}</p>
                  {job.company?.website && (
                    <a href={job.company.website} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-semibold hover:underline truncate block"
                      style={{ color: C.gold }}>
                      {job.company.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
              </div>
              {job.company?.description && (
                <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
                  {job.company.description.slice(0, 120)}
                  {job.company.description.length > 120 ? "…" : ""}
                </p>
              )}
            </motion.div>

            {/* Quick facts */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show"
              className="rounded-2xl border p-6" style={{ background: C.card, borderColor: C.border }}>
              <SHead>Quick facts</SHead>
              <div className="space-y-0">
                <InfoRow icon="📍" label="Location"    value={job.location} />
                <InfoRow icon="⏱"  label="Job type"   value={job.jobType} />
                <InfoRow icon="🧠" label="Experience"  value={job.experienceRequired ? `${job.experienceRequired} yrs` : null} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;