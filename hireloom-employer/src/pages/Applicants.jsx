import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  getJobApplications,
  updateApplicationStatus,
} from "../redux/applicationSlice";
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
  blue:   "#3B6FD4",
};

const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease } }),
};

// ── Status config ──────────────────────────────────────────────
const STATUS_CFG = {
  pending:     { label: "Pending",     dot: C.gold,  badge: `${C.gold}14`,  text: C.gold,  ring: `${C.gold}30`  },
  shortlisted: { label: "Shortlisted", dot: C.blue,  badge: `${C.blue}12`,  text: C.blue,  ring: `${C.blue}30`  },
  rejected:    { label: "Rejected",    dot: C.red,   badge: `${C.red}12`,   text: C.red,   ring: `${C.red}30`   },
  hired:       { label: "Hired 🎉",    dot: C.sage,  badge: `${C.sage}14`,  text: C.sage,  ring: `${C.sage}30`  },
};
const getStatus = (s) => STATUS_CFG[s] || STATUS_CFG.pending;

// ── Time ago ───────────────────────────────────────────────────
const timeAgo = (date) => {
  if (!date) return "";
  const diff = Date.now() - new Date(date);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  const hrs = Math.floor(diff / 3600000);
  return hrs > 0 ? `${hrs}h ago` : "Just now";
};

// ── Avatar initials ────────────────────────────────────────────
const Avatar = ({ name, size = 44 }) => {
  const initials = name?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  const cols = [[`${C.gold}30`, C.gold], [`${C.sage}25`, C.sage], [`${C.blue}20`, C.blue], [`${C.red}20`, C.red]];
  const [bg, fg] = cols[name?.charCodeAt(0) % cols.length] || cols[0];
  return (
    <div className="rounded-2xl flex items-center justify-center font-black shrink-0"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.3, border: `1.5px solid ${fg}25`, letterSpacing: "-0.02em" }}>
      {initials}
    </div>
  );
};

// ── Skeleton card ──────────────────────────────────────────────
const SkeletonCard = ({ i }) => (
  <motion.div custom={i} variants={fadeUp} initial="hidden" animate="show"
    className="rounded-2xl border p-5 animate-pulse"
    style={{ background: C.card, borderColor: C.border }}>
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-2xl shrink-0" style={{ background: C.border }} />
      <div className="flex-1 space-y-2">
        <div className="h-4 rounded w-1/3" style={{ background: C.border }} />
        <div className="h-3 rounded w-1/4" style={{ background: C.border }} />
      </div>
      <div className="h-6 w-20 rounded-full" style={{ background: C.border }} />
    </div>
    <div className="mt-4 space-y-1.5">
      <div className="h-3 rounded" style={{ background: C.border }} />
      <div className="h-3 rounded w-4/5" style={{ background: C.border }} />
    </div>
    <div className="flex gap-2 mt-4">
      {[1,2,3].map(n => <div key={n} className="h-8 w-20 rounded-xl" style={{ background: C.border }} />)}
    </div>
  </motion.div>
);

// ── Filter tab ─────────────────────────────────────────────────
const FilterTab = ({ label, count, active, onClick, dot }) => (
  <button onClick={onClick}
    className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap"
    style={{ color: active ? C.ink : C.muted }}>
    {active && (
      <motion.div layoutId="appFilterBg" className="absolute inset-0 rounded-xl"
        style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }} />
    )}
    {dot && (
      <span className="relative z-10 w-1.5 h-1.5 rounded-full" style={{ background: active ? dot : C.muted }} />
    )}
    <span className="relative z-10 capitalize">{label}</span>
    {count !== undefined && (
      <span className="relative z-10 text-[10px] font-black px-1.5 py-0.5 rounded-full"
        style={{ background: active ? C.ink : `${C.muted}18`, color: active ? "#fff" : C.muted }}>
        {count}
      </span>
    )}
  </button>
);

// ── Action button ──────────────────────────────────────────────
const ActionBtn = ({ label, icon, color, bgColor, onClick, active, loading }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
    onClick={onClick}
    disabled={loading}
    className="flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl transition-all duration-150"
    style={{
      background: active ? color : bgColor,
      color:      active ? "#fff"  : color,
      border:     `1.5px solid ${active ? color : `${color}30`}`,
      boxShadow:  active ? `0 4px 14px ${color}40` : "none",
      opacity:    loading ? 0.6 : 1,
      cursor:     loading ? "wait" : "pointer",
    }}>
    <span>{icon}</span>
    {label}
  </motion.button>
);

// ── Cover letter accordion ─────────────────────────────────────
const CoverLetter = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const truncated = text.slice(0, 160);
  const hasMore = text.length > 160;

  return (
    <div className="mt-4 rounded-xl p-4" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
      <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: C.muted }}>Cover letter</p>
      <AnimatePresence initial={false}>
        <motion.p
          key={expanded ? "full" : "short"}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="text-xs leading-loose" style={{ color: C.muted }}>
          {expanded ? text : truncated}{!expanded && hasMore && "…"}
        </motion.p>
      </AnimatePresence>
      {hasMore && (
        <button onClick={() => setExpanded(p => !p)}
          className="text-[11px] font-black mt-1.5 transition-colors"
          style={{ color: C.gold }}>
          {expanded ? "▲ Show less" : "▾ Read more"}
        </button>
      )}
    </div>
  );
};

// ── Applicant card ─────────────────────────────────────────────
const ApplicantCard = ({ app, i, onStatus, updatingId }) => {
  const st = getStatus(app.status);
  const isUpdating = updatingId === app._id;

  console.log("APP:", app);
  console.log("RESUME:", app.resume);
  console.log("URL:", app.resume?.url);

  return (
    <motion.div
      key={app._id}
      custom={i} variants={fadeUp} initial="hidden" animate="show"
      exit={{ opacity: 0, x: -16, transition: { duration: 0.2 } }}
      layout
      whileHover={{ y: -3, boxShadow: "0 16px 48px rgba(13,13,13,0.08)" }}
      className="rounded-2xl border overflow-hidden transition-shadow group"
      style={{ background: C.card, borderColor: C.border }}
    >
      {/* Status top strip */}
      <motion.div className="h-0.5 w-full" animate={{ background: st.dot }}
        transition={{ duration: 0.3 }} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Avatar name={app.applicant?.name} size={46} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-black truncate" style={{ color: C.ink, letterSpacing: "-0.02em" }}>
                  {app.applicant?.name || "Applicant"}
                </p>
                <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: C.muted }}>
                  {app.applicant?.email}
                </p>
                {app.applicant?.location && (
                  <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>
                    📍 {app.applicant.location}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <motion.span
                  animate={{ background: st.badge, color: st.text }}
                  className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border"
                  style={{ borderColor: st.ring }}>
                  <motion.span
                    animate={{ scale: app.status === "hired" ? [1, 1.3, 1] : 1 }}
                    transition={{ repeat: app.status === "hired" ? Infinity : 0, duration: 2 }}
                    className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                  {st.label}
                </motion.span>
                <span className="text-[10px] font-semibold" style={{ color: C.muted }}>
                  {timeAgo(app.createdAt)}
                </span>
              </div>
            </div>

            {/* Applicant skills */}
            {app.applicant?.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {app.applicant.skills.slice(0, 4).map((s, idx) => (
                  <span key={idx} className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: `${C.ink}07`, color: C.ink, border: `1px solid ${C.border}` }}>
                    {s.name || s}
                  </span>
                ))}
                {app.applicant.skills.length > 4 && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: `${C.gold}14`, color: C.gold }}>
                    +{app.applicant.skills.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cover letter */}
        {app.coverLetter && <CoverLetter text={app.coverLetter} />}

        {/* Resume link */}
        {app.resume?.url && (
          <motion.a whileHover={{ scale: 1.04 }}
            href={app.resume.url} target="_blank" rel="noreferrer"
            download
            className="inline-flex items-center gap-2 mt-4 text-xs font-black px-4 py-2 rounded-xl transition-all"
            style={{ background: `${C.ink}07`, color: C.ink, border: `1px solid ${C.border}` }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.ink; }}>
            📄 View Resume
          </motion.a>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
          <ActionBtn label="Shortlist" icon="⭐"
            color={C.blue} bgColor={`${C.blue}10`}
            active={app.status === "shortlisted"} loading={isUpdating}
            onClick={() => onStatus(app._id, "shortlisted")} />

          <ActionBtn label="Interview" icon="📅"
            color={C.purple} bgColor={`${C.purple}10`}
            active={app.status === "interview"} loading={isUpdating}
            onClick={() => onStatus(app._id, "interview")} />

          <ActionBtn label="Hire" icon="🎉"
            color={C.sage} bgColor={`${C.sage}10`}
            active={app.status === "hired"} loading={isUpdating}
            onClick={() => onStatus(app._id, "hired")} />

          <ActionBtn label="Reject" icon="✕"
            color={C.red} bgColor={`${C.red}08`}
            active={app.status === "rejected"} loading={isUpdating}
            onClick={() => onStatus(app._id, "rejected")} />

          {/* Reset to pending */}
          {app.status !== "pending" && (
            <button onClick={() => onStatus(app._id, "pending")}
              className="text-[11px] font-bold ml-auto hover:underline"
              style={{ color: C.muted }}>
              Reset to pending
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── Main ───────────────────────────────────────────────────────
const Applicants = () => {
  const { jobId }  = useParams();
  const dispatch   = useDispatch();
  const navigate   = useNavigate();

  const { applications = [], loading } = useSelector((s) => s.applications || {});
  const [tab,         setTab]         = useState("all");
  const [updatingId,  setUpdatingId]  = useState(null);
  const [search,      setSearch]      = useState("");

  // ── Original effects ───────────────────────────────────────
  useEffect(() => {
    dispatch(getJobApplications(jobId));
  }, [dispatch, jobId]);

  // ── Original handler ───────────────────────────────────────
  const handleStatus = (id, status) => {
    setUpdatingId(id);
    dispatch(updateApplicationStatus({ id, status }))
      .finally(() => setUpdatingId(null));
  };

  // ── Filter + search ────────────────────────────────────────
  const filtered = applications
    .filter((a) => tab === "all" || a.status === tab)
    .filter((a) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        a.applicant?.name?.toLowerCase().includes(q) ||
        a.applicant?.email?.toLowerCase().includes(q)
      );
    });

  const counts = ["all", "pending", "shortlisted", "interview", "hired", "rejected"].reduce((acc, key) => {
    acc[key] = key === "all" ? applications.length : applications.filter(a => a.status === key).length;
    return acc;
  }, {});

  const TABS = [
    { key: "all",         label: "All",         dot: null      },
    { key: "pending",     label: "Pending",     dot: C.gold    },
    { key: "shortlisted", label: "Shortlisted", dot: C.blue    },
    { key: "interview",   label: "Interview",   dot: C.purple  },
    { key: "hired",       label: "Hired",       dot: C.sage    },
    { key: "rejected",    label: "Rejected",    dot: C.red     },
  ];

  return (
    <div className="min-h-screen" style={{ background: C.paper, fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden" style={{ background: C.ink }}>
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ background: C.gold }} />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full blur-2xl opacity-5" style={{ background: C.gold }} />
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: `radial-gradient(circle, ${C.gold} 1px, transparent 1px)`, backgroundSize: "28px 28px" }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `repeating-linear-gradient(45deg, ${C.gold} 0, ${C.gold} 1px, transparent 1px, transparent 16px)` }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
          <motion.button initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="text-sm font-semibold mb-8 block transition-colors"
            style={{ color: "#5A5450" }}
            onMouseEnter={(e) => e.currentTarget.style.color = C.goldL}
            onMouseLeave={(e) => e.currentTarget.style.color = "#5A5450"}>
            ← Back
          </motion.button>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-2" style={{ color: `${C.gold}88` }}>
                ✦ Employer view
              </p>
              <h1 className="font-black leading-tight"
                style={{ fontSize: "clamp(1.6rem,3.5vw,2.5rem)", color: "#fff", letterSpacing: "-0.04em" }}>
                Applicants 👨‍💻
              </h1>
              <p className="text-sm mt-2" style={{ color: "#6B6460" }}>
                {loading ? "Loading…" : `${applications.length} application${applications.length !== 1 ? "s" : ""} received`}
              </p>
            </div>

            {/* Pipeline stats */}
            {!loading && applications.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-2">
                {[
                  { key: "shortlisted", color: C.blue },
                  { key: "interview",   color: C.purple },
                  { key: "hired",       color: C.sage },
                  { key: "pending",     color: C.gold },
                  { key: "rejected",    color: C.red  },
                ].filter(s => counts[s.key] > 0).map((s) => (
                  <span key={s.key}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.07)", color: s.color, border: "1px solid rgba(255,255,255,0.1)" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                    {counts[s.key]} {s.key}
                  </span>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Animated gold rule */}
        <motion.div className="h-0.5 w-full"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{ background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.goldL}, ${C.gold}, transparent)`, backgroundSize: "200% 100%" }} />
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-10">

        {/* Toolbar */}
        {!loading && applications.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4, ease }}
            className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            {/* Filter tabs */}
            <div className="flex gap-1 p-1 rounded-2xl overflow-x-auto shrink-0"
              style={{ background: C.cream, border: `1px solid ${C.border}`, width: "fit-content" }}>
              {TABS.map((t) => (
                <FilterTab key={t.key} label={t.label} count={counts[t.key]}
                  dot={t.dot} active={tab === t.key} onClick={() => setTab(t.key)} />
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2.5 flex-1 px-4 py-2.5 rounded-xl"
              style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{ color: C.muted, flexShrink: 0 }}>
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.7"/>
                <path d="M13.5 13.5L18 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
              </svg>
              <input type="text" placeholder="Search by name or email…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1, background: "transparent", border: "none",
                  outline: "none", fontSize: "13px", color: C.ink, fontFamily: "inherit",
                }} />
              <AnimatePresence>
                {search && (
                  <motion.button initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    onClick={() => setSearch("")}
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{ background: C.border, color: C.muted }}>×</motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[0,1,2,3].map((i) => <SkeletonCard key={i} i={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease }}
            className="flex flex-col items-center justify-center py-24 text-center">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl mb-5">
              {applications.length === 0 ? "📭" : "🔍"}
            </motion.div>
            <h3 className="font-black text-lg mb-2" style={{ color: C.ink, letterSpacing: "-0.02em" }}>
              {applications.length === 0 ? "No applicants yet" : `No ${tab} applications`}
            </h3>
            <p className="text-sm" style={{ color: C.muted }}>
              {applications.length === 0
                ? "Share your job listing to start receiving applications."
                : search ? `No results for "${search}"` : `No applications with status "${tab}".`}
            </p>
            {(tab !== "all" || search) && (
              <button onClick={() => { setTab("all"); setSearch(""); }}
                className="mt-5 text-sm font-black px-5 py-2.5 rounded-xl"
                style={{ background: C.ink, color: "#fff" }}>
                Show all
              </button>
            )}
          </motion.div>
        )}

        {/* Applicant cards */}
        {!loading && filtered.length > 0 && (
          <>
            <p className="text-xs font-semibold mb-4" style={{ color: C.muted }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              {tab !== "all" ? ` · ${tab}` : ""}
              {search ? ` · "${search}"` : ""}
            </p>
            <AnimatePresence mode="popLayout">
              <div className="space-y-4">
                {filtered.map((app, i) => (
                  <ApplicantCard key={app._id} app={app} i={i}
                    onStatus={handleStatus} updatingId={updatingId} />
                ))}
              </div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};

export default Applicants;