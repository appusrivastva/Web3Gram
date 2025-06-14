import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function CommentListModel({ postId, owner, contract, onClose }) {
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!contract || !postId) return;

    const fetchComments = async () => {
      try {
        const result = await contract.getComments(owner, postId);
        setComments(result);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [contract, owner, postId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200 w-full max-w-lg p-6 relative">
        <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">Comments</h2>

        {loading ? (
          <p className="text-gray-500 text-sm text-center animate-pulse">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">No comments yet.</p>
        ) : (
          <ul className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scroll">
            {comments.map((c, index) => (
              <li key={index} className="bg-pink-50 rounded-md p-3 shadow-sm border border-pink-100">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span className="font-mono">
                    {c.commenter.slice(0, 6)}...{c.commenter.slice(-4)}
                  </span>
                  <span>
                    {formatDistanceToNow(new Date(Number(c.timestamp) * 1000), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{c.content}</p>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
}
