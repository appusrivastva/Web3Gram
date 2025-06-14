import { useBlockchain } from "../hooks/BlockchainContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const FollowUsers = () => {
  const { account, contract } = useBlockchain();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingStatus, setFollowingStatus] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      if (!contract || !account) return;

      try {
        const addresses = await contract.getAllRegisteredUsers();
        const filtered = addresses.filter(
          (addr) => addr.toLowerCase() !== account.toLowerCase()
        );

        const userData = await Promise.all(
          filtered.map(async (addr) => {
            const u = await contract.getUserProfile(addr);
            const isFollowing = await contract.isFollowing(account, addr);
            return {
              address: addr,
              username: u[1],
              bio: u[2],
              isFollowing,
            };
          })
        );

        const statusMap = {};
        userData.forEach((u) => {
          statusMap[u.address] = u.isFollowing;
        });

        setFollowingStatus(statusMap);
        setUsers(userData);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [contract, account]);

  const handleFollowToggle = async (userAddress) => {
    if (!contract) return;

    try {
      const currentlyFollowing = followingStatus[userAddress];
      const tx = currentlyFollowing
        ? await contract.unfollow(userAddress)
        : await contract.follow(userAddress);
      await tx.wait();

      setFollowingStatus((prev) => ({
        ...prev,
        [userAddress]: !currentlyFollowing,
      }));
    } catch (err) {
      console.error("Toggle follow failed", err);
    }
  };

  if (loading) {
    return <p className="text-center mt-12 text-gray-600 text-lg">Loading users...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">People You May Know</h2>
      <div className="grid sm:grid-cols-2 gap-6">
        {users.map((user, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 shadow-md rounded-2xl p-5 flex flex-col justify-between hover:shadow-xl transition-shadow"
          >
     
            <div className="mb-4">
  <h3 className="text-xl font-semibold text-gray-800 mb-1 hover:underline">
    <Link to={`/profile/${user.address}`}>{user.username}</Link>
  </h3>
  <p className="text-gray-600 text-sm">{user.bio}</p>
  <p className="text-gray-400 text-xs mt-2">
    {user.address.slice(0, 6)}...{user.address.slice(-4)}
  </p>
</div>

            <button
              onClick={() => handleFollowToggle(user.address)}
              className={`px-4 py-2 rounded-xl font-medium transition text-white ${
                followingStatus[user.address]
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {followingStatus[user.address] ? "Unfollow" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowUsers;
