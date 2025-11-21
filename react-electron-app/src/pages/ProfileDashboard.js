// src/pages/ProfileDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { downloadReport } from "../api.js";

function ProfileDashboard() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    full_name: "",
    username: "",
    email: "",
    profile_pic: "",
  });

  const [sessionList, setSessionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfileData();
    fetchUserSessions();
  }, []);

  // Fetch User Info (placeholder since your backend doesn't provide details yet)
  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // temporary static data until you add real user endpoint
      setUserData({
        full_name: "Adwait Dharade",
        username: "adwait.ai",
        email: "adwait@example.com",
        profile_pic: "",
      });
    } catch (err) {
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Interview Sessions (from backend)
  const fetchUserSessions = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8000/profile/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch sessions");

      const data = await res.json();
      setSessionList(data || []);
    } catch (err) {
      console.log(err);
      setError("Could not load sessions.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleEditProfile = () => {
    alert("Profile editing functionality coming soon!");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData((prev) => ({ ...prev, profile_pic: URL.createObjectURL(file) }));
    }
  };

  if (loading)
    return (
      <div className="text-white text-center mt-20 text-lg">
        Loading your profile...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-12 px-6">
      <div className="max-w-5xl mx-auto bg-gray-800/70 p-10 rounded-3xl shadow-2xl border border-gray-700 backdrop-blur-xl">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">👤 Profile Dashboard</h2>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full font-semibold"
          >
            Logout
          </button>
        </div>

        {/* PROFILE INFO */}
        <div className="flex flex-col md:flex-row items-center gap-8">
          
          {/* Profile Image */}
          <div className="relative">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-green-500 shadow-md">
              {userData.profile_pic ? (
                <img
                  src={userData.profile_pic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center text-5xl text-gray-300">
                  {userData.full_name ? userData.full_name[0] : "?"}
                </div>
              )}
            </div>

            <label className="absolute bottom-2 right-2 bg-green-600 hover:bg-green-700 p-2 rounded-full cursor-pointer text-white">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              📷
            </label>
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-gray-400 text-sm">Full Name</label>
              <p className="text-xl font-bold">{userData.full_name}</p>
            </div>

            <div>
              <label className="text-gray-400 text-sm">Username</label>
              <p className="text-xl font-bold">{userData.username}</p>
            </div>

            <div>
              <label className="text-gray-400 text-sm">Email</label>
              <p className="text-xl font-bold">{userData.email}</p>
            </div>

            <button
              onClick={handleEditProfile}
              className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-full mt-4"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-10"></div>

        {/* SESSION LIST */}
        <h3 className="text-2xl font-semibold mb-6 text-green-400">
          📁 Your Interview Sessions
        </h3>

        {sessionList.length === 0 ? (
          <div className="text-gray-400 text-center">
            No interview sessions available.
          </div>
        ) : (
          <div className="space-y-4">
            {sessionList.map((session) => (
              <div
                key={session.id}
                className="bg-gray-900/60 p-5 rounded-xl border border-gray-700 shadow-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-lg">
                    {session.job_role} @ {session.company_name}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Session ID: {session.id}
                  </p>
                </div>

                <button
                  onClick={() => downloadReport(session.id)}
                  className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-full text-white"
                >
                  Download PDF Report
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <p className="text-center mt-6 text-red-500 font-semibold">⚠️ {error}</p>
      )}
    </div>
  );
}

export default ProfileDashboard;
