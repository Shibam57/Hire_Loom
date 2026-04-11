import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getJobs } from "../redux/jobSlice";
import { Link } from "react-router-dom";
import JobCard from "../components/JobCard";

const Jobs = () => {
  const dispatch = useDispatch();

  const { jobs, loading, error } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(getJobs());
  }, [dispatch]);

  if (loading) return <p>Loading jobs...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Available Jobs</h2>

      {jobs.length === 0 ? (
        <p>No jobs found</p>
      ) : (
        // jobs.map((job) => (
        //   <div
        //     key={job._id}
        //     style={{
        //       border: "1px solid #ccc",
        //       padding: "15px",
        //       marginBottom: "10px",
        //       borderRadius: "8px",
        //     }}
        //   >
        //     <h3>{job.title}</h3>
        //     <p>{job.company?.name}</p>
        //     <p>{job.location}</p>

        //     <Link to={`/jobs/${job._id}`}>
        //       <button>View Details</button>
        //     </Link>
        //   </div>
        // ))

        jobs.map((job) => (
            <div>{job.title}</div>>
            <JobCard key={job._id} job={job} />
        ))
      )}
    </div>
  );
};

export default Jobs;