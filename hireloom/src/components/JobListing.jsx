import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getJobs } from "../redux/jobSlice";
import JobCard from "./JobCard";
import { motion, AnimatePresence } from "framer-motion";

const JobListing = () => {
  const dispatch = useDispatch();

  const { jobs = [], loading } = useSelector((state) => state.jobs || {});

  const [currentPage, setCurrentPage] = useState(1);

  const [searchFilter, setSearchFilter] = useState({
    title: "",
    description: "",
    location: "",
  });

  useEffect(() => {
    dispatch(getJobs());
  }, [dispatch]);

  const filteredJobs = useMemo(() => {
    return [...jobs]
      .filter((job) => {
        const matchTitle =
          !searchFilter.title ||
          (job.title || "")
            .toLowerCase()
            .includes(searchFilter.title.toLowerCase());

        const matchLocation =
          !searchFilter.location ||
          (job.location || "")
            .toLowerCase()
            .includes(searchFilter.location.toLowerCase());

        return matchTitle && matchLocation;
      })
      .reverse();
  }, [jobs, searchFilter]);

  // pagination
  const jobsPerPage = 6;

  const currentJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  return (
    <div className="container mx-auto py-8 px-4">

      <input
        type="text"
        placeholder="Search jobs..."
        value={searchFilter.title}
        onChange={(e) =>
          setSearchFilter({ ...searchFilter, title: e.target.value })
        }
        className="w-full px-4 py-3 border rounded-lg mb-6"
      />

      {loading ? (
        <p className="text-center">Loading jobs...</p>
      ) : filteredJobs.length === 0 ? (
        <p className="text-center">No jobs found</p>
      ) : (
        <>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {currentJobs.map((job) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <JobCard job={job} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* pagination */}
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