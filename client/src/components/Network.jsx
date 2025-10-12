import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Users, Search, UserPlus, UserCheck, Mail, MapPin } from 'lucide-react';
import api from '../config/axios';

function Network() {
  const { user, axios } = useAppContext();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [followLoading, setFollowLoading] = useState({});

  useEffect(() => {
    if (user) {
      fetchAllUsers();
    }
  }, [user]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/user/getAllUserProfile');
      // Filter out current user from the list
      const otherUsers = data.profiles?.filter(profile => 
        profile.userId?._id !== user._id
      ) || [];
      setUsers(otherUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId) => {
    if (!user) return;

    try {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: true }));
      
      await api.post('/api/user/follow', { 
        followingId: targetUserId 
      });
      
      // Update the local state to reflect the follow
      setUsers(prev => 
        prev.map(user => 
          user.userId?._id === targetUserId 
            ? { ...user, isFollowing: true }
            : user
        )
      );
      
    } catch (error) {
      console.error("Error following user:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to follow user. Please try again.');
      }
    } finally {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleUnfollow = async (targetUserId) => {
    try {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: true }));
      
      await api.post('/api/user/unfollow', { followingId: targetUserId });
      
      // Update the local state to reflect the unfollow
      setUsers(prev => 
        prev.map(user => 
          user.userId?._id === targetUserId 
            ? { ...user, isFollowing: false }
            : user
        )
      );
      
    } catch (error) {
      console.error("Error unfollowing user:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to unfollow user');
      }
    } finally {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const userName = user.userId?.name || '';
    const userUsername = user.userId?.username || '';
    const searchLower = searchTerm.toLowerCase();
    
    return (
      userName.toLowerCase().includes(searchLower) ||
      userUsername.toLowerCase().includes(searchLower)
    );
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Join the Network
          </h2>
          <p className="text-gray-600 mb-6">
            Sign in to explore and connect with other professionals
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="text-purple-600" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Network</h1>
                <p className="text-gray-600">Connect with professionals</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-red-600" size={24} />
            </div>
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button 
              onClick={fetchAllUsers}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No users found matching your search' : 'No users found'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm ? 'Try adjusting your search terms' : 'There are no other users in the network yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((userProfile) => {
              const userData = userProfile.userId || userProfile;
              return (
                <div key={userData._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div 
                      onClick={() => navigate(`/profile/${userData._id}`)}
                      className="cursor-pointer mb-4"
                    >
                      {userData.profilePicture ? (
                        <img
                          src={userData.profilePicture}
                          alt={userData.name}
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100 mx-auto"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-100 mx-auto">
                          <UserPlus size={24} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div 
                      onClick={() => navigate(`/profile/${userData._id}`)}
                      className="cursor-pointer mb-4"
                    >
                      <h3 className="font-semibold text-gray-900 text-lg hover:text-blue-600 transition-colors">
                        {userData.name}
                      </h3>
                      <p className="text-gray-600 text-sm">@{userData.username}</p>
                      
                      {userProfile.bio && (
                        <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                          {userProfile.bio}
                        </p>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="w-full space-y-2 mb-4">
                      {userData.email && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm justify-center">
                          <Mail size={14} />
                          <span className="truncate">{userData.email}</span>
                        </div>
                      )}
                      {userProfile.location && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm justify-center">
                          <MapPin size={14} />
                          {userProfile.location}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="w-full">
                      {userProfile.isFollowing ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUnfollow(userData._id)}
                            className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                          >
                            Unfollow
                          </button>
                          <button
                            onClick={() => navigate(`/profile/${userData._id}`)}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                          >
                            View
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleFollow(userData._id)}
                          disabled={followLoading[userData._id]}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                          {followLoading[userData._id] ? 'Following...' : 'Follow'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Network;