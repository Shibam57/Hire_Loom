import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { filterJobs } from "../redux/jobSlice";

import bgimage from "../assets/bg-image-main.jpg";
import { motion } from "framer-motion";
import { FiSearch, FiMapPin, FiArrowRight } from "react-icons/fi";
import { FiBriefcase, FiUsers, FiTrendingUp } from "react-icons/fi";

const Hero = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const titleRef = useRef(null);
  const locationRef = useRef(null);
  const [activeTag, setActiveTag] = useState(null);

  const popularTags = [
    "Developer",
    "Designer",
    "Marketing",
    "Remote",
    "Manager",
  ];

  const stats = [
    { icon: FiBriefcase, number: "50K+", label: "Active Jobs" },
    { icon: FiUsers, number: "1M+", label: "Job Seekers" },
    { icon: FiTrendingUp, number: "95%", label: "Success Rate" },
  ];

  // ================= SEARCH =================
  const onSearch = (e) => {
    e.preventDefault();

    const filters = {
      title: titleRef.current.value,
      location: locationRef.current.value,
    };

    dispatch(filterJobs(filters)); // 🔥 Redux
    navigate("/jobs"); // 🔥 redirect to jobs page
  };

  const handleTagClick = (tag) => {
    setActiveTag(tag);
    titleRef.current.value = tag;
  };

  return (
    <section className="relative overflow-hidden mx-4 my-6 lg:mx-8 lg:my-10 rounded-3xl shadow-2xl">

      {/* Background */}
      <div className="absolute inset-0">
        <img src={bgimage} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-indigo-800/70"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-32 text-center text-white">

        {/* TITLE */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Find Your <span className="text-yellow-300">Dream Job</span>
        </h1>

        <p className="text-lg text-white/80 mb-10">
          Search thousands of jobs and build your future
        </p>

        {/* STATS */}
        <div className="flex justify-center gap-10 mb-10">
          {stats.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <s.icon className="text-yellow-300" />
              <span className="font-bold">{s.number}</span>
              <span className="text-sm">{s.label}</span>
            </div>
          ))}
        </div>

        {/* SEARCH BAR */}
        <form
          onSubmit={onSearch}
          className="max-w-4xl mx-auto bg-white rounded-xl flex flex-col md:flex-row overflow-hidden shadow-xl"
        >
          <div className="flex items-center px-4 py-3 flex-1 border-b md:border-b-0 md:border-r">
            <FiSearch className="text-gray-400 mr-2" />
            <input
              ref={titleRef}
              type="text"
              placeholder="Job title or skill"
              className="w-full outline-none text-black"
            />
          </div>

          <div className="flex items-center px-4 py-3 flex-1 border-b md:border-b-0 md:border-r">
            <FiMapPin className="text-gray-400 mr-2" />
            <input
              ref={locationRef}
              type="text"
              placeholder="Location"
              className="w-full outline-none text-black"
            />
          </div>

          <button className="bg-indigo-600 text-white px-6 py-3 flex items-center justify-center">
            Search <FiArrowRight className="ml-2" />
          </button>
        </form>

        {/* TAGS */}
        <div className="mt-6 flex justify-center gap-3 flex-wrap">
          {popularTags.map((tag, i) => (
            <button
              key={i}
              onClick={() => handleTagClick(tag)}
              className={`px-4 py-2 rounded-full text-sm ${
                activeTag === tag
                  ? "bg-yellow-400 text-black"
                  : "bg-white/20"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;