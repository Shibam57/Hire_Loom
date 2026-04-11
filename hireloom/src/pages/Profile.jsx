import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getProfile,
  updateProfile,
  addSkills,
  clearAuthState,
} from "../redux/authSlice";

const Profile = () => {
  const dispatch = useDispatch();

  const { user, loading, error, successMessage } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
  });

  const [skillInput, setSkillInput] = useState("");

  // ==============================
  // FETCH PROFILE
  // ==============================
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  // ==============================
  // SET FORM DATA
  // ==============================
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  // ==============================
  // HANDLE CHANGE
  // ==============================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ==============================
  // UPDATE PROFILE
  // ==============================
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile(formData));
  };

  // ==============================
  // ADD SKILLS
  // ==============================
  const handleAddSkill = () => {
    if (!skillInput.trim()) return;

    dispatch(addSkills([skillInput]));
    setSkillInput("");
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Profile</h2>

      {/* ================= Avatar ================= */}
      {user?.avatar && (
        <img
          src={user.avatar}
          alt="avatar"
          width="100"
          style={{ borderRadius: "50%" }}
        />
      )}

      {/* ================= FORM ================= */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Email</label>
          <input type="email" value={formData.email} disabled />
        </div>

        <div>
          <label>Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Update Profile</button>
      </form>

      {/* ================= SKILLS ================= */}
      <div style={{ marginTop: "20px" }}>
        <h3>Skills</h3>

        <input
          type="text"
          placeholder="Add skill"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
        />
        <button onClick={handleAddSkill}>Add</button>

        <ul>
          {user?.skills?.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
      </div>

      {/* ================= SUCCESS ================= */}
      {successMessage && (
        <p style={{ color: "green" }}>{successMessage}</p>
      )}
    </div>
  );
};

export default Profile;