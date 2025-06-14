import "./App.css";
import Navbar from "./components/Navbar";
import { BlockchainProvider } from "./hooks/BlockchainContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/RegistrationForm";
import Login from "./components/Login";
import UserProfile from "./components/UserProfile";
import CreatePost from "./components/CreatePost";
import PostList from "./components/PostList";
import FollowUsers from "./components/FollowUsers";
import Home from "./components/Home";
import Feed from "./components/Feed";
import PrivateRoute from "./components/PrivateRoute";
import ProfilePage from "./components/ProfilePage";
function App() {
  return (
    <BlockchainProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={         <PrivateRoute>
            <UserProfile />
          </PrivateRoute>} />
          <Route path="/createPost" element={<CreatePost />} />
          <Route path="/allPost" element={<PostList />} />
          <Route path="/explore-users" element={<FollowUsers />} />
          <Route path="/myFeed" element={<Feed />} />
          {/* <Route path="/profile/:address" element={<ProfilePage />} /> */}
          <Route path="/profile/:address" element={<ProfilePage />} />
        </Routes>
      </Router>
    </BlockchainProvider>
  );
}

export default App;
