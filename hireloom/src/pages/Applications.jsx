import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyApplications,
  withdrawApplication,
  clearApplicationState,
} from "../redux/applicationSlice";
import { Link, useNavigate } from "react-router-dom";
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
  hidden: { opacity: 0, y: 18 },
  show:   (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease } }),
};

// ── Status config ──────────────────────────────────────────────
const STATUS = {
  pending:   { label: "Pending",   dot: C.gold, badge: `${C.gold}14`,   text: C.gold,    ring: `${C.gold}30`  },
  reviewing: { label: "Reviewing", dot: "#7C6AF7", badge: "#7C6AF714", text: "#7C6AF7",  ring: "#7C6AF730" },
  interview: { label: "Interview", dot: "#0EA5E9", badge: "#0EA5E914", text: "#0EA5E9",  ring: "#0EA5E930" },
  accepted:  { label: "Accepted",  dot: C.sage, badge: `${C.sage}14`,  text: C.sage,    ring: `${C.sage}30`  },
  hired:     { label: "Hired",     dot: C.sage, badge: `${C.sage}14`,  text: C.sage,    ring: `${C.sage}30`  },
  rejected:  { label: "Rejected",  dot: C.red,  badge: `${C.red}12`,   text: C.red,     ring: `${C.red}30`   },
};
const getStatus = (s) => STATUS[s] || STATUS.pending;

// ── Time ago ───────────────────────────────────────────────────
const timeAgo = (date) => {
  if (!date) return "Recently";
  const diff = Date.now() - new Date(date);
  const days = Math.floor(diff / 86400000);
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0)  return `${days}d ago`;
  const hrs = Math.floor(diff / 3600000);
  return hrs > 0 ? `${hrs}h ago` : "Just now";
};

// ── Company avatar ─────────────────────────────────────────────
const CompanyAvatar = ({ logo, name, size = 44 }) => {
  const [err, setErr] = useState(false);
  const initials = name?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  const cols = [[`${C.gold}30`, C.gold], [`${C.sage}25`, C.sage], ["#7C6AF722", "#7C6AF7"], [`${C.red}20`, C.red]];
  const [bg, fg] = cols[name?.charCodeAt(0) % cols.length] || cols[0];
  if (logo && !err) return (
    <img src={logo} alt={name} onError={() => setErr(true)}
      className="rounded-xl object-contain border shrink-0"
      style={{ width: size, height: size, borderColor: C.border }} />
  );
  return (
    <div className="rounded-xl flex items-center justify-center font-black shrink-0"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.3, border: `1.5px solid ${fg}30` }}>
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
      <div className="w-11 h-11 rounded-xl shrink-0" style={{ background: C.border }} />
      <div className="flex-1 space-y-2">
        <div className="h-4 rounded w-2/5" style={{ background: C.border }} />
        <div className="h-3 rounded w-1/4" style={{ background: C.border }} />
      </div>
      <div className="h-6 w-20 rounded-full" style={{ background: C.border }} />
    </div>
  </motion.div>
);

// ── Withdraw confirm modal ─────────────────────────────────────
const WithdrawModal = ({ app, onConfirm, onCancel }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center px-4"
    style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
    <motion.div initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.88, opacity: 0 }} transition={{ duration: 0.22, ease }}
      className="rounded-3xl p-7 max-w-sm w-full"
      style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5 mx-auto"
        style={{ background: `${C.red}10` }}>🗑️</div>
      <h3 className="text-base font-black text-center mb-2" style={{ color: C.ink, letterSpacing: "-0.02em" }}>
        Withdraw application?
      </h3>
      <p className="text-sm text-center leading-relaxed mb-6" style={{ color: C.muted }}>
        You're withdrawing your application for <strong style={{ color: C.ink }}>{app.job?.title}</strong> at{" "}
        <strong style={{ color: C.ink }}>{app.job?.company?.name}</strong>. This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: C.paper, border: `1px solid ${C.border}`, color: C.muted }}>
          Cancel
        </button>
        <motion.button whileTap={{ scale: 0.96 }} onClick={onConfirm}
          className="flex-1 py-3 rounded-xl text-sm font-black transition-colors"
          style={{ background: C.red, color: "#fff" }}>
          Yes, withdraw
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

// ── Filter tab ─────────────────────────────────────────────────
const FilterTab = ({ label, count, active, onClick }) => (
  <button onClick={onClick}
    className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
    style={{ color: active ? C.ink : C.muted }}>
    {active && (
      <motion.div layoutId="filterBg" className="absolute inset-0 rounded-xl"
        style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }} />
    )}
    <span className="relative z-10">{label}</span>
    {count !== undefined && (
      <span className="relative z-10 text-[10px] font-black px-1.5 py-0.5 rounded-full"
        style={{ background: active ? C.ink : `${C.muted}18`, color: active ? "#fff" : C.muted }}>
        {count}
      </span>
    )}
  </button>
);

// ── Application card ───────────────────────────────────────────
const AppCard = ({ app, i, onWithdraw }) => {
  const st = getStatus(app.status);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      key={app._id}
      custom={i} variants={fadeUp} initial="hidden" animate="show"
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      layout
      whileHover={{ y: -3, boxShadow: "0 16px 48px rgba(13,13,13,0.08)" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="rounded-2xl border overflow-hidden transition-shadow"
      style={{ background: C.card, borderColor: C.border }}
    >
      {/* Status top bar */}
      <motion.div className="h-0.5 w-full transition-all duration-300"
        style={{ background: hovered ? st.dot : C.border }} />

      <div className="p-5">
        {/* Row 1 — company + status */}
        <div className="flex items-start gap-4">
          <CompanyAvatar logo={app.job?.company?.logo} name={app.job?.company?.name} size={44} />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-black truncate" style={{ color: C.ink, letterSpacing: "-0.02em" }}>
              {app.job?.title || "Job title"}
            </p>
            <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: C.muted }}>
              {app.job?.company?.name || "Company"}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {app.job?.location && (
                <span className="flex items-center gap-1 text-[11px] font-semibold"
                  style={{ color: C.muted }}>
                  📍 {app.job.location}
                </span>
              )}
              {app.job?.jobType && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: C.cream, color: C.muted, border: `1px solid ${C.border}` }}>
                  {app.job.jobType}
                </span>
              )}
            </div>
          </div>

          {/* Status badge */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <motion.span
              animate={{ background: st.badge, color: st.text }}
              className="flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full border"
              style={{ borderColor: st.ring }}>
              <motion.span
                animate={{ scale: app.status === "interview" ? [1, 1.5, 1] : 1 }}
                transition={{ repeat: app.status === "interview" ? Infinity : 0, duration: 1.4 }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: st.dot }} />
              {st.label}
            </motion.span>
            <span className="text-[10px] font-semibold" style={{ color: C.muted }}>
              {timeAgo(app.createdAt)}
            </span>
          </div>
        </div>

        {/* Row 2 — actions */}
        <div className="flex items-center justify-between mt-4 pt-3.5"
          style={{ borderTop: `1px solid ${C.border}` }}>
          {/* View job link */}
          {app.job?._id && (
            <Link to={`/job/${app.job._id}`}
              className="flex items-center gap-1.5 text-xs font-bold transition-colors hover:underline"
              style={{ color: C.muted }}
              onMouseEnter={(e) => e.currentTarget.style.color = C.gold}
              onMouseLeave={(e) => e.currentTarget.style.color = C.muted}>
              View job →
            </Link>
          )}

          {/* Withdraw button (only for non-final statuses) */}
          {app.status !== "accepted" && app.status !== "rejected" && (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onWithdraw(app)}
              className="flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl transition-all"
              style={{ background: `${C.red}0E`, color: C.red, border: `1px solid ${C.red}20` }}>
              Withdraw
            </motion.button>
          )}

          {/* Terminal statuses */}
          {app.status === "accepted" && (
            <span className="flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl"
              style={{ background: `${C.sage}10`, color: C.sage }}>
              🎉 Hired!
            </span>
          )}
          {app.status === "rejected" && (
            <span className="text-xs font-semibold" style={{ color: C.muted }}>
              Application closed
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── Main ───────────────────────────────────────────────────────
const Applications = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const { applications, loading, error, successMessage } = useSelector(
    (s) => s.applications
  );

  const [filter,      setFilter]      = useState("all");
  const [withdrawing, setWithdrawing] = useState(null); // app object for modal

  // ── All original effects ───────────────────────────────────
  useEffect(() => {
    dispatch(getMyApplications());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => dispatch(clearApplicationState()), 2000);
    }
  }, [successMessage, dispatch]);

  const handleWithdraw = (id) => {
    dispatch(withdrawApplication(id));
    setWithdrawing(null);
  };

  // ── Filter ─────────────────────────────────────────────────
  const FILTERS = [
    { key: "all",      label: "All" },
    { key: "pending",  label: "Pending" },
    { key: "interview",label: "Interview" },
    { key: "shortlisted", label: "Shortlisted" },
    { key: "hired",    label: "Hired" },
    { key: "rejected", label: "Rejected" },
  ];

  const filtered = filter === "all"
    ? applications
    : applications.filter((a) => a.status === filter);

  const counts = FILTERS.reduce((acc, f) => {
    acc[f.key] = f.key === "all"
      ? applications.length
      : applications.filter((a) => a.status === f.key).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ background: C.paper, fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden" style={{ background: C.ink }}>
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ background: C.gold }} />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full blur-2xl opacity-5"  style={{ background: C.gold }} />
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: `radial-gradient(circle, ${C.gold} 1px, transparent 1px)`, backgroundSize: "28px 28px" }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `repeating-linear-gradient(45deg, ${C.gold} 0, ${C.gold} 1px, transparent 1px, transparent 16px)` }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
          <motion.button initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/dashboard")}
            className="text-sm font-semibold mb-8 block transition-colors"
            style={{ color: "#5A5450" }}
            onMouseEnter={(e) => e.currentTarget.style.color = C.goldL}
            onMouseLeave={(e) => e.currentTarget.style.color = "#5A5450"}>
            ← Dashboard
          </motion.button>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-2" style={{ color: `${C.gold}88` }}>
                ✦ Your activity
              </p>
              <h1 className="font-black leading-tight"
                style={{ fontSize: "clamp(1.6rem,3.5vw,2.5rem)", color: "#fff", letterSpacing: "-0.04em" }}>
                My applications
              </h1>
              <p className="text-sm mt-2" style={{ color: "#6B6460" }}>
                {loading ? "Loading…" : `${applications.length} application${applications.length !== 1 ? "s" : ""} submitted`}
              </p>
            </div>

            {/* Summary pills */}
            {!loading && applications.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-2">
                {[
                  { label: "Interview", count: counts.interview, color: "#0EA5E9" },
                  { label: "Shortlisted",  count: counts.shortlisted,  color: C.sage   },
                  { label: "Hired",       count: counts.hired,       color: C.sage   },
                  { label: "Rejected",    count: counts.rejected,    color: C.red    },
                  { label: "Pending",   count: counts.pending,   color: C.gold   },
                ].filter(s => s.count > 0).map((s) => (
                  <span key={s.label}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.07)", color: s.color, border: "1px solid rgba(255,255,255,0.1)" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                    {s.count} {s.label}
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

      {/* ── Main content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-10">

        {/* Success toast */}
        <AnimatePresence>
          {successMessage && (
            <motion.div initial={{ opacity: 0, y: -12, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5 text-sm font-semibold overflow-hidden"
              style={{ background: `${C.sage}0D`, border: `1px solid ${C.sage}30`, color: C.sage }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke={C.sage} strokeWidth="1.5"/>
                <path d="M5 8l2 2 4-4" stroke={C.sage} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
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

        {/* Filter tabs */}
        {!loading && applications.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4, ease }}
            className="flex gap-1 p-1 rounded-2xl mb-6 overflow-x-auto"
            style={{ background: C.cream, border: `1px solid ${C.border}`, width: "fit-content" }}>
            {FILTERS.map((f) => (
              <FilterTab key={f.key} label={f.label} count={counts[f.key]}
                active={filter === f.key} onClick={() => setFilter(f.key)} />
            ))}
          </motion.div>
        )}

        {/* Loading skeletons */}
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
              {filter === "all" ? "📋" : "🔍"}
            </motion.div>
            <h3 className="font-black text-lg mb-2" style={{ color: C.ink, letterSpacing: "-0.02em" }}>
              {filter === "all" ? "No applications yet" : `No ${filter} applications`}
            </h3>
            <p className="text-sm mb-6" style={{ color: C.muted }}>
              {filter === "all"
                ? "Start applying to jobs you love and track them here."
                : `You have no applications with status "${filter}" right now.`}
            </p>
            {filter !== "all" ? (
              <button onClick={() => setFilter("all")}
                className="text-sm font-black px-5 py-2.5 rounded-xl"
                style={{ background: C.ink, color: "#fff" }}>
                Show all
              </button>
            ) : (
              <Link to="/jobs"
                className="text-sm font-black px-6 py-3 rounded-xl inline-block"
                style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`, color: C.ink }}>
                Browse jobs ✦
              </Link>
            )}
          </motion.div>
        )}

        {/* Applications list */}
        {!loading && filtered.length > 0 && (
          <AnimatePresence mode="popLayout">
            <motion.div className="space-y-4">
              {filtered.map((app, i) => (
                <AppCard key={app._id} app={app} i={i} onWithdraw={(a) => setWithdrawing(a)} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Result count */}
        {!loading && filtered.length > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-center text-xs mt-8 font-semibold" style={{ color: C.muted }}>
            {filtered.length} application{filtered.length !== 1 ? "s" : ""}
            {filter !== "all" ? ` · ${filter}` : ""}
          </motion.p>
        )}
      </div>

      {/* ── Withdraw confirm modal ── */}
      <AnimatePresence>
        {withdrawing && (
          <WithdrawModal
            app={withdrawing}
            onConfirm={() => handleWithdraw(withdrawing._id)}
            onCancel={() => setWithdrawing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Applications;