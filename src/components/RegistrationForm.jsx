import React, { useState } from "react";
import { useBlockchain } from "../hooks/BlockchainContext";
import { useNavigate, Link } from "react-router-dom";

function RegistrationForm() {
  const { account, contract } = useBlockchain();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: "", bio: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (username, bio) => {
    if (!contract || !account) return;
    try {
      const tx = await contract.register(bio, username);
      await tx.wait();
      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      console.error("Registration failed:", err);
      alert("Registration failed. See console for details.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { username, bio } = formData;
    handleRegister(username, bio);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-600 via-blue-500 to-pink-500">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Account
        </h2>

        <p className="text-center text-sm text-gray-500 mb-4">
          {account ? (
            <>
              Wallet:{" "}
              <span className="font-mono text-gray-800">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </>
          ) : (
            "Wallet not connected"
          )}
        </p>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Username
          </label>
          <input
            type="text"
            name="username"
            placeholder="e.g. blockhunter"
            className="w-full px-4 py-2 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Bio
          </label>
          <input
            type="text"
            name="bio"
            placeholder="Write something cool..."
            className="w-full px-4 py-2 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-xl hover:bg-blue-700 transition"
        >
          Register
        </button>

        <p className="mt-4 text-center text-sm text-gray-700">
          Already registered?{" "}
          <Link to="/login" className="text-blue-600 font-medium underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}

export default RegistrationForm;
