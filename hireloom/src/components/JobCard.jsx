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
  const [saved, setSaved] = useState(false);

  // remove HTML if backend sends rich text
  const cleanText = (text) =>
    text ? text.replace(/<[^>]+>/g, "") : "No description available";

  // time formatter
  const timeAgo = (date) => {
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

  // salary formatter
  const formatSalary = (salary) => {
    if (!salary) return "Not disclosed";

    if (typeof salary === "string") return salary;

    if (salary.min && salary.max) {
      return `₹${salary.min} - ₹${salary.max}`;
    }

    if (salary.amount) {
      return `₹${salary.amount}`;
    }

    return "Not specified";
  };

  const handleView = () => {
    navigate(`/job/${job._id}`);
  };

  const handleApply = () => {
    navigate(`/apply-job/${job._id}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white border rounded-xl shadow-md hover:shadow-lg transition p-4"
    >
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <img
            src={job.company?.logo || "/default-company.png"}
            alt="company"
            className="w-12 h-12 rounded-md object-cover border"
          />

          <div>
            <h2 className="font-semibold text-lg text-gray-800">
              {job.title}
            </h2>
            <p className="text-sm text-gray-500">
              {job.company?.name || "Company"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setSaved(!saved)}
          className={`text-xl ${
            saved ? "text-indigo-600" : "text-gray-400"
          }`}
        >
          <FiBookmark />
        </button>
      </div>

      {/* TAGS */}
      <div className="flex flex-wrap gap-2 mt-3 text-xs">
        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
          <FiMapPin /> {job.location || "Remote"}
        </span>

        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
          <FiBriefcase /> {job.jobType || "Full Time"}
        </span>

        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
          <FiDollarSign /> {formatSalary(job.salary)}
        </span>

        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
          <FiClock /> {timeAgo(job.createdAt)}
        </span>
      </div>

      {/* DESCRIPTION */}
      <p className="text-sm text-gray-600 mt-3 line-clamp-3">
        {cleanText(job.description)}
      </p>

      {/* SKILLS */}
      {job.skillsRequired?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {job.skillsRequired.slice(0, 4).map((skill, i) => (
            <span
              key={i}
              className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded"
            >
              {skill}
            </span>
          ))}
          {job.skillsRequired.length > 4 && (
            <span className="text-xs text-gray-400">
              +{job.skillsRequired.length - 4}
            </span>
          )}
        </div>
      )}

      {/* BUTTONS */}
      <div className="flex justify-between mt-4">
        <button
          onClick={handleView}
          className="px-3 py-1 text-sm border rounded text-indigo-600"
        >
          View
        </button>

        <button
          onClick={handleApply}
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded"
        >
          Apply
        </button>
      </div>
    </motion.div>
  );
};

export default JobCard;