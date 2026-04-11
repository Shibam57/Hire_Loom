import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyApplications,
  withdrawApplication,
  clearApplicationState,
} from "../redux/applicationSlice";

const Applications = () => {
  const dispatch = useDispatch();

  const { applications, loading, error, successMessage } = useSelector(
    (state) => state.applications
  );

  useEffect(() => {
    dispatch(getMyApplications());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch(clearApplicationState());
      }, 2000);
    }
  }, [successMessage, dispatch]);

  const handleWithdraw = (id) => {
    dispatch(withdrawApplication(id));
  };

  if (loading) return <p>Loading applications...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Applications</h2>

      {applications.length === 0 ? (
        <p>You haven't applied to any jobs yet.</p>
      ) : (
        applications.map((app) => (
          <div
            key={app._id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "10px",
              borderRadius: "8px",
            }}
          >
            <h3>{app.job?.title}</h3>
            <p><strong>Company:</strong> {app.job?.company?.name}</p>
            <p><strong>Location:</strong> {app.job?.location}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color:
                    app.status === "accepted"
                      ? "green"
                      : app.status === "rejected"
                      ? "red"
                      : "orange",
                }}
              >
                {app.status}
              </span>
            </p>

            <button
              onClick={() => handleWithdraw(app._id)}
              style={{
                marginTop: "10px",
                background: "red",
                color: "white",
                padding: "8px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Withdraw
            </button>
          </div>
        ))
      )}

      {successMessage && (
        <p style={{ color: "green" }}>{successMessage}</p>
      )}
    </div>
  );
};

export default Applications;