import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchCompany, clearSearchResults } from "../redux/companySlice";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ── Animations ─────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.055, duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  }),
};

const listItem = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show:   { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.18 } },
};

// ── Industry tag color map ─────────────────────────────────────
const industryColors = {
  Technology:  "bg-indigo-50 text-indigo-600 border-indigo-100",
  Finance:     "bg-emerald-50 text-emerald-600 border-emerald-100",
  Healthcare:  "bg-rose-50 text-rose-600 border-rose-100",
  Design:      "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
  Marketing:   "bg-amber-50 text-amber-600 border-amber-100",
  default:     "bg-slate-50 text-slate-500 border-slate-100",
};

const getIndustryColor = (industry) =>
  industryColors[industry] || industryColors.default;

// ── Avatar initials ────────────────────────────────────────────
const CompanyAvatar = ({ name, size = "md" }) => {
  const initials = name?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  const colors = [
    "bg-indigo-100 text-indigo-600",
    "bg-violet-100 text-violet-600",
    "bg-emerald-100 text-emerald-600",
    "bg-amber-100 text-amber-600",
    "bg-rose-100 text-rose-600",
    "bg-sky-100 text-sky-600",
  ];
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];
  const sizeClass = size === "lg" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm";

  return (
    <div className={`${sizeClass} ${color} rounded-2xl flex items-center justify-center font-bold shrink-0`}>
      {initials}
    </div>
  );
};

// ── Skeleton card ──────────────────────────────────────────────
const SkeletonCard = ({ i }) => (
  <motion.div
    custom={i} variants={fadeUp} initial="hidden" animate="show"
    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 animate-pulse"
  >
    <div className="w-10 h-10 bg-slate-100 rounded-2xl shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 bg-slate-100 rounded w-2/5" />
      <div className="h-3 bg-slate-100 rounded w-1/3" />
    </div>
    <div className="h-6 w-20 bg-slate-100 rounded-full" />
  </motion.div>
);

// ─── Main component ────────────────────────────────────────────
const CompanySearch = () => {
  const [query, setQuery]         = useState("");
  const [focused, setFocused]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { searchResults, loading } = useSelector((state) => state.company);

  // Auto-focus on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    setSubmitted(true);
    dispatch(searchCompany(query));
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") {
      setQuery("");
      setSubmitted(false);
      dispatch(clearSearchResults());
    }
  };

  const handleClear = () => {
    setQuery("");
    setSubmitted(false);
    dispatch(clearSearchResults());
    inputRef.current?.focus();
  };

  const handleSelect = (c) => {
    dispatch(clearSearchResults());
    navigate(`/company/${c._id}`);
  };

  const showEmpty   = submitted && !loading && searchResults.length === 0 && query.trim();
  const showResults = !loading && searchResults.length > 0;

  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* ── Top bar ── */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">T</div>
        <span className="font-semibold text-slate-800 tracking-tight">TalentHub</span>
      </nav>

      {/* ── Content ── */}
      <div className="flex-1 px-4 py-12 max-w-2xl mx-auto w-full">

        {/* Header */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          className="mb-10 text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-500 text-2xl mx-auto mb-5"
          >
            🏢
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Find a company</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Search for a company by name to view its profile, or create one if it doesn't exist yet.
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          custom={1} variants={fadeUp} initial="hidden" animate="show"
          className="mb-6"
        >
          <div
            className={`flex items-center gap-3 bg-white rounded-2xl border-2 px-4 py-3 transition-all duration-200
              ${focused ? "border-indigo-400 shadow-lg shadow-indigo-500/8" : "border-slate-200 shadow-sm"}`}
          >
            {/* Search icon */}
            <svg
              className={`shrink-0 transition-colors duration-200 ${focused ? "text-indigo-500" : "text-slate-400"}`}
              width="16" height="16" viewBox="0 0 20 20" fill="none"
            >
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
              <path d="M13.5 13.5L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>

            <input
              ref={inputRef}
              type="text"
              placeholder="Search company name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
            />

            {/* Clear */}
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  type="button"
                  onClick={handleClear}
                  className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-500 text-xs transition-colors shrink-0"
                >
                  ×
                </motion.button>
              )}
            </AnimatePresence>

            {/* Search button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleSearch}
              disabled={!query.trim() || loading}
              className={`flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-xl transition-all duration-200 shrink-0
                ${!query.trim() || loading
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
            >
              {loading ? (
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
                  <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              ) : "Search"}
            </motion.button>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 ml-1">
            Press <kbd className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-mono text-[10px]">Enter</kbd> to search,{" "}
            <kbd className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-mono text-[10px]">Esc</kbd> to clear
          </p>
        </motion.div>

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <SkeletonCard key={i} i={i} />)}
          </div>
        )}

        {/* ── Results ── */}
        <AnimatePresence mode="popLayout">
          {showResults && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* Result count */}
              <motion.p
                variants={fadeUp} initial="hidden" animate="show"
                className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-4"
              >
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
              </motion.p>

              {searchResults.map((c, i) => (
                <motion.div
                  key={c._id}
                  custom={i}
                  variants={listItem}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  layout
                  whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.07)" }}
                  onClick={() => handleSelect(c)}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 cursor-pointer transition-shadow group"
                >
                  <CompanyAvatar name={c.name} />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {c.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" className="text-slate-400 shrink-0">
                        <path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3-4.5 8.5-4.5 8.5S3.5 9 3.5 6A4.5 4.5 0 0 1 8 1.5z" stroke="currentColor" strokeWidth="1.4" />
                        <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                      <span className="text-xs text-slate-400 truncate">
                        {c.location || "Location not set"}
                      </span>
                    </div>
                  </div>

                  {/* Industry badge */}
                  {c.industry && (
                    <span className={`hidden sm:block text-[11px] font-medium px-2.5 py-1 rounded-full border shrink-0 ${getIndustryColor(c.industry)}`}>
                      {c.industry}
                    </span>
                  )}

                  {/* Arrow */}
                  <motion.span
                    className="text-slate-300 group-hover:text-indigo-400 transition-colors text-sm"
                    animate={{ x: 0 }}
                    whileHover={{ x: 3 }}
                  >
                    →
                  </motion.span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── Empty state ── */}
          {showEmpty && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-center py-14 px-6 bg-white rounded-2xl border border-slate-100"
            >
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">
                No company found for "{query}"
              </h3>
              <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                This company isn't in our system yet. <br className="hidden sm:block" />
                Be the first to add it.
              </p>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/create_company")}
                className="inline-flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Create new company
              </motion.button>
            </motion.div>
          )}

          {/* ── Initial idle state ── */}
          {!submitted && !loading && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="flex justify-center gap-3 mb-5">
                {["Acme Corp", "TechNova", "DesignLab"].map((name, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    onClick={() => { setQuery(name); }}
                    className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-2 cursor-pointer hover:border-indigo-200 hover:bg-indigo-50 transition-all"
                  >
                    <CompanyAvatar name={name} size="sm" />
                    <span className="text-xs font-medium text-slate-600">{name}</span>
                  </motion.div>
                ))}
              </div>
              <p className="text-xs text-slate-400">Try a sample search above, or type your own</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CompanySearch;
