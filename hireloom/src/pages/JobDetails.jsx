import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getJobById, applyJob } from "../redux/jobSlice";

const JobDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { job, loading, error, successMessage } = useSelector(
    (state) => state.jobs
  );

  useEffect(() => {
    dispatch(getJobById(id));
  }, [dispatch, id]);

  const handleApply = () => {
    dispatch(applyJob({ jobId: id }));
  };

  if (loading) return <p>Loading job...</p>;
  if (error) return <p>{error}</p>;
  if (!job) return <p>No job found</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>{job.title}</h2>
      <p><strong>Company:</strong> {job.company?.name}</p>
      <p><strong>Location:</strong> {job.location}</p>
      <p><strong>Description:</strong> {job.description}</p>
      <p><strong>Skills Required:</strong> {job.skills?.join(", ")}</p>

      <button onClick={handleApply}>Apply Now</button>

      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
};

export default JobDetails;