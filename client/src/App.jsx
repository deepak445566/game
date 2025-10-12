// In your App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import Login from './components/Login';
import Header from './components/Header';
import Home from './components/Home';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import ProfilePage from './components/ProfilePage';
import FollowersList from './components/FollowersList';
import FollowingList from './components/FollowingList';
import Network from './components/Network';
import CreatePost from './components/CreatePost';
import MyPosts from './components/MyPosts';

function App() {
  const { user, showLogin, loading } = useAppContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} /> {/* ✅ YEH LINE ADD KARO */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<ProfilePage/>} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/profile/followers/:userId" element={<FollowersList />} />
          <Route path="/profile/following/:userId" element={<FollowingList />} />
          <Route path="/network" element={<Network />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/my-posts" element={<MyPosts />} />
        </Routes>

        {showLogin && <Login />}
      </div>
    </Router>
  );
}

export default App;