import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegistering) {
        // ✅ REGISTER first
        const registerRes = await fetch("http://localhost:8000/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            full_name: fullName,
            username,
          }),
        });

        if (!registerRes.ok) {
          const data = await registerRes.json();
          throw new Error(data.detail || "Registration failed");
        }
      }

      // ✅ LOGIN with form-encoded body (OAuth2PasswordRequestForm)
      const loginRes = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (!loginRes.ok) {
        const data = await loginRes.json();
        throw new Error(data.detail || "Invalid credentials");
      }

      const result = await loginRes.json();
      localStorage.setItem("token", result.access_token);

      alert("✅ Login successful!");
      navigate("/recorder");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <div className="bg-gray-800/70 p-10 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-lg border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-emerald-400">
          {isRegistering ? "Create Account" : "Sign In to VirtuHire"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegistering && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-600 focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-600 focus:ring-2 focus:ring-emerald-500"
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-600 focus:ring-2 focus:ring-emerald-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-600 focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 py-2 rounded-lg font-semibold transition-all"
          >
            {isRegistering ? "Register" : "Login"}
          </button>
        </form>

        {error && (
          <p className="text-red-400 text-center mt-4 text-sm font-medium">{error}</p>
        )}

        <p
          className="text-gray-400 text-center mt-6 cursor-pointer hover:text-emerald-400"
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </p>
      </div>
    </div>
  );
}

export default Login;
