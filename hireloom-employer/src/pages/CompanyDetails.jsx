import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useDispatch } from "react-redux";
import { joinCompany } from "../redux/companySlice";
// import JobCard from "../components/JobCard";
import { motion, AnimatePresence } from "framer-motion";

// ── Animations ────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ── Avatar initials ───────────────────────────────────────────
const CompanyAvatar = ({ name }) => {
  const initials = name?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  return (
    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-200">
      {initials}
    </div>
  );
};

// ── Stat pill ─────────────────────────────────────────────────
const StatPill = ({ icon, label, value, i }) => (
  <motion.div
    custom={i} variants={fadeUp} initial="hidden" animate="show"
    className="flex flex-col items-center gap-1 bg-white border border-slate-100 rounded-2xl px-6 py-4 shadow-sm"
  >
    <span className="text-2xl">{icon}</span>
    <p className="text-xl font-bold text-slate-900">{value ?? "—"}</p>
    <p className="text-xs text-slate-400 font-medium">{label}</p>
  </motion.div>
);

// ── Skeleton loader ───────────────────────────────────────────
const Skeleton = () => (
  <div className="min-h-screen bg-slate-50 animate-pulse">
    <div className="h-52 bg-gradient-to-br from-slate-200 to-slate-100" />
    <div className="max-w-5xl mx-auto px-6 -mt-12 space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <div className="flex gap-5 items-end">
          <div className="w-20 h-20 rounded-3xl bg-slate-200" />
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-100 rounded w-1/4" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-32 bg-white rounded-2xl border border-slate-100" />
        ))}
      </div>
    </div>
  </div>
);

// ── Empty jobs state ──────────────────────────────────────────
const EmptyJobs = () => (
  <motion.div
    variants={fadeUp} initial="hidden" animate="show"
    className="col-span-2 flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100 text-center"
  >
    <div className="text-5xl mb-4">📭</div>
    <p className="text-base font-semibold text-slate-700">No jobs posted yet</p>
    <p className="text-sm text-slate-400 mt-1">Check back later for new opportunities</p>
  </motion.div>
);

// ── Main component ────────────────────────────────────────────
const CompanyDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs]       = useState([]);
  const [joined, setJoined]   = useState(false);
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("jobs");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [companyRes, jobsRes] = await Promise.all([
        API.get(`/companies/${id}`),
        API.get(`/companies/${id}/jobs`),
      ]);
      setCompany(companyRes.data.data);
      setJobs(jobsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleJoin = async () => {
    try {
      setJoining(true);
      await dispatch(joinCompany(id)).unwrap();
      setJoined(true);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <Skeleton />;
  if (!company) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🏚️</div>
        <p className="text-lg font-semibold text-slate-700">Company not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-indigo-500 hover:underline">
          ← Go back
        </button>
      </div>
    </div>
  );

  const tabs = [
    { id: "jobs",    label: "Jobs",    count: jobs.length },
    { id: "about",   label: "About",   count: null },
  ];

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Hero banner ── */}
      <div className="relative h-52 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

        {/* Back button */}
        <div className="absolute top-5 left-5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            ← Back
          </motion.button>
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* ── Main content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* ── Company card ── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          className="bg-white rounded-3xl border border-slate-100 shadow-sm px-6 sm:px-8 pb-6 -mt-12 relative z-10 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pt-4">

            {/* Avatar + name */}
            <div className="flex items-end gap-5">
              <div className="-mt-10">
                <CompanyAvatar name={company.name} />
              </div>
              <div className="pb-1">
                <motion.h1
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight"
                >
                  {company.name}
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.18 }}
                  className="flex flex-wrap items-center gap-3 mt-1"
                >
                  {company.location && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3-4.5 8.5-4.5 8.5S3.5 9 3.5 6A4.5 4.5 0 0 1 8 1.5z" stroke="currentColor" strokeWidth="1.4" />
                        <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                      {company.location}
                    </span>
                  )}
                  {company.industry && (
                    <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full font-medium">
                      {company.industry}
                    </span>
                  )}
                  {company.size && (
                    <span className="text-xs text-slate-400">
                      👥 {company.size} employees
                    </span>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Join button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="pb-1"
            >
              <AnimatePresence mode="wait">
                {joined ? (
                  <motion.div
                    key="joined"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-5 py-2.5 rounded-xl"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="#10b981" strokeWidth="1.5" />
                      <path d="M5 8l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Joined
                  </motion.div>
                ) : (
                  <motion.button
                    key="join"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleJoin}
                    disabled={joining}
                    className={`flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200
                      ${joining ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200"}`}
                  >
                    {joining ? (
                      <>
                        <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3" />
                          <path d="M22 12a10 10 0 0 0-10-10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        Joining…
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                          <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        Join Company
                      </>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatPill icon="💼" label="Open Jobs"   value={jobs.length}          i={0} />
          <StatPill icon="🌐" label="Industry"    value={company.industry}     i={1} />
          <StatPill icon="📍" label="Location"    value={company.location}     i={2} />
        </div>

        {/* ── Tabs ── */}
        <motion.div
          custom={3} variants={fadeUp} initial="hidden" animate="show"
          className="flex gap-1 bg-white border border-slate-100 rounded-xl p-1 mb-6 w-fit shadow-sm"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                ${activeTab === tab.id ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-lg"
                />
              )}
              <span className="relative z-10">{tab.label}</span>
              {tab.count !== null && (
                <span className={`relative z-10 text-[11px] font-bold px-1.5 py-0.5 rounded-full
                  ${activeTab === tab.id ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* ── Tab content ── */}
        <AnimatePresence mode="wait">

          {/* Jobs tab */}
          {activeTab === "jobs" && (
            <motion.div
              key="jobs-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12"
            >
              {jobs.length === 0 ? (
                <EmptyJobs />
              ) : (
                jobs.map((job, i) => (
                  <motion.div
                    key={job._id}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}
                    className="transition-shadow rounded-2xl"
                  >
                    {/* <JobCard job={job} /> */}
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* About tab */}
          {activeTab === "about" && (
            <motion.div
              key="about-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 pb-12"
            >
              {company.description ? (
                <p className="text-sm text-slate-600 leading-relaxed">{company.description}</p>
              ) : (
                <p className="text-sm text-slate-400 italic">No company description available.</p>
              )}

              {/* Extra detail rows */}
              <div className="mt-8 space-y-4">
                {[
                  { label: "Founded",   value: company.founded   },
                  { label: "Website",   value: company.website   },
                  { label: "Email",     value: company.email     },
                  { label: "Team size", value: company.size ? `${company.size} employees` : null },
                ].filter((r) => r.value).map((row) => (
                  <div key={row.label} className="flex gap-4 py-3 border-b border-slate-100 last:border-0">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 w-24 shrink-0 mt-0.5">
                      {row.label}
                    </span>
                    <span className="text-sm text-slate-700 font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CompanyDetails;
