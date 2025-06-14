import React, { useEffect, useState } from "react";
import { useBlockchain } from "../hooks/BlockchainContext";
import PostList from "./PostList";
import { useNavigate } from "react-router-dom";

const IPFS_PREFIX = "https://gateway.pinata.cloud/ipfs/";

const UserProfile = () => {
  const navigate=useNavigate()
  const { account, contract } = useBlockchain();
  const [profile, setProfile] = useState(null);
  const [post, setPost] = useState([]);
  const [showPicPopup, setShowPicPopup] = useState(false);
  const [newPicHash, setNewPicHash] = useState("");
  const [updatingPic, setUpdatingPic] = useState(false);

  // New states for profile pic options and viewing pic
  const [showPicOptions, setShowPicOptions] = useState(false);
  const [showViewPic, setShowViewPic] = useState(false);

  // Followers/following modal states
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  const fetchUserProfile = async () => {
    if (!contract || !account) return;
    try {
      const user = await contract.getUserProfile(account);
      setProfile({
        address: user[0],
        username: user[1],
        bio: user[2],
        profileURI: user[3],
        follower: user[4].toString(),
        following: user[5].toString(),
        totalPost: user[6].toString(),
        isRegister: user[7],
      });
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const fetchUserPosts = async () => {
    if (!contract || !account) return;
    try {
      const posts = await contract.getUserPosts(account);
      setPost(posts);
    } catch (err) {
      console.error("Error loading posts:", err);
    }
  };

  // Fetch followers details
  const fetchFollowersDetails = async () => {
    if (!contract || !profile) return;

    setLoadingFollowers(true);
    try {
      const followersAddresses = await contract.getFollowers(profile.address);

      const followersData = await Promise.all(
        followersAddresses.map(async (addr) => {
          const user = await contract.getUserProfile(addr);
          return {
            address: user[0],
            username: user[1] || addr,
          };
        })
      );

      setFollowersList(followersData);
      setShowFollowersModal(true);
    } catch (err) {
      console.error("Error fetching followers:", err);
    } finally {
      setLoadingFollowers(false);
    }
  };

  // Fetch following details
  const fetchFollowingDetails = async () => {
    if (!contract || !profile) return;

    setLoadingFollowing(true);
    try {
      const followingAddresses = await contract.getFollowing(profile.address);

      const followingData = await Promise.all(
        followingAddresses.map(async (addr) => {
          const user = await contract.getUserProfile(addr);
          return {
            address: user[0],
            username: user[1] || addr,
          };
        })
      );

      setFollowingList(followingData);
      setShowFollowingModal(true);
    } catch (err) {
      console.error("Error fetching following:", err);
    } finally {
      setLoadingFollowing(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, [contract, account]);

  const handleDeletePost = async (postId) => {
    if (!contract || !account) return;
    try {
      const tx = await contract.deletePost(postId);
      await tx.wait();
      fetchUserPosts();
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  };

  const updateProfilePic = async () => {
    if (!contract || !account || !newPicHash.trim()) return;
    try {
      setUpdatingPic(true);
      const fullURI = IPFS_PREFIX + newPicHash.trim();
      const tx = await contract.updateProfileURI(fullURI);
      await tx.wait();
      setShowPicPopup(false);
      setNewPicHash("");
      fetchUserProfile();
    } catch (err) {
      console.error("Error updating profile picture:", err);
    } finally {
      setUpdatingPic(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-700 via-pink-500 to-red-500 animate-gradient-x">
        <p className="text-white text-2xl font-semibold tracking-wide">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 py-12 px-6">
      {/* Profile Header */}
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-800 to-purple-700 rounded-3xl shadow-2xl p-8 flex items-center gap-8 text-white border border-purple-500 hover:shadow-purple-400 transition-shadow duration-500">
        <div
          className="w-28 h-28 rounded-full overflow-hidden cursor-pointer relative group"
          onClick={() => setShowPicOptions(true)}
          title="Click to view or update profile picture"
        >
          {profile.profileURI ? (
            <img
              src={profile.profileURI}
              alt="Profile Pic"
              className="w-full h-full object-cover rounded-full transform group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-pink-500 to-yellow-400 flex items-center justify-center text-6xl font-extrabold rounded-full select-none">
              {profile.username[0].toUpperCase()}
            </div>
          )}
          <div className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m6 0a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-4xl font-extrabold tracking-wide drop-shadow-lg">{profile.username}</h2>
          <p className="mt-2 text-lg text-purple-200 max-w-xl">{profile.bio || "No bio added yet."}</p>

          <div className="flex gap-8 mt-6 text-lg cursor-pointer select-none">
            <span
              className="hover:text-yellow-400 transition-colors duration-300"
              title="Click to view followers"
              onClick={fetchFollowersDetails}
            >
              <strong className="text-2xl">{profile.follower}</strong> followers
            </span>
            <span
              className="hover:text-yellow-400 transition-colors duration-300"
              title="Click to view following"
              onClick={fetchFollowingDetails}
            >
              <strong className="text-2xl">{profile.following}</strong> following
            </span>
            <span>
              <strong className="text-2xl">{profile.totalPost}</strong> posts
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/createPost")}
              className="bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-semibold px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300"
            >
              Create Post
            </button>
            <button
              onClick={() => navigate("/explore-users")}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300"
            >
              Add Friends
            </button>
            <button
              onClick={() => navigate("/myFeed")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300"
            >
              My Feed
            </button>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="max-w-5xl mx-auto mt-10">
        <PostList posts={post} postOwner={account} onDelete={handleDeletePost} />
      </div>

      {/* Modals (same logic as before, with updated styling) */}

      {/* Profile Picture Options Modal */}
      {showPicOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-tr from-purple-700 to-indigo-600 rounded-xl p-6 w-72 shadow-xl text-white">
            <h3 className="text-xl font-bold mb-5 text-center tracking-wide">Profile Picture Options</h3>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  setShowViewPic(true);
                  setShowPicOptions(false);
                }}
                className="px-5 py-3 bg-yellow-400 hover:bg-yellow-300 rounded-lg font-semibold shadow-md transition-colors duration-300"
              >
                View
              </button>
              <button
                onClick={() => {
                  setShowPicPopup(true);
                  setShowPicOptions(false);
                }}
                className="px-5 py-3 bg-green-500 hover:bg-green-400 rounded-lg font-semibold shadow-md transition-colors duration-300"
              >
                Update
              </button>
              <button
                onClick={() => setShowPicOptions(false)}
                className="px-5 py-3 bg-gray-300 hover:bg-gray-400 rounded-lg font-semibold text-gray-700 transition-colors duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Profile Picture Modal */}
      {showViewPic && profile.profileURI && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-purple-800 to-indigo-900 rounded-lg p-4 max-w-xl max-h-[80vh] overflow-auto shadow-xl">
            <img
              src={profile.profileURI}
              alt="Profile Full View"
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg"
            />
            <button
              onClick={() => setShowViewPic(false)}
              className="absolute top-3 right-3 px-4 py-2 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold shadow-md transition-colors duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Update Profile Picture Modal */}
      {showPicPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-tr from-green-600 to-green-500 rounded-lg p-6 w-80 max-w-full shadow-xl text-white">
            <h3 className="text-lg font-bold mb-4 text-center tracking-wide">Update Profile Picture</h3>
            <p className="mb-3 text-sm text-green-200 text-center">
              Enter your IPFS hash (without prefix). Example: <code className="bg-green-700 px-1 rounded">QmXyz123...</code>
            </p>
            <input
              type="text"
              className="w-full rounded px-4 py-3 mb-5 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="IPFS hash"
              value={newPicHash}
              onChange={(e) => setNewPicHash(e.target.value)}
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowPicPopup(false)}
                className="px-5 py-2 rounded bg-green-300 text-green-900 font-semibold hover:bg-green-400 transition-colors duration-300 disabled:opacity-50"
                disabled={updatingPic}
              >
                Cancel
              </button>
              <button
                onClick={updateProfilePic}
                className="px-5 py-2 rounded bg-green-700 hover:bg-green-800 font-semibold text-white transition-colors duration-300 disabled:opacity-50"
                disabled={updatingPic || !newPicHash.trim()}
              >
                {updatingPic ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-purple-800 to-indigo-700 rounded-lg p-6 w-80 max-w-full max-h-[70vh] overflow-y-auto shadow-lg text-white">
            <h3 className="text-xl font-bold mb-5 text-center tracking-wide">Followers</h3>

            {loadingFollowers ? (
              <p className="text-center">Loading followers...</p>
            ) : followersList.length === 0 ? (
              <p className="text-center">No followers found.</p>
            ) : (
              <ul className="space-y-3">
                {followersList.map((follower, idx) => (
                  <li
                    key={idx}
                    className="border-b border-purple-500 pb-3 hover:bg-purple-600 rounded-md p-2 transition-colors duration-300"
                  >
                    <p className="font-semibold">{follower.username || "Unknown"}</p>
                    <p className="text-xs text-purple-300 truncate">{follower.address}</p>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowFollowersModal(false)}
                className="px-6 py-2 rounded bg-purple-600 hover:bg-purple-700 font-semibold transition-colors duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-lg p-6 w-80 max-w-full max-h-[70vh] overflow-y-auto shadow-lg text-white">
            <h3 className="text-xl font-bold mb-5 text-center tracking-wide">Following</h3>

            {loadingFollowing ? (
              <p className="text-center">Loading following...</p>
            ) : followingList.length === 0 ? (
              <p className="text-center">Not following anyone yet.</p>
            ) : (
              <ul className="space-y-3">
                {followingList.map((user, idx) => (
                  <li
                    key={idx}
                    className="border-b border-indigo-500 pb-3 hover:bg-indigo-600 rounded-md p-2 transition-colors duration-300"
                  >
                    <p className="font-semibold">{user.username || "Unknown"}</p>
                    <p className="text-xs text-indigo-300 truncate">{user.address}</p>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowFollowingModal(false)}
                className="px-6 py-2 rounded bg-indigo-600 hover:bg-indigo-700 font-semibold transition-colors duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Gradient animation for background */
        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default UserProfile;
