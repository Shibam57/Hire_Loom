import { useDispatch, useSelector } from "react-redux";
import { applyJob } from "../redux/applicationSlice";
import { useNavigate } from "react-router-dom";

const ApplyButton = ({ jobId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const handleApply = () => {
    // 🔒 If not logged in → redirect
    if (!user) {
      alert("Please login first");
      return navigate("/login");
    }

    dispatch(applyJob({ jobId }));
  };

  return (
    <button
      onClick={handleApply}
      style={{
        marginLeft: "10px",
        background: "green",
        color: "white",
        padding: "5px 10px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Apply
    </button>
  );
};

export default ApplyButton;