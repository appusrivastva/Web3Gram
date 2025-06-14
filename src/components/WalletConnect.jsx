// import { useState, useEffect } from 'react';
// import { ethers } from 'ethers';

// const WalletConnect = () => {
//   const [account, setAccount] = useState(null);

//   const connectWallet = async () => {
//     if (window.ethereum) {
//       try {
//         const provider = new ethers.BrowserProvider(window.ethereum);
//         const accounts = await provider.send('eth_requestAccounts', []);
//         setAccount(accounts[0]);
//       } catch (error) {
//         console.error('User rejected the request:', error);
//       }
//     } else {
//       alert('Please install MetaMask to connect your wallet.');
//     }
//   };

//   useEffect(() => {
//     if (window.ethereum) {
//       window.ethereum.on('accountsChanged', (accounts) => {
//         setAccount(accounts[0] || null);
//       });
//     }
//   }, []);

//   return (
//     <div className="flex justify-center items-center h-16 bg-gray-900 text-white">
//       {account ? (
//         <div className="px-4 py-2 bg-green-600 rounded-xl">
//           Connected: {account.slice(0, 6)}...{account.slice(-4)}
//         </div>
//       ) : (
//         <button
//           onClick={connectWallet}
//           className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl"
//         >
//           Connect Wallet
//         </button>
//       )}
//     </div>
//   );
// };

// export default WalletConnect;
