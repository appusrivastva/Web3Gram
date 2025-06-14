import React, { useState, useEffect } from "react";
import { useBlockchain } from "../hooks/BlockchainContext";
import LikeListModel from "../components/LikeListModel";
import CommentListModel from "../components/CommentListModel";

export default function Post({ post, postOwner, onDelete }) {
  const { contract, account } = useBlockchain();
  const ipfsImage = post.mediaURI;
  const [menuOpen, setMenuOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComment, setLoadingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [modalPostInfo, setModalPostInfo] = useState({ owner: "", postId: "" });

  useEffect(() => {
    fetchComments();
    fetchLikedStatus();
  }, [contract, postOwner, post.postId, account]);

  const fetchLikedStatus = async () => {
    if (!contract || !account) return;
    try {
      const isLiked = await contract.didUserLike(account, postOwner, post.postId);
      setLiked(isLiked);
    } catch (err) {
      console.error("Error fetching liked status", err);
    }
  };

  const fetchComments = async () => {
    if (!contract) return;
    try {
      const fetched = await contract.getComments(postOwner, post.postId);
      setComments(fetched);
    } catch (err) {
      console.error("Error loading comments", err);
    }
  };

  const handleDelete = () => {
    setMenuOpen(false);
    onDelete(post.postId.toString());
  };

  const handleLike = async () => {
    if (!contract) return;
    try {
      setLoadingLike(true);
      const tx = await contract.likePost(postOwner, post.postId);
      await tx.wait();
      setLiked(true);
    } catch (err) {
      console.error("Like failed", err);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleUnLike = async () => {
    if (!contract) return;
    try {
      setLoadingLike(true);
      const tx = await contract.unlikePost(postOwner, post.postId);
      await tx.wait();
      setLiked(false);
    } catch (err) {
      console.error("Unlike failed", err);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleComment = async () => {
    if (!comment.trim() || !contract) return;
    try {
      setLoadingComment(true);
      const tx = await contract.addComment(postOwner, post.postId, comment);
      await tx.wait();
      setComment("");
      fetchComments();
    } catch (err) {
      console.error("Comment failed", err);
    } finally {
      setLoadingComment(false);
    }
  };

  const openLikesModal = () => {
    setModalPostInfo({ owner: postOwner, postId: post.postId });
    setShowLikesModal(true);
  };

  const openCommentsModal = () => {
    setModalPostInfo({ owner: postOwner, postId: post.postId });
    setShowCommentModal(true);
  };

  const closeLikesModal = () => {
    setShowLikesModal(false);
    setModalPostInfo({ owner: "", postId: "" });
  };

  const closeCommentModal = () => {
    setShowCommentModal(false);
    setModalPostInfo({ owner: "", postId: "" });
  };

  return (
    <div
      className="relative border rounded-lg p-5 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-md
                 transition-transform duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 w-full max-w-md mx-auto cursor-pointer"
    >
      {/* Menu */}
      <div className="absolute top-3 right-3">
        <button
          className="text-gray-600 hover:text-black text-xl"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open menu"
        >
          &#8942;
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-28 bg-white border rounded shadow z-20">
            <button
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              onClick={handleDelete}
            >
              Delete Post
            </button>
          </div>
        )}
      </div>

      {/* Post content */}
      <p className="mb-4 text-gray-800 text-base">{post.content}</p>
      {ipfsImage && (
        <img
          src={ipfsImage}
          alt="Post"
          className="w-full max-h-80 object-cover rounded mb-4 shadow-sm"
        />
      )}

      {/* Like/Comment counts */}
      <div className="flex justify-between text-sm text-gray-600 mb-3">
        <div>
          <span
            className="font-semibold cursor-pointer text-pink-600 hover:underline"
            onClick={openLikesModal}
          >
            Likes:
          </span>{" "}
          {post.likesCount} |{" "}
          <span
            className="font-semibold cursor-pointer text-blue-600 hover:underline"
            onClick={openCommentsModal}
          >
            Comments:
          </span>{" "}
          {post.commentsCount}
        </div>
        <div className="text-gray-400 font-mono select-text">
          {postOwner.slice(0, 6)}...{postOwner.slice(-4)}
        </div>
      </div>

      {/* Like & Comment buttons */}
      <div className="mt-3 flex gap-4">
        {liked ? (
          <button
            onClick={handleUnLike}
            disabled={loadingLike}
            className="bg-pink-500 text-white px-5 py-2 rounded shadow hover:bg-pink-600 hover:shadow-lg
                       transition-colors duration-300 disabled:opacity-50"
          >
            ❤️ Liked
          </button>
        ) : (
          <button
            onClick={handleLike}
            disabled={loadingLike}
            className="bg-blue-500 text-white px-5 py-2 rounded shadow hover:bg-blue-600 hover:shadow-lg
                       transition-colors duration-300 disabled:opacity-50"
          >
            👍 Like
          </button>
        )}

        <button
          onClick={fetchComments}
          className="text-blue-600 font-semibold hover:underline hover:text-blue-800 transition-colors duration-300"
        >
          💬 Load Comments
        </button>
      </div>

      {/* Add Comment */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <button
          onClick={handleComment}
          disabled={loadingComment}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 hover:shadow-lg
                     transition-colors duration-300 disabled:opacity-50"
        >
          {loadingComment ? "Posting..." : "Send"}
        </button>
      </div>

      {/* Comment list */}
      <ul className="mt-4 space-y-3 text-sm max-h-48 overflow-y-auto">
        {comments.length === 0 && (
          <li className="text-gray-500 italic">No comments yet</li>
        )}
        {comments.map((c, idx) => (
          <li
            key={idx}
            className="border rounded p-3 bg-gray-50 shadow-sm hover:bg-gray-100 transition"
          >
            <span className="font-semibold">{c.commenter.slice(0, 6)}:</span>{" "}
            {c.message}
          </li>
        ))}
      </ul>

      {/* Modals */}
      {showLikesModal && (
        <LikeListModel
          postId={modalPostInfo.postId}
          owner={modalPostInfo.owner}
          contract={contract}
          onClose={closeLikesModal}
        />
      )}
      {showCommentModal && (
        <CommentListModel
          postId={modalPostInfo.postId}
          owner={modalPostInfo.owner}
          contract={contract}
          onClose={closeCommentModal}
        />
      )}
    </div>
  );
}
