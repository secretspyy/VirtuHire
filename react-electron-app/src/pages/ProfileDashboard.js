import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProfileDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    full_name: "",
    username: "",
    email: "",
    profile_pic: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/my-analyses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch profile data");
      const data = await res.json();

      // Set demo user info (you can modify this when backend provides actual user info)
      setUserData({
        full_name: "Adwait Dharade",
        username: "adwait.ai",
        email: "adwait@example.com",
        profile_pic: "",
      });
    } catch (err) {
      setError("Failed to load your data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleEditProfile = () => {
    alert("Profile editing feature coming soon!");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUserData((prev) => ({ ...prev, profile_pic: imageUrl }));
    }
  };

  if (loading)
    return (
      <div className="text-white text-center mt-20 text-lg">Loading your profile...</div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 px-6">
      <div className="max-w-5xl mx-auto rounded-3xl bg-gray-800/70 backdrop-blur-xl p-10 shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">👤 Your Profile Dashboard</h2>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full font-semibold transition"
          >
            Logout
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-green-500 shadow-md">
              {userData.profile_pic ? (
                <img
                  src={userData.profile_pic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400 text-5xl font-bold">
                  {userData.full_name ? userData.full_name[0] : "?"}
                </div>
              )}
            </div>
            <label className="absolute bottom-2 right-2 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              📷
            </label>
          </div>

          {/* Profile Details */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-gray-400 text-sm">Full Name</label>
              <p className="text-xl font-semibold">{userData.full_name || "Not set"}</p>
            </div>

            <div>
              <label className="text-gray-400 text-sm">Username</label>
              <p className="text-xl font-semibold">{userData.username || "Not set"}</p>
            </div>

            <div>
              <label className="text-gray-400 text-sm">Email</label>
              <p className="text-xl font-semibold">{userData.email || "Not set"}</p>
            </div>

            <button
              onClick={handleEditProfile}
              className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-full font-medium transition"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-10"></div>

        {/* Stats Section */}
        <h3 className="text-2xl font-semibold mb-6 text-green-400">
          📈 Your Performance Overview
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-700 shadow-lg">
            <h4 className="text-lg font-semibold text-green-400">Total Interviews</h4>
            <p className="text-4xl font-bold mt-2 text-white">5</p>
          </div>
          <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-700 shadow-lg">
            <h4 className="text-lg font-semibold text-yellow-400">Average Stress Level</h4>
            <p className="text-4xl font-bold mt-2 text-white">Medium</p>
          </div>
          <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-700 shadow-lg">
            <h4 className="text-lg font-semibold text-blue-400">Filler Words Used</h4>
            <p className="text-4xl font-bold mt-2 text-white">8</p>
          </div>
        </div>

        {/* Empty State for Analyses */}
        <div className="mt-12 text-center text-gray-400">
          <p>No interview analyses yet.</p>
          <p className="text-sm mt-2">
            Record your first mock interview from the <span className="text-green-400 font-semibold cursor-pointer" onClick={() => navigate("/recorder")}>Interview Page</span>.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 text-center text-red-500 text-sm font-semibold">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

export default ProfileDashboard;
