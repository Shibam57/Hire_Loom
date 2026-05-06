import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getJobs } from "../redux/jobSlice";
import { getMyApplications } from "../redux/applicationSlice";
import JobCard from "../components/JobCard";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CallToAction from "../components/Calltoaction";

// ── Design tokens (matches Profile.jsx gold/ink palette) ───────
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
  purple: "#7C6AF7",
  red:    "#D94F3D",
};

const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease },
  }),
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

// ── Avatar ─────────────────────────────────────────────────────
const Avatar = ({ name, size = 56 }) => {
  const initials = name?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  return (
    <div
      className="rounded-2xl flex items-center justify-center font-black shrink-0"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${C.gold}50, ${C.ink}18)`,
        border: `2px solid ${C.goldL}`,
        fontSize: size * 0.3,
        color: C.ink,
        letterSpacing: "-0.02em",
      }}
    >
      {initials}
    </div>
  );
};

// ── Skeleton ───────────────────────────────────────────────────
const Skel = ({ w = "w-full", h = "h-4", r = "rounded-lg" }) => (
  <div className={`${w} ${h} ${r} animate-pulse`} style={{ background: C.border }} />
);

const SkeletonJobRow = () => (
  <div className="flex items-center gap-4 p-5 animate-pulse" style={{ borderBottom: `1px solid ${C.border}` }}>
    <div className="w-10 h-10 rounded-xl shrink-0" style={{ background: C.border }} />
    <div className="flex-1 space-y-2"><Skel w="w-2/5" /><Skel w="w-1/3" h="h-3" /></div>
    <Skel w="w-16" h="h-6" r="rounded-full" />
  </div>
);

// ── Stat card ──────────────────────────────────────────────────
const StatCard = ({ i, icon, label, value, sub, loading, accent, to }) => (
  <motion.div custom={i} variants={fadeUp} initial="hidden" animate="show" whileHover={{ y: -4 }}>
    <Link to={to} className="block h-full">
      <div className="relative overflow-hidden rounded-2xl p-6 h-full transition-shadow hover:shadow-lg"
        style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-15"
          style={{ background: accent }} />
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 relative"
          style={{ background: `${accent}14` }}>
          {icon}
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-2" style={{ color: C.muted }}>{label}</p>
        {loading
          ? <Skel w="w-14" h="h-9" r="rounded-xl" />
          : <p className="font-black mb-1.5" style={{ fontSize: "2.25rem", color: C.ink, letterSpacing: "-0.04em", lineHeight: 1 }}>
              {value ?? "—"}
            </p>
        }
        {sub && <p className="text-xs" style={{ color: C.muted }}>{sub}</p>}
      </div>
    </Link>
  </motion.div>
);

// ── Quick action ───────────────────────────────────────────────
const ActionBtn = ({ i, to, icon, label, desc, accent }) => (
  <motion.div custom={i} variants={fadeUp} initial="hidden" animate="show" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
    <Link to={to} className="flex items-center gap-4 rounded-2xl px-5 py-4 transition-all hover:shadow-md group"
      style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ background: `${accent}14` }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold" style={{ color: C.ink }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: C.muted }}>{desc}</p>
      </div>
      <span className="text-sm group-hover:translate-x-1 transition-transform duration-200"
        style={{ color: C.border }}>→</span>
    </Link>
  </motion.div>
);

// ── Main ───────────────────────────────────────────────────────
const Dashboard = () => {
  const dispatch = useDispatch();

  const { user }                               = useSelector((s) => s.auth);
  const { jobs,         loading: jobsLoading } = useSelector((s) => s.jobs)         || {};
  const { applications, loading: appsLoading } = useSelector((s) => s.applications) || {};

  useEffect(() => {
    dispatch(getJobs());
    dispatch(getMyApplications());
  }, [dispatch]);

  const recentJobs   = jobs?.slice(0, 4)  || [];
  const totalJobs    = jobs?.length        ?? 0;
  const totalApplied = applications?.length ?? 0;

  return (
    <div className="min-h-screen" style={{ background: C.paper, fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── External Navbar (your component) ── */}
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10">

        {/* ══════════════ HERO BANNER ══════════════ */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          className="relative overflow-hidden rounded-3xl mb-8 px-8 py-9"
          style={{ background: C.ink }}
        >
          {/* Glow blobs */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-10"
            style={{ background: C.gold }} />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full blur-2xl opacity-5"
            style={{ background: C.gold }} />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, ${C.gold} 1px, transparent 1px)`,
              backgroundSize: "26px 26px",
            }} />
          {/* Diagonal stripe accent */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${C.gold} 0, ${C.gold} 1px, transparent 1px, transparent 14px)`,
            }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Left — avatar + greeting */}
            <div className="flex items-center gap-5">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 250, damping: 18 }}
              >
                <Avatar name={user?.name} size={64} />
              </motion.div>

              <div>
                <motion.p
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.4, ease }}
                  className="text-[10px] font-black uppercase tracking-[0.2em] mb-1"
                  style={{ color: `${C.gold}88` }}
                >
                  {greeting()}
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.16, duration: 0.4, ease }}
                  className="font-black leading-tight"
                  style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", color: "#fff", letterSpacing: "-0.03em" }}
                >
                  {user?.name || "Welcome back"} 👋
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.24 }}
                  className="text-xs mt-1"
                  style={{ color: "#5A5450" }}
                >
                  {user?.email}
                </motion.p>
              </div>
            </div>

            {/* Right — CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.22 }}
            >
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/jobs"
                  className="flex items-center gap-2 text-sm font-black px-6 py-3 rounded-xl whitespace-nowrap"
                  style={{ background: C.gold, color: C.ink }}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.goldL}
                  onMouseLeave={(e) => e.currentTarget.style.background = C.gold}
                >
                  Browse jobs ✦
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* ══════════════ STATS ══════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <StatCard
            i={1} icon="📋" label="Applied jobs"
            value={totalApplied} loading={appsLoading}
            sub={`${totalApplied} application${totalApplied !== 1 ? "s" : ""} submitted`}
            accent={C.sage} to="/applications"
          />
          <StatCard
            i={2} icon="💼" label="Available jobs"
            value={totalJobs} loading={jobsLoading}
            sub="Active listings right now"
            accent={C.gold} to="/jobs"
          />
        </div>

        {/* ══════════════ TWO COLUMN ══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Recent jobs (2/3) ── */}
          <div className="lg:col-span-2">
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show"
              className="rounded-2xl overflow-hidden"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              {/* Table header */}
              <div className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <h3 className="text-sm font-black" style={{ color: C.ink }}>Recent jobs</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>Latest listings across all categories</p>
                </div>
                <Link to="/jobs" className="text-xs font-black hover:underline" style={{ color: C.gold }}>
                  View all →
                </Link>
              </div>

              {/* Rows */}
              {jobsLoading ? (
                <div>{[0,1,2,3].map((i) => <SkeletonJobRow key={i} />)}</div>
              ) : recentJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                  <div className="text-5xl mb-4">📭</div>
                  <p className="text-sm font-bold" style={{ color: C.muted }}>No jobs available right now</p>
                  <p className="text-xs mt-1" style={{ color: C.border }}>New listings are added daily — check back soon</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  <motion.div variants={stagger} initial="hidden" animate="show"
                    className="divide-y" style={{ borderColor: C.border }}>
                    {recentJobs.map((job, i) => (
                      <motion.div
                        key={job._id}
                        custom={i}
                        variants={fadeUp}
                        whileHover={{ backgroundColor: C.cream }}
                        className="transition-colors duration-150"
                      >
                        <JobCard job={job} />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Footer count */}
              {!jobsLoading && recentJobs.length > 0 && (
                <div className="flex items-center justify-between px-6 py-3"
                  style={{ borderTop: `1px solid ${C.border}` }}>
                  <p className="text-xs" style={{ color: C.muted }}>
                    Showing {recentJobs.length} of {totalJobs} jobs
                  </p>
                  <Link to="/jobs" className="text-xs font-black hover:underline" style={{ color: C.gold }}>
                    Browse all →
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* ── Sidebar (1/3) ── */}
          <div className="space-y-3">
            <motion.p custom={4} variants={fadeUp} initial="hidden" animate="show"
              className="text-[10px] font-black uppercase tracking-[0.18em] px-1 pb-2"
              style={{ color: C.muted }}>
              Quick actions
            </motion.p>

            <ActionBtn i={5}  to="/jobs"         icon="🔍" label="Browse jobs"     desc="Explore all listings"    accent={C.gold}   />
            <ActionBtn i={6}  to="/applications" icon="📋" label="My applications" desc="Track your progress"     accent={C.sage}   />
            <ActionBtn i={7}  to="/profile"      icon="👤" label="My profile"      desc="Update skills & resume"  accent={C.ink}    />
            <ActionBtn i={8}  to="/saved"        icon="🔖" label="Saved jobs"      desc="Bookmarked listings"     accent={C.purple} />

            {/* Profile strength nudge */}
            <motion.div custom={9} variants={fadeUp} initial="hidden" animate="show"
              className="rounded-2xl p-5 mt-1"
              style={{ background: `${C.gold}0D`, border: `1px solid ${C.gold}30` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: C.gold }}>Profile strength</p>
                <span className="text-xs font-black" style={{ color: C.gold }}>65%</span>
              </div>
              <div className="h-1.5 rounded-full mb-2.5" style={{ background: `${C.gold}22` }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: C.gold }}
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  transition={{ delay: 1, duration: 0.8, ease }}
                />
              </div>
              <p className="text-[11px]" style={{ color: C.muted }}>
                Get <span style={{ color: C.gold, fontWeight: 700 }}>3× more</span> employer views.{" "}
                <Link to="/profile" className="font-bold underline" style={{ color: C.gold }}>Improve →</Link>
              </p>
            </motion.div>

            {/* Recent application statuses */}
            <AnimatePresence>
              {!appsLoading && applications?.length > 0 && (
                <motion.div
                  key="app-status"
                  custom={10} variants={fadeUp} initial="hidden" animate="show"
                  className="rounded-2xl p-5"
                  style={{ background: C.card, border: `1px solid ${C.border}` }}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-3.5" style={{ color: C.muted }}>
                    Application status
                  </p>
                  {applications.slice(0, 3).map((app, i) => {
                    const dotColor =
                      app.status === "accepted"  ? C.sage  :
                      app.status === "rejected"  ? C.red   :
                      app.status === "interview" ? C.gold  : C.muted;
                    return (
                      <div key={app._id || i}
                        className="flex items-center gap-3 py-2.5"
                        style={{ borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                        <motion.div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: dotColor }}
                          animate={{ scale: app.status === "interview" ? [1, 1.4, 1] : 1 }}
                          transition={{ repeat: app.status === "interview" ? Infinity : 0, duration: 1.4 }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: C.ink }}>
                            {app.job?.title || "Job Application"}
                          </p>
                          <p className="text-[10px] capitalize" style={{ color: dotColor, fontWeight: 600 }}>
                            {app.status || "pending"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <Link to="/applications"
                    className="text-[11px] font-black mt-3 block hover:underline"
                    style={{ color: C.gold }}>
                    View all applications →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Dashboard;
