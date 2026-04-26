import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiBookmark,
  FiMapPin,
  FiBriefcase,
  FiDollarSign,
  FiClock,
} from "react-icons/fi";

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  const [isSaved, setIsSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // ==============================
  // CLEAN HTML
  // ==============================
  const stripHtmlTags = (html) => {
    return html ? html.replace(/<[^>]*>?/gm, "") : "No description provided";
  };

  // ==============================
  // TIME FORMAT (Mongo createdAt)
  // ==============================
  const getTimePassed = (date) => {
    if (!date) return "Recently posted";

    const diff = Date.now() - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (days > 0) return `${days}d ago`;
    if (hrs > 0) return `${hrs}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "Just now";
  };

  // ==============================
  // SALARY FORMAT (flexible)
  // ==============================
  const formatSalary = (salary) => {
    if (!salary) return "Not disclosed";

    if (typeof salary === "string") return salary;

    if (salary.min && salary.max) {
      return `₹${salary.min} - ₹${salary.max}`;
    }

    if (salary.amount) {
      return `₹${salary.amount}`;
    }

    return "Salary not specified";
  };

  // ==============================
  // NAVIGATION
  // ==============================
  const handleApply = () => {
    navigate(`/apply-job/${job._id}`);
  };

  const handleView = () => {
    navigate(`/job/${job._id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative group p-1 rounded-2xl bg-white border border-gray-200 hover:border-indigo-400 shadow-lg hover:shadow-xl transition-all"
      >
        <div className="bg-white rounded-2xl overflow-hidden">

          {/* NEW Badge */}
          {getTimePassed(job.createdAt) === "Just now" && (
            <span className="absolute top-3 right-3 bg-indigo-500 text-white text-[10px] px-2 py-1 rounded-full">
              NEW
            </span>
          )}

          {/* HEADER */}
          <div className="p-5 flex justify-between">
            <div className="flex gap-3">
              <img
                src={job.company?.logo || "/default-company.png"}
                alt="logo"
                className="w-12 h-12 rounded-lg object-cover border"
              />
              <div>
                <h3 className="text-md font-bold text-gray-800">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {job.company?.name || "Company"}
                </p>
              </div>
            </div>

            {/* Save */}
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`text-lg ${
                isSaved ? "text-indigo-500" : "text-gray-400"
              }`}
            >
              <FiBookmark />
            </button>
          </div>

          {/* TAGS */}
          <div className="px-5 pb-3 flex flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
              <FiMapPin /> {job.location || "Remote"}
            </span>

            <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
              <FiBriefcase /> {job.category || "General"}
            </span>

            <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
              <FiDollarSign /> {formatSalary(job.salary)}
            </span>

            {job.type && (
              <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                <FiClock /> {job.type}
              </span>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="px-5 pb-3">
            <p
              onClick={() => setIsExpanded(!isExpanded)}
              className={`text-sm text-gray-600 cursor-pointer ${
                isExpanded ? "" : "line-clamp-3"
              }`}
            >
              {stripHtmlTags(job.description)}
            </p>
          </div>

          {/* SKILLS */}
          {job.skills?.length > 0 && (
            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {job.skills.slice(0, 4).map((skill, i) => (
                <span
                  key={i}
                  className="text-xs bg-gray-100 px-2 py-1 rounded"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="text-xs text-gray-400">
                  +{job.skills.length - 4}
                </span>
              )}
            </div>
          )}

          {/* FOOTER */}
          <div className="px-5 py-3 border-t flex justify-between items-center bg-gray-50">
            <span className="text-xs text-gray-400">
              {getTimePassed(job.createdAt)}
            </span>

            <div className="flex gap-2">
              <button
                onClick={handleView}
                className="text-xs px-3 py-1 border rounded text-indigo-600"
              >
                View
              </button>

              <button
                onClick={handleApply}
                className="text-xs px-3 py-1 bg-indigo-600 text-white rounded"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default JobCard;