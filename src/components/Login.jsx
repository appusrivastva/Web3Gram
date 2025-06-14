import { useBlockchain } from "../hooks/BlockchainContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Login = () => {
  const { contract, account } = useBlockchain();
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(null);

  useEffect(() => {
    const checkRegistration = async () => {
      if (!contract || !account) return;
      try {
        const user = await contract.getUserProfile(account);
        setIsRegistered(user.isRegister);
      } catch (err) {
        console.error("Error fetching user:", err);
        setIsRegistered(false);
      }
    };

    checkRegistration();
  }, [contract, account]);

  const handleLogin = () => {
    if (isRegistered) {
      alert("Login successful");
      navigate("/dashboard");
    } else {
      alert("You are not registered. Please register first.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-600 via-blue-500 to-pink-500">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>

        <p className="text-center text-sm text-gray-500 mb-4">
          {account ? (
            <>
              Connected as{" "}
              <span className="font-mono text-gray-800">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </>
          ) : (
            "Wallet not connected"
          )}
        </p>

        <button
          onClick={handleLogin}
          disabled={isRegistered === null}
          className={`w-full py-2 rounded-xl text-white font-semibold transition ${
            isRegistered === null
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isRegistered === null ? "Checking..." : "Login"}
        </button>

        {isRegistered === false && (
          <p className="mt-4 text-center text-sm text-gray-700">
            Not registered?{" "}
            <Link to="/register" className="text-blue-600 font-medium underline">
              Register here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
