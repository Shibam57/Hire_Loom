import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getJobs } from "../redux/jobSlice";
import JobCard from "../components/JobCard";
import { motion, AnimatePresence } from "framer-motion";

// ── Design tokens (matches full design system) ─────────────────
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

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.38, ease },
  }),
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

// ── Filter options ─────────────────────────────────────────────
const JOB_TYPES = ["All", "Full-time", "Part-time", "Remote", "Internship", "Contract"];

const SORT_OPTIONS = [
  { value: "newest",  label: "Newest first"  },
  { value: "oldest",  label: "Oldest first"  },
  { value: "az",      label: "A → Z"         },
];

// ── Skeleton job card ──────────────────────────────────────────
const SkeletonCard = ({ i }) => (
  <motion.div
    custom={i} variants={fadeUp} initial="hidden" animate="show"
    className="rounded-3xl overflow-hidden animate-pulse"
    style={{ background: C.card, border: `1px solid ${C.border}` }}
  >
    <div className="h-0.5 w-full" style={{ background: C.border }} />
    <div className="p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl shrink-0" style={{ background: C.border }} />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded-lg w-3/5" style={{ background: C.border }} />
          <div className="h-3 rounded-lg w-2/5" style={{ background: C.border }} />
        </div>
      </div>
      <div className="flex gap-2">
        {[1,2,3].map(n => <div key={n} className="h-6 rounded-full w-16" style={{ background: C.border }} />)}
      </div>
      <div className="space-y-1.5">
        <div className="h-3 rounded w-full" style={{ background: C.border }} />
        <div className="h-3 rounded w-4/5" style={{ background: C.border }} />
        <div className="h-3 rounded w-3/5" style={{ background: C.border }} />
      </div>
    </div>
    <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: `1px solid ${C.border}` }}>
      <div className="h-3 rounded w-12" style={{ background: C.border }} />
      <div className="flex gap-2">
        <div className="h-7 w-14 rounded-xl" style={{ background: C.border }} />
        <div className="h-7 w-16 rounded-xl" style={{ background: C.border }} />
      </div>
    </div>
  </motion.div>
);

// ── Main ───────────────────────────────────────────────────────
const Jobs = () => {
  const dispatch = useDispatch();
  const { jobs = [], loading, error } = useSelector((s) => s.jobs || {});

  const [search,   setSearch]   = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sort,     setSort]     = useState("newest");
  const [focused,  setFocused]  = useState(false);

  useEffect(() => {
    dispatch(getJobs());
  }, [dispatch]);

  // ── Filter + sort ───────────────────────────────────────────
  const filteredJobs = useMemo(() => {
    console.log("JOBS IN UI:", jobs);

    let result = jobs.filter((job) => {
      const matchSearch = (job.title || "").toLowerCase().includes(search.toLowerCase()) ||
                          (job.company?.name || "").toLowerCase().includes(search.toLowerCase()) ||
                          (job.location || "").toLowerCase().includes(search.toLowerCase());
      const matchType   = typeFilter === "All" || job.jobType === typeFilter;
      return matchSearch && matchType;
    });

    if (sort === "newest") result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "oldest") result = [...result].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === "az")     result = [...result].sort((a, b) => (a.title || "").localeCompare(b.title || ""));

    return result;
  }, [jobs, search, typeFilter, sort]);

  const activeFilters = (typeFilter !== "All" ? 1 : 0) + (search.trim() ? 1 : 0);

  return (
    <div
      className="min-h-screen"
      style={{ background: C.paper, fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >

      {/* ══════════════ HERO SECTION ══════════════ */}
      <div className="relative overflow-hidden" style={{ background: C.ink }}>
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ background: C.gold }} />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full blur-2xl opacity-5"
          style={{ background: C.gold }} />
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, ${C.gold} 1px, transparent 1px)`,
            backgroundSize: "26px 26px",
          }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, ${C.gold} 0, ${C.gold} 1px, transparent 1px, transparent 14px)`,
          }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
          <motion.div
            variants={stagger} initial="hidden" animate="show"
            className="max-w-2xl"
          >
            <motion.p variants={fadeUp}
              className="text-[10px] font-black uppercase tracking-[0.22em] mb-3"
              style={{ color: `${C.gold}88` }}>
              Opportunities
            </motion.p>
            <motion.h1 variants={fadeUp}
              className="font-black leading-tight mb-3"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#fff", letterSpacing: "-0.04em" }}>
              Find your<br />
              <span style={{ color: C.gold }}>dream job</span> 🚀
            </motion.h1>
            <motion.p variants={fadeUp}
              className="text-sm leading-relaxed mb-8"
              style={{ color: "#6B6460" }}>
              {loading
                ? "Loading the latest opportunities…"
                : `${jobs.length.toLocaleString()} active listing${jobs.length !== 1 ? "s" : ""} across all industries`}
            </motion.p>

            {/* ── Search bar ── */}
            <motion.div variants={fadeUp}>
              <div
                className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
                style={{
                  background: focused ? "#161614" : "#111110",
                  border: `1.5px solid ${focused ? C.gold : "#2A2520"}`,
                  boxShadow: focused ? `0 0 0 4px ${C.gold}18` : "none",
                }}
              >
                {/* Search icon */}
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"
                  style={{ color: focused ? C.gold : "#5A5450", flexShrink: 0 }}>
                  <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M13.5 13.5L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>

                <input
                  type="text"
                  placeholder="Search by title, company, or location…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
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

                {/* Clear */}
                <AnimatePresence>
                  {search && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.15 }}
                      onClick={() => setSearch("")}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: "#2A2520", color: "#8A8680" }}
                    >
                      ×
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Search button */}
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="text-xs font-black px-4 py-2 rounded-xl shrink-0 transition-colors"
                  style={{ background: C.gold, color: C.ink }}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.goldL}
                  onMouseLeave={(e) => e.currentTarget.style.background = C.gold}
                >
                  Search
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ══════════════ FILTER BAR ══════════════ */}
      <div className="sticky top-16 z-20 border-b" style={{ background: C.card, borderColor: C.border }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-4 overflow-x-auto">
          {/* Type filter chips */}
          <div className="flex items-center gap-2 shrink-0">
            {JOB_TYPES.map((type) => (
              <motion.button
                key={type}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTypeFilter(type)}
                className="text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition-all duration-150"
                style={{
                  background: typeFilter === type ? C.ink      : "transparent",
                  color:      typeFilter === type ? "#fff"     : C.muted,
                  border:     `1px solid ${typeFilter === type ? C.ink : C.border}`,
                }}
              >
                {type}
              </motion.button>
            ))}
          </div>

          {/* Right side — result count + sort */}
          <div className="flex items-center gap-3 shrink-0">
            {!loading && (
              <span className="text-xs font-semibold" style={{ color: C.muted }}>
                {filteredJobs.length} result{filteredJobs.length !== 1 ? "s" : ""}
              </span>
            )}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl cursor-pointer outline-none transition-all"
              style={{
                background: C.cream,
                border: `1px solid ${C.border}`,
                color: C.ink,
                fontFamily: "inherit",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ══════════════ CONTENT ══════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10">

        {/* Active filter pills */}
        <AnimatePresence>
          {activeFilters > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mb-6 overflow-hidden"
            >
              {search.trim() && (
                <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: `${C.gold}14`, color: C.gold, border: `1px solid ${C.gold}30` }}>
                  "{search}"
                  <button onClick={() => setSearch("")} className="font-black">×</button>
                </span>
              )}
              {typeFilter !== "All" && (
                <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: `${C.ink}08`, color: C.ink, border: `1px solid ${C.border}` }}>
                  {typeFilter}
                  <button onClick={() => setTypeFilter("All")} className="font-black">×</button>
                </span>
              )}
              <button onClick={() => { setSearch(""); setTypeFilter("All"); }}
                className="text-xs font-black hover:underline" style={{ color: C.red }}>
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0,1,2,3,4,5].map((i) => <SkeletonCard key={i} i={i} />)}
          </div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 rounded-2xl px-5 py-4 mb-6 text-sm font-semibold"
              style={{ background: `${C.red}0E`, border: `1px solid ${C.red}30`, color: C.red }}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke={C.red} strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 10.5v.5" stroke={C.red} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!loading && !error && filteredJobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl mb-5"
            >
              🔍
            </motion.div>
            <h3 className="font-black text-lg mb-2" style={{ color: C.ink, letterSpacing: "-0.02em" }}>
              No jobs found
            </h3>
            <p className="text-sm mb-6" style={{ color: C.muted }}>
              {search ? `No results for "${search}"` : "Try adjusting your filters"}
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setSearch(""); setTypeFilter("All"); }}
              className="text-sm font-black px-6 py-3 rounded-xl"
              style={{ background: C.ink, color: "#fff" }}
            >
              Clear filters
            </motion.button>
          </motion.div>
        )}

        {/* Job grid */}
        {!loading && filteredJobs.length > 0 && (
          <AnimatePresence mode="sync">
            <motion.div
              key={`${search}-${typeFilter}-${sort}`}
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredJobs.map((job, i) => (
                <motion.div
                  key={job._id}
                  custom={i}
                  variants={fadeUp}
                  layout
                >
                  <JobCard job={job} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Footer count */}
        {!loading && filteredJobs.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs mt-10 font-semibold"
            style={{ color: C.muted }}
          >
            Showing all {filteredJobs.length} result{filteredJobs.length !== 1 ? "s" : ""}
            {typeFilter !== "All" ? ` · ${typeFilter}` : ""}
            {search ? ` · "${search}"` : ""}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default Jobs;
