import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns"; // For readable timestamps

export default function LikeListModel({ postId, owner, contract, onClose }) {
  const [loading, setLoading] = useState(true);
  const [likers, setLikers] = useState([]);

  useEffect(() => {
    if (!contract || !postId) return;

    const fetchAllLiker = async () => {
      try {
        const result = await contract.getPostLikers(owner, postId);
        setLikers(result);
      } catch (error) {
        console.error("Failed to fetch Likes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllLiker();
  }, [contract, owner, postId]);
  console.log(likers)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Like by:
        </h2>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading Likers...</p>
        ) : likers.length === 0 ? (
          <p className="text-gray-500 text-sm">No Liker yet.</p>
        ) : (
          <ul className="space-y-4 max-h-72 overflow-y-auto pr-2">
            {likers.map((c, index) => (
              <li key={index} className="bg-gray-100 rounded-md p-3">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                  <span className="font-mono">
                    {c.slice(0, 6)}...{c.slice(-4)}
                  </span>
                  {/* <span>
                    {formatDistanceToNow(new Date(Number(c.timestamp) * 1000), {
                      addSuffix: true,
                    })}
                  </span> */}
                </div>
                <p className="text-gray-800 text-sm">{c.content}</p>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
}
