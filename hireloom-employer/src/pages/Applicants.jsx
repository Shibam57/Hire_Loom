import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getEmployerApplications } from "../redux/applicationSlice";
import ApplicationCard from "../components/ApplicationCard";

const Applications = () => {
  const dispatch = useDispatch();

  const { applications } = useSelector((state) => state.applications);

  useEffect(() => {
    dispatch(getEmployerApplications());
  }, [dispatch]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Applicants</h2>

      {applications.length === 0 ? (
        <p>No applications yet</p>
      ) : (
        applications.map((app) => (
          <ApplicationCard key={app._id} app={app} />
        ))
      )}
    </div>
  );
};

export default Applications;