import { Link } from "react-router-dom";
import ApplyButton from "./ApplyButton";

const JobCard = ({ job }) => {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "15px",
        borderRadius: "10px",
        marginBottom: "15px",
      }}
    >
      <h3>{job.title}</h3>
      <p><strong>Company:</strong> {job.company?.name}</p>
      <p><strong>Location:</strong> {job.location}</p>
      <p><strong>Skills:</strong> {job.skills?.join(", ")}</p>

      <div style={{ marginTop: "10px" }}>
        <Link to={`/jobs/${job._id}`}>
          <button>View</button>
        </Link>

        <ApplyButton jobId={job._id} />
      </div>
    </div>
  );
};

export default JobCard;