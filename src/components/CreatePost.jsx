import { useState } from "react";
import { useBlockchain } from "../hooks/BlockchainContext";
import { useNavigate } from "react-router-dom";

export default function CreatePost({ onPostCreated }) {
  const { contract } = useBlockchain();
  const [content, setContent] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!contract) {
      setError("Smart contract not connected.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const fullURI = ipfsHash
        ? `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
        : "";

      const tx = await contract.createPost(content, fullURI);
      await tx.wait();
      setContent("");
      setIpfsHash("");
      onPostCreated && onPostCreated();
    } catch (err) {
      setError(err.message || "Post failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handlePost}
      className="bg-gradient-to-tr from-white to-indigo-50 p-8 rounded-2xl shadow-lg max-w-xl mx-auto my-8 border border-indigo-200"
    >
      <h2 className="text-2xl font-extrabold mb-6 text-indigo-900 tracking-wide">
        Create a Post
      </h2>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening?"
        maxLength={280}
        required
        rows={5}
        className="w-full rounded-xl border border-indigo-300 p-4 mb-5 text-indigo-900 placeholder-indigo-400 shadow-sm
          focus:outline-none focus:ring-4 focus:ring-indigo-400 transition resize-none"
      />

      <input
        type="text"
        value={ipfsHash}
        onChange={(e) => setIpfsHash(e.target.value)}
        placeholder="IPFS Image Hash (e.g. Qm...)"
        className="w-full rounded-xl border border-indigo-300 p-3 mb-5 text-indigo-900 placeholder-indigo-400 shadow-sm
          focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
      />

      {error && (
        <p className="text-red-600 mb-4 text-center font-semibold">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md
          hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 transition disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
