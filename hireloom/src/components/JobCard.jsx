import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiBriefcase,
  FiClock,
  FiDollarSign,
  FiBookmark,
  FiChevronDown,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// ── Design tokens (matches Dashboard / Profile / Navbar) ───────
const C = {
  ink:    "#0D0D0D",
  paper:  "#FAFAF8",
  cream:  "#F5F0E8",
  gold:   "#C9A84C",
  goldL:  "#E8D5A0",
  muted:  "#8A8680",
  border: "#E4DDD4",
  card:   "#FFFFFF",
  sage:   "#4D7C5F",
  red:    "#D94F3D",
};

const ease = [0.22, 1, 0.36, 1];

// ── Job type color map ─────────────────────────────────────────
const typeColors = {
  "Full-time":  { bg: `${C.sage}14`,   text: C.sage,  dot: C.sage   },
  "Part-time":  { bg: `${C.gold}14`,   text: C.gold,  dot: C.gold   },
  "Remote":     { bg: "#7C6AF714",     text: "#7C6AF7",dot: "#7C6AF7"},
  "Internship": { bg: `${C.red}12`,    text: C.red,   dot: C.red    },
  "Contract":   { bg: "#0EA5E912",     text: "#0EA5E9",dot: "#0EA5E9"},
};
const getTypeStyle = (type) =>
  typeColors[type] || { bg: `${C.muted}12`, text: C.muted, dot: C.muted };

// ── Company initials avatar ────────────────────────────────────
const CompanyAvatar = ({ logo, name }) => {
  const [imgError, setImgError] = useState(false);
  const initials = name?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  const colors = [
    [`${C.gold}30`, C.gold],
    [`${C.sage}25`, C.sage],
    ["#7C6AF722", "#7C6AF7"],
    [`${C.red}18`, C.red],
  ];
  const [bg, fg] = colors[name?.charCodeAt(0) % colors.length] || colors[0];

  if (logo && !imgError) {
    return (
      <img
        src={logo}
        alt={name}
        onError={() => setImgError(true)}
        className="w-12 h-12 rounded-2xl object-contain border shrink-0"
        style={{ borderColor: C.border }}
      />
    );
  }
  return (
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0"
      style={{ background: bg, color: fg, border: `1.5px solid ${fg}30` }}
    >
      {initials}
    </div>
  );
};

// ── Tag chip ───────────────────────────────────────────────────
const Tag = ({ icon: Icon, children }) => (
  <span
    className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-full"
    style={{ background: C.cream, color: C.muted, border: `1px solid ${C.border}` }}
  >
    {Icon && <Icon size={10} />}
    {children}
  </span>
);

// ── Main JobCard ───────────────────────────────────────────────
const JobCard = ({ job }) => {
  const navigate = useNavigate();

  const [saved,    setSaved]    = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [applying, setApplying] = useState(false);

  // ── Time ago ────────────────────────────────────────────────
  const getTimeAgo = (date) => {
    if (!date) return "Recently";
    const diff = Date.now() - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hrs  = Math.floor(mins / 60);
    const days = Math.floor(hrs  / 24);
    if (days > 0) return `${days}d ago`;
    if (hrs  > 0) return `${hrs}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "Just now";
  };

  // ── Salary format ───────────────────────────────────────────
  const formatSalary = (salary) => {
    if (!salary) return "Not disclosed";
    if (typeof salary === "string") return salary;
    if (salary.min && salary.max) return `₹${(salary.min / 100000).toFixed(0)}L – ₹${(salary.max / 100000).toFixed(0)}L`;
    if (salary.amount) return `₹${salary.amount}`;
    return "Not specified";
  };

  // ── Clean HTML ──────────────────────────────────────────────
  const cleanDescription = (html) =>
    html ? html.replace(/<[^>]*>?/gm, "") : "No description provided";

  const handleView  = () => navigate(`/job/${job._id}`);
  const handleApply = () => {
    setApplying(true);
    setTimeout(() => { navigate(`/apply-job/${job._id}`); }, 400);
  };

  const typeStyle = getTypeStyle(job.jobType);
  const desc      = cleanDescription(job.description);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease }}
      whileHover={{ y: -3, boxShadow: "0 16px 48px rgba(13,13,13,0.09)" }}
      className="relative flex flex-col rounded-3xl overflow-hidden transition-shadow"
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 12px rgba(13,13,13,0.05)",
      }}
    >
      {/* Gold top bar accent */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${C.gold}00, ${C.gold}, ${C.gold}00)` }} />

      <div className="p-5 flex flex-col gap-4 flex-1">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <CompanyAvatar logo={job.company?.logo || "/default-company.png"} name={job.company?.name} />
            <div className="min-w-0">
              <h2 className="font-black text-sm leading-tight truncate pr-2"
                style={{ color: C.ink, letterSpacing: "-0.02em" }}>
                {job.title || "Untitled Job"}
              </h2>
              <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: C.muted }}>
                {job.company?.name || "Company"}
              </p>

              {/* Job type badge */}
              {job.jobType && (
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5"
                  style={{ background: typeStyle.bg, color: typeStyle.text }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: typeStyle.dot }} />
                  {job.jobType}
                </span>
              )}
            </div>
          </div>

          {/* Save bookmark */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setSaved(!saved)}
            className="p-2 rounded-xl transition-colors shrink-0"
            style={{
              color:      saved ? C.gold    : C.muted,
              background: saved ? `${C.gold}14` : "transparent",
              border:     `1px solid ${saved ? C.gold : C.border}`,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={saved ? "saved" : "unsaved"}
                initial={{ scale: 0.5, rotate: -20 }}
                animate={{ scale: 1,   rotate: 0   }}
                exit={{    scale: 0.5, rotate: 20  }}
                transition={{ duration: 0.2 }}
              >
                <FiBookmark size={15} fill={saved ? C.gold : "none"} />
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>

        {/* ── Meta tags ── */}
        <div className="flex flex-wrap gap-1.5">
          {job.location && (
            <Tag icon={FiMapPin}>{job.location}</Tag>
          )}
          {job.category && (
            <Tag icon={FiBriefcase}>{job.category}</Tag>
          )}
          <Tag icon={FiDollarSign}>{formatSalary(job.salary)}</Tag>
          {job.experienceRequired && (
            <Tag icon={FiClock}>{job.experienceRequired}</Tag>
          )}
        </div>

        {/* ── Description ── */}
        <div>
          <AnimatePresence initial={false}>
            <motion.p
              key={expanded ? "expanded" : "collapsed"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-xs leading-relaxed cursor-pointer"
              style={{ color: C.muted }}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? desc : desc.slice(0, 120) + (desc.length > 120 ? "…" : "")}
            </motion.p>
          </AnimatePresence>

          {desc.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[11px] font-bold mt-1 transition-colors"
              style={{ color: C.gold }}
            >
              <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.22 }}>
                <FiChevronDown size={12} />
              </motion.span>
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>

        {/* ── Skills ── */}
        {job.skillsRequired?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.skillsRequired.slice(0, 4).map((skill, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, duration: 0.22 }}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: `${C.ink}08`, color: C.ink, border: `1px solid ${C.border}` }}
              >
                {skill}
              </motion.span>
            ))}
            {job.skillsRequired.length > 4 && (
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: `${C.gold}14`, color: C.gold }}
              >
                +{job.skillsRequired.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderTop: `1px solid ${C.border}`, background: C.paper }}
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.sage }} />
          <span className="text-[11px] font-semibold" style={{ color: C.muted }}>
            {getTimeAgo(job.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View */}
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
            onClick={handleView}
            className="text-xs font-bold px-4 py-2 rounded-xl border transition-colors"
            style={{ borderColor: C.border, color: C.ink }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.ink; }}
          >
            View
          </motion.button>

          {/* Apply */}
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
            onClick={handleApply}
            disabled={applying}
            className="flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl transition-all"
            style={{
              background: applying ? C.goldL : C.ink,
              color:      applying ? C.gold  : "#fff",
              boxShadow:  applying ? "none"  : `0 4px 16px ${C.ink}30`,
            }}
            onMouseEnter={(e) => { if (!applying) e.currentTarget.style.background = C.gold; }}
            onMouseLeave={(e) => { if (!applying) e.currentTarget.style.background = C.ink; }}
          >
            {applying ? (
              <>
                <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke={C.gold} strokeOpacity="0.3" strokeWidth="3"/>
                  <path d="M22 12a10 10 0 0 0-10-10" stroke={C.gold} strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Loading…
              </>
            ) : "Apply →"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default JobCard;
