// src/context/BlockchainContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { SOCIAL_MEDIA_ABI, SOCIAL_MEDIA_ADDRESS } from '../constants/contract';
// context create

const BlockchainContext = createContext();

export const BlockchainProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [connect,setConnect]=useState(false)

  const connectWallet = async () => {
    if (window.ethereum) {
      const prov = new ethers.BrowserProvider(window.ethereum);
      await prov.send("eth_requestAccounts", []);
      const signer = await prov.getSigner();
      const address = await signer.getAddress();
      const contractInstance = new ethers.Contract(
        SOCIAL_MEDIA_ADDRESS,
        SOCIAL_MEDIA_ABI,
        signer
      );

      setProvider(prov);
      setSigner(signer);
      setAccount(address);
      console.log(address)
      setContract(contractInstance);
      setConnect(true)
    }
  };


  const disconnectWallet=async()=>{
    setAccount("")
    setSigner(null)
    setConnect(false)
  }

  // useEffect(() => {
  //   connectWallet();
  // }, []);

  return (
    <BlockchainContext.Provider
      value={{ provider, signer, contract, account, connectWallet,disconnectWallet,connect}}
    >
      {children}
    </BlockchainContext.Provider>
  );
};


export const useBlockchain = () => useContext(BlockchainContext);


