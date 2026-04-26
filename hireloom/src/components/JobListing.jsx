import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getJobs } from "../redux/jobSlice";
import JobCard from "./JobCard";
import { motion, AnimatePresence } from "framer-motion";

const JobListing = () => {
  const dispatch = useDispatch();
  const { jobs = [], loading } = useSelector((state) => state.jobs || {});

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);

  const [searchFilter, setSearchFilter] = useState({
    title: "",
    location: "",
  });

  // ✅ FETCH JOBS
  useEffect(() => {
    dispatch(getJobs());
  }, [dispatch]);

  // ==============================
  // ✅ FILTER (NO useEffect)
  // ==============================
  const filteredJobs = useMemo(() => {
    return [...jobs]
      .filter((job) => {
        const matchTitle =
          !searchFilter.title ||
          job.title.toLowerCase().includes(searchFilter.title.toLowerCase());

        const matchLocation =
          !searchFilter.location ||
          job.location?.toLowerCase().includes(searchFilter.location.toLowerCase());

        const matchCategory =
          selectedCategory.length === 0 ||
          selectedCategory.includes(job.category);

        const matchLocFilter =
          selectedLocation.length === 0 ||
          selectedLocation.includes(job.location);

        return matchTitle && matchLocation && matchCategory && matchLocFilter;
      })
      .reverse();
  }, [
    jobs,
    searchFilter.title,
    searchFilter.location,
    selectedCategory,
    selectedLocation,
  ]);

  // ==============================
  // PAGINATION
  // ==============================
  const jobsPerPage = 6;
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const currentJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  // ==============================
  // HANDLERS
  // ==============================
  const clearAllFilters = () => {
    setSelectedCategory([]);
    setSelectedLocation([]);
    setSearchFilter({ title: "", location: "" });
    setCurrentPage(1);
  };

  // ==============================
  // UI
  // ==============================
  return (
    <div className="container mx-auto py-8 px-4 lg:px-8">

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search jobs..."
        value={searchFilter.title}
        onChange={(e) =>
          setSearchFilter({ ...searchFilter, title: e.target.value })
        }
        className="w-full px-4 py-3 border rounded-lg mb-6"
      />

      {/* LOADING */}
      {loading ? (
        <p className="text-center">Loading jobs...</p>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-10">
          <p>No jobs found</p>
          <button
            onClick={clearAllFilters}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* JOB GRID */}
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {currentJobs.map((job) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <JobCard job={job} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* PAGINATION */}
          <div className="flex justify-center mt-8 gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default JobListing;