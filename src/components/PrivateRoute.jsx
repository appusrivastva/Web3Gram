import React from "react";
import { Navigate } from "react-router-dom";
import { useBlockchain } from "../hooks/BlockchainContext";

const PrivateRoute = ({ children }) => {
  const { connect } = useBlockchain();
  console.log(connect)

  // If not connected, redirect to home or login
  if (!connect) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
