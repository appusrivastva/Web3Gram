import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useBlockchain } from "../hooks/BlockchainContext";
import LikesListModal from "./LikeListModel";
import CommentListModel from "./CommentListModel";

const ProfilePage = () => {
  const { contract, account } = useBlockchain();
  const { address } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState({});
  const [commentInput, setCommentInput] = useState({});
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [modalPostInfo, setModalPostInfo] = useState({ owner: "", postId: "" });
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [showPicPopup, setShowPicPopup] = useState(false);
  const [popupImgSrc, setPopupImgSrc] = useState("");

  useEffect(() => {
    const fetchUserProfileAndPosts = async () => {
      if (!contract) return;
      const userAddress = address || account;
      setLoading(true);
      try {
        const user = await contract.getUserProfile(userAddress);
        const profileData = {
          address: user[0],
          username: user[1],
          bio: user[2],
          profileURI: user[3],
          follower: user[4].toString(),
          following: user[5].toString(),
          totalPost: user[6].toString(),
          isRegister: user[7],
        };
        setProfile(profileData);

        const userPosts = await contract.getUserPosts(userAddress);
        const postsFormatted = userPosts.map(p => ({
          postId: p.postId.toString(),
          content: p.content,
          mediaURI: p.mediaURI,
          likesCount: p.likesCount.toString(),
          commentsCount: p.commentsCount.toString(),
          owner: userAddress,
          profileURI: profileData.profileURI,
        }));

        const likeStatuses = await Promise.all(
          postsFormatted.map(p => contract.didUserLike(account, userAddress, p.postId))
        );

        const likedMap = {};
        postsFormatted.forEach((p, i) => {
          likedMap[`${p.owner}-${p.postId}`] = likeStatuses[i];
        });

        setPosts(postsFormatted);
        setLikedPosts(likedMap);
      } catch (err) {
        console.error("Error loading profile or posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfileAndPosts();
  }, [contract, account, address]);

  const handleLike = async (postId, owner) => {
    if (!contract) return;
    try {
      const tx = await contract.likePost(owner, postId);
      await tx.wait();
      setLikedPosts(prev => ({ ...prev, [`${owner}-${postId}`]: true }));
      setPosts(prev =>
        prev.map(p => p.postId === postId && p.owner === owner
          ? { ...p, likesCount: (parseInt(p.likesCount) + 1).toString() }
          : p)
      );
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  const handleUnLike = async (postId, owner) => {
    if (!contract) return;
    try {
      const tx = await contract.unlikePost(owner, postId);
      await tx.wait();
      setLikedPosts(prev => ({ ...prev, [`${owner}-${postId}`]: false }));
      setPosts(prev =>
        prev.map(p => p.postId === postId && p.owner === owner
          ? { ...p, likesCount: (parseInt(p.likesCount) - 1).toString() }
          : p)
      );
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
      setCommentInput(prev => ({ ...prev, [postId]: "" }));
      setPosts(prev =>
        prev.map(p => p.postId === postId && p.owner === owner
          ? { ...p, commentsCount: (parseInt(p.commentsCount) + 1).toString() }
          : p)
      );
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  const openLikesModal = (owner, postId) => {
    setModalPostInfo({ owner, postId });
    setShowLikesModal(true);
  };
  const closeLikesModal = () => setShowLikesModal(false);
  const openCommentsModal = (owner, postId) => {
    setModalPostInfo({ owner, postId });
    setShowCommentModal(true);
  };
  const closeCommentModal = () => setShowCommentModal(false);

  const loadFollowers = async () => {
    if (!contract || !profile?.address) return;
    const data = await contract.getFollowers(profile.address);
    setFollowersList(data);
    setShowFollowers(true);
  };

  const loadFollowing = async () => {
    if (!contract || !profile?.address) return;
    const data = await contract.getFollowing(profile.address);
    setFollowingList(data);
    setShowFollowing(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-600 text-xl">Loading profile...</p></div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-600 text-xl">Profile not found.</p></div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg mb-8 flex items-center gap-6">
        {profile.profileURI ? (
          <img
            src={profile.profileURI}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => { setPopupImgSrc(profile.profileURI); setShowPicPopup(true); }}
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold text-4xl">
            {profile.address.slice(2, 4).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{profile.username}</h2>
          <p className="text-gray-600">{profile.bio}</p>
          <div className="flex gap-6 mt-2 text-sm text-gray-700">
            <span className="cursor-pointer hover:underline" onClick={loadFollowers}><strong>{profile.follower}</strong> followers</span>
            <span className="cursor-pointer hover:underline" onClick={loadFollowing}><strong>{profile.following}</strong> following</span>
            <span><strong>{profile.totalPost}</strong> posts</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {posts.length === 0 && <p className="text-center text-gray-500">No posts to show.</p>}
        {posts.map(p => {
          const likeKey = `${p.owner}-${p.postId}`;
          return (
            <div key={likeKey} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="text-base text-gray-700 mb-2">{p.content}</div>
              {p.mediaURI && <img src={p.mediaURI} alt="post" className="rounded-lg mb-3 max-h-80 w-full object-cover" />}
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <div>
                  <span className="font-medium cursor-pointer text-pink-600 hover:underline" onClick={() => openLikesModal(p.owner, p.postId)}>Likes:</span> {p.likesCount} | 
                  <span className="font-medium cursor-pointer text-blue-600 hover:underline" onClick={() => openCommentsModal(p.owner, p.postId)}>Comments:</span> {p.commentsCount}
                </div>
                <div className="text-gray-400 font-mono">{p.owner.slice(0, 6)}...{p.owner.slice(-4)}</div>
              </div>
              <div className="flex space-x-2 mt-2">
                {likedPosts[likeKey] ? (
                  <button onClick={() => handleUnLike(p.postId, p.owner)} className="bg-pink-500 text-white px-4 py-1 rounded hover:bg-pink-600">❤️ Liked</button>
                ) : (
                  <button onClick={() => handleLike(p.postId, p.owner)} className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400">👍 Like</button>
                )}
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInput[p.postId] || ""}
                  onChange={(e) => setCommentInput(prev => ({ ...prev, [p.postId]: e.target.value }))}
                  className="flex-1 border rounded px-3 py-1 text-sm"
                />
                <button onClick={() => handleComment(p.postId, p.owner)} className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">💬 Comment</button>
              </div>
            </div>
          );
        })}
      </div>

      {showLikesModal && <LikesListModal postId={modalPostInfo.postId} owner={modalPostInfo.owner} contract={contract} onClose={closeLikesModal} />}
      {showCommentModal && <CommentListModel postId={modalPostInfo.postId} owner={modalPostInfo.owner} contract={contract} onClose={closeCommentModal} />}

      {showPicPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="relative max-w-md w-full p-4">
            <button className="absolute top-2 right-2 text-white text-2xl font-bold" onClick={() => setShowPicPopup(false)}>&times;</button>
            <img src={popupImgSrc} alt="Profile Full" className="rounded-xl max-w-full max-h-[80vh] object-contain shadow-lg border border-white" />
          </div>
        </div>
      )}

      {showFollowers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Followers</h2>
            <ul className="space-y-2">
              {followersList.map((f, idx) => <li key={idx} className="text-gray-700 truncate">{f}</li>)}
            </ul>
            <button onClick={() => setShowFollowers(false)} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Close</button>
          </div>
        </div>
      )}

      {showFollowing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Following</h2>
            <ul className="space-y-2">
              {followingList.map((f, idx) => <li key={idx} className="text-gray-700 truncate">{f}</li>)}
            </ul>
            <button onClick={() => setShowFollowing(false)} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
