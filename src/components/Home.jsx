import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 text-white p-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
          DECENTRALIZED SOCIAL MEDIA
        </h1>
        <p className="text-lg md:text-xl mb-8">
          Own your content. Connect freely. Experience a social network without
          middlemen.
        </p>
        <div className="space-x-4">
          <Link
            to="/register"
            className="px-6 py-2 bg-white text-purple-700 font-semibold rounded-xl hover:bg-gray-100 transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-6 py-2 border border-white font-semibold rounded-xl hover:bg-white hover:text-purple-700 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
