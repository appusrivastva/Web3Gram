

import React, { useEffect, useState } from "react";
import { useBlockchain } from "../hooks/BlockchainContext";
import LikesListModal from "./LikeListModel";
import CommentListModel from "./CommentListModel";
import { Link } from "react-router-dom";

export default function MyFeed() {
  const { account, contract } = useBlockchain();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [modalPostInfo, setModalPostInfo] = useState({ owner: "", postId: "" });

  useEffect(() => {
    const loadFeed = async () => {
      if (!contract || !account) return;
      try {
        const followedAddresses = await contract.getFollowing(account);
        const allPosts = [];
        const likedMap = {};

        for (const addr of followedAddresses) {
          const userPosts = await contract.getUserPosts(addr);
          for (const p of userPosts) {
            const postId = p.postId.toString();
            allPosts.push({
              postId,
              content: p.content,
              mediaURI: p.mediaURI,
              likesCount: p.likesCount.toString(),
              commentsCount: p.commentsCount.toString(),
              owner: addr,
            });

            const hasLiked = await contract.didUserLike(account, addr, postId);
            likedMap[`${addr}-${postId}`] = hasLiked;
          }
        }

        setPosts(allPosts);
        setLikedPosts(likedMap);
      } catch (err) {
        console.error("Failed to load feed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [contract, account]);

  const handleLike = async (postId, owner) => {
    if (!contract) return;
    try {
      const tx = await contract.likePost(owner, postId);
      await tx.wait();
      setLikedPosts((prev) => ({
        ...prev,
        [`${owner}-${postId}`]: true,
      }));
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  const handleUnLike = async (postId, owner) => {
    if (!contract) return;
    try {
      const tx = await contract.unlikePost(owner, postId);
      await tx.wait();
      setLikedPosts((prev) => ({
        ...prev,
        [`${owner}-${postId}`]: false,
      }));
    } catch (err) {
      console.error("Unlike failed:", err);
    }
  };

  const handleComment = async (postId, owner) => {
    const message = commentInput[postId];
    if (!message || !contract) return;

    try {
      const tx = await contract.addComment(owner, postId, message);
      await tx.wait();
      setCommentInput((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  const openLikesModal = (owner, postId) => {
    setModalPostInfo({ owner, postId });
    setShowLikesModal(true);
  };

  const openCommentsModal = (owner, postId) => {
    setModalPostInfo({ owner, postId });
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

  if (loading) {
    return (
      <div className="text-center mt-20 text-gray-500 text-xl animate-pulse">
        Loading My Feed...
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="text-center mt-20 text-gray-500 text-lg">
        You're not following anyone or no posts available yet.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">My Feed</h2>

        <div className="space-y-6">
          {posts.map((p, i) => {
            const likeKey = `${p.owner}-${p.postId}`;
            return (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl shadow hover:shadow-md border border-gray-100 transition-all duration-300"
              >
                <div className="mb-2 text-lg text-gray-800 font-medium">
                  {p.content}
                </div>

                {p.mediaURI && (
                  <img
                    src={p.mediaURI}
                    alt="post"
                    className="rounded-xl mb-4 max-h-80 w-full object-cover border"
                  />
                )}

                <div className="flex justify-between text-sm text-gray-600 mb-3">
                  <div>
                    <span
                      className="font-semibold text-pink-600 cursor-pointer hover:underline"
                      onClick={() => openLikesModal(p.owner, p.postId)}
                    >
                      Likes
                    </span>
                    : {p.likesCount} |{" "}
                    <span
                      className="font-semibold text-blue-600 cursor-pointer hover:underline"
                      onClick={() => openCommentsModal(p.owner, p.postId)}
                    >
                      Comments
                    </span>
                    : {p.commentsCount}
                  </div>
                  <div className="text-gray-400 text-xs hover:underline font-mono">
                    <Link to={`/profile/${p.owner}`}>
                      {p.owner.slice(0, 6)}...{p.owner.slice(-4)}
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0">
                  {likedPosts[likeKey] ? (
                    <button
                      onClick={() => handleUnLike(p.postId, p.owner)}
                      className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-1 rounded-xl transition"
                    >
                      ❤️ Liked
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLike(p.postId, p.owner)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1 rounded-xl transition"
                    >
                      👍 Like
                    </button>
                  )}

                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentInput[p.postId] || ""}
                    onChange={(e) =>
                      setCommentInput((prev) => ({
                        ...prev,
                        [p.postId]: e.target.value,
                      }))
                    }
                    className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring focus:ring-blue-200 outline-none"
                  />

                  <button
                    onClick={() => handleComment(p.postId, p.owner)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-xl transition"
                  >
                    💬 Comment
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {showLikesModal && (
          <LikesListModal
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
    </div>
  );
}
