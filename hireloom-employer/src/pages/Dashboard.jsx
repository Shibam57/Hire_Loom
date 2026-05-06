import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBriefcase,
  FaUsers,
  FaPlus,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaEye,
  FaChevronDown,
  FaBell,
  FaSearch,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getDashboardData, deleteJob } from "../redux/dashboardSlice";
import { useNavigate } from "react-router-dom";

// ── Animation variants ──
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.32, ease: "easeOut" },
  }),
};

const statusConfig = {
  active: {
    dot: "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  paused: {
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  closed: {
    dot: "bg-red-400",
    badge: "bg-red-50 text-red-700 border border-red-200",
  },
  draft: {
    dot: "bg-gray-300",
    badge: "bg-gray-50 text-gray-500 border border-gray-200",
  },
};

// ── Skeleton row ──
const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-6 py-4 animate-pulse">
    <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 bg-gray-100 rounded w-2/5" />
      <div className="h-3 bg-gray-100 rounded w-1/4" />
    </div>
    <div className="h-6 w-16 bg-gray-100 rounded-full hidden sm:block" />
    <div className="flex gap-2">
      <div className="h-7 w-7 rounded-lg bg-gray-100" />
      <div className="h-7 w-7 rounded-lg bg-gray-100" />
      <div className="h-7 w-7 rounded-lg bg-gray-100" />
    </div>
  </div>
);

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jobs, stats, loading } = useSelector((state) => state.dashboard);

  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Fetch ──
  useEffect(() => {
    dispatch(getDashboardData());
  }, [dispatch]);

  // ── Delete ──
  const handleDelete = () => {
    dispatch(deleteJob(deleteId));
    setDeleteId(null);
  };

  // ── Filter ──
  const filteredJobs = jobs.filter((job) => {
    const matchSearch =
      job.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.location?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || (job.status || "active") === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ══════════════ NAVBAR ══════════════ */}
      <nav className="sticky top-0 z-30 bg-white border-b border-gray-100 px-6 lg:px-10 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2a5 5 0 1 1 0 10A5 5 0 0 1 10 2z"
                stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.2"
              />
              <path
                d="M3 18c0-3.314 3.134-6 7-6s7 2.686 7 6"
                stroke="white" strokeWidth="1.5" strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 tracking-tight">Hireloom</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Post job btn */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/post-job")}
            className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <FaPlus className="text-[10px]" />
            Post job
          </motion.button>

          {/* Bell */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <FaBell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>

          {/* Avatar */}
          <button 
          onClick={()=> navigate("/company_search")}
          className="flex items-center gap-2 pl-2 border-l border-gray-100 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-semibold">
              EC
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">My Company</span>
            <FaChevronDown className="text-gray-400 text-[10px] hidden sm:block" />
          </button>
        </div>
      </nav>

      {/* ══════════════ PAGE BODY ══════════════ */}
      <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-6xl mx-auto">

        {/* Page title */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          className="mb-7 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
        >
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage your listings and track applicants
            </p>
          </div>

          {/* Mobile post btn */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/post-job")}
            className="sm:hidden flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl w-fit"
          >
            <FaPlus className="text-[10px]" /> Post new job
          </motion.button>
        </motion.div>

        {/* ══ STAT CARDS ══ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[
            {
              icon: <FaBriefcase />,
              label: "Total jobs posted",
              value: stats?.totalJobs ?? 0,
              iconBg: "bg-indigo-50",
              iconColor: "text-indigo-500",
              trend: "+2 this week",
            },
            {
              icon: <FaUsers />,
              label: "Total applicants",
              value: stats?.totalApplicants ?? 0,
              iconBg: "bg-emerald-50",
              iconColor: "text-emerald-500",
              trend: "+14 this week",
            },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              whileHover={{ y: -2 }}
              className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex items-center gap-5"
            >
              <div
                className={`w-12 h-12 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center text-xl shrink-0`}
              >
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  {card.label}
                </p>
                {loading ? (
                  <div className="h-7 w-12 bg-gray-100 rounded-md animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-semibold text-gray-900 mt-0.5">
                    {card.value}
                  </p>
                )}
              </div>
              <span className="hidden sm:block text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full font-medium shrink-0">
                {card.trend}
              </span>
            </motion.div>
          ))}
        </div>

        {/* ══ JOB TABLE CARD ══ */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          {/* Table toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              Your job listings
              {!loading && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({filteredJobs.length})
                </span>
              )}
            </h2>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 w-36 transition-all"
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-gray-700 cursor-pointer"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="divide-y divide-gray-50">
              {[1, 2, 3].map((n) => <SkeletonRow key={n} />)}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 text-2xl mb-4">
                <FaBriefcase />
              </div>
              <p className="text-sm font-medium text-gray-600">
                {search ? "No jobs match your search" : "No jobs posted yet"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Click "Post job" to get started
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              <div className="divide-y divide-gray-50">
                {filteredJobs.map((job, i) => {
                  const st = statusConfig[job.status || "active"];
                  return (
                    <motion.div
                      key={job._id}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      animate="show"
                      exit={{ opacity: 0, x: -16, transition: { duration: 0.2 } }}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                    >
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400 shrink-0">
                        <FaBriefcase className="text-sm" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {job.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <FaMapMarkerAlt className="text-[10px]" />
                            {job.location || "Location not set"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {job.applicants ?? 0} applicants
                          </span>
                        </div>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`hidden sm:flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${st.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {(job.status || "active").charAt(0).toUpperCase() +
                          (job.status || "active").slice(1)}
                      </span>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => navigate(`/employer/applicants/${job._id}`)}
                          title="View applications"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <FaEye className="text-sm" />
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => navigate(`/edit-job/${job._id}`)}
                          title="Edit job"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <FaEdit className="text-sm" />
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setDeleteId(job._id)}
                          title="Delete job"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FaTrash className="text-sm" />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}

          {/* Footer */}
          {!loading && filteredJobs.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {filteredJobs.length} result{filteredJobs.length !== 1 ? "s" : ""}
              </p>
              <button className="text-xs text-indigo-500 hover:underline font-medium">
                View all →
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* ══════════════ DELETE MODAL ══════════════ */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 text-xl mb-4">
                <FaTrash />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Delete this job?
              </h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                This action cannot be undone. All applicant data for this listing will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition-colors"
                >
                  Yes, delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
