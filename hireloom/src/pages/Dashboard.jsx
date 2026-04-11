import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getJobs } from "../redux/jobSlice";
import { getMyApplications } from "../redux/applicationSlice";
import JobCard from "../components/JobCard";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { jobs } = useSelector((state) => state.jobs);
  const { applications } = useSelector((state) => state.applications);

  useEffect(() => {
    dispatch(getJobs());
    dispatch(getMyApplications());
  }, [dispatch]);

  return (
    <div style={{ padding: "20px" }}>
      {/* ================= WELCOME ================= */}
      <h2>Welcome, {user?.name} 👋</h2>

      {/* ================= STATS ================= */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={cardStyle}>
          <h3>{applications.length}</h3>
          <p>Applied Jobs</p>
        </div>

        <div style={cardStyle}>
          <h3>{jobs.length}</h3>
          <p>Available Jobs</p>
        </div>
      </div>

      {/* ================= QUICK ACTION ================= */}
      <div style={{ marginTop: "30px" }}>
        <Link to="/jobs">
          <button style={btnStyle}>Browse Jobs</button>
        </Link>

        <Link to="/applications">
          <button style={btnStyle}>My Applications</button>
        </Link>

        <Link to="/profile">
          <button style={btnStyle}>My Profile</button>
        </Link>
      </div>

      {/* ================= RECENT JOBS ================= */}
      <div style={{ marginTop: "40px" }}>
        <h3>Recent Jobs</h3>

        {jobs.slice(0, 5).map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>
    </div>
  );
};

// ================= STYLES =================
const cardStyle = {
  padding: "20px",
  border: "1px solid #ccc",
  borderRadius: "10px",
  width: "150px",
  textAlign: "center",
};

const btnStyle = {
  marginRight: "10px",
  padding: "10px 15px",
  border: "none",
  borderRadius: "5px",
  background: "black",
  color: "white",
  cursor: "pointer",
};

export default Dashboard;