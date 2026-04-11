import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 20px",
        background: "#222",
        color: "#fff",
      }}
    >
      <h2>JobPortal</h2>

      <div>
        <Link to="/jobs" style={{ color: "#fff", marginRight: "15px" }}>
          Jobs
        </Link>

        <Link to="/applications" style={{ color: "#fff", marginRight: "15px" }}>
          Applications
        </Link>

        <Link to="/profile" style={{ color: "#fff", marginRight: "15px" }}>
          Profile
        </Link>

        {user ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login" style={{ color: "#fff" }}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;