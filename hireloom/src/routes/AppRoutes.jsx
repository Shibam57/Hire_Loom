import { Routes, Route } from "react-router-dom";

// 🔓 Public Pages
import Home from "../pages/Home";
import Jobs from "../pages/Jobs";
import JobDetails from "../pages/JobDetails";
import Login from "../pages/Login";
import Register from "../pages/Register";

// 🔐 Employee Pages
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Applications from "../pages/Applications";
import ApplyJob from "../pages/ApplyJob";
import EditProfile from "../pages/EditProfile";

// 🛡️ Protected Route
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>

      {/* ================= PUBLIC ROUTES ================= */}
      <Route path="/" element={<Home />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/job/:id" element={<JobDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ================= PROTECTED ROUTES ================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="employee">
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute role="employee">
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/applications"
        element={
          <ProtectedRoute role="employee">
            <Applications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/apply-job/:id"
        element={
          <ProtectedRoute role="employee">
            <ApplyJob />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute role="employee">
            <EditProfile />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
};

export default AppRoutes;