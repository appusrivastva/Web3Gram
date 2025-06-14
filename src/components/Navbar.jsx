import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBlockchain } from "../hooks/BlockchainContext";
import { User } from "lucide-react";
const Navbar = () => {
  const { contract, account, connectWallet,connect } = useBlockchain();
  const [callConnect, setCallConnect] = useState(false);
  const [acc, setAcc] = useState();
  const navigate = useNavigate();

  
  const [isRegistered, setIsRegistered] = useState(null); 
  useEffect(() => {
    const checkRegistration = async () => {
      if (!contract || !account) return;

      try {
        // const user = await contract.user_profile(account);
        const user = await contract.getUserProfile(account);

        console.log(user)
        if (user.isRegister) {
          setIsRegistered(true);
      
        } else {
          setIsRegistered(false);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setIsRegistered(false);
      }
    };

    checkRegistration();
  }, [contract, account, navigate]);

  const walletConnect = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
    } else {
      await connectWallet();
      setCallConnect(true);
      setAcc(account);
      navigate("/login");
    }
  };

  const disconnect = () => {
    setCallConnect(false);
    setAcc("");
    navigate("/");
    connect=false
  };




  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        {isRegistered ?   <Link
            to="/dashboard"
            className="flex items-center gap-1 text-white hover:text-yellow-300"
            title="My Profile"
          >
            <User size={20} /> {/* Icon */}
            <span>My Profile</span>
          </Link>:
         <Link to="/" className="text-2xl font-bold tracking-wide hover:text-yellow-300 transition-colors duration-300">
        My Social DApp
      </Link>  
        }  
    
    
   

      <div className="flex items-center gap-4">
        {!callConnect ? (
          <button
            onClick={walletConnect}
            className="bg-white text-indigo-700 font-semibold px-5 py-2 rounded-lg shadow-md hover:bg-yellow-400 hover:text-white transition-colors duration-300"
          >
            Connect Wallet
          </button>
        ) : (
          <>
            <button
              className="bg-yellow-400 text-indigo-900 font-semibold px-5 py-2 rounded-lg shadow-md cursor-default select-none"
              title={account}
            >
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </button>

            <button
              onClick={disconnect}
              className="bg-white text-indigo-700 font-semibold px-5 py-2 rounded-lg shadow-md hover:bg-red-500 hover:text-white transition-colors duration-300"
            >
              Disconnect
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
