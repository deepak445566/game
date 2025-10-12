import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, UserPlus, User, Mail, MapPin } from 'lucide-react';
import api from '../config/axios';

function FollowingList() {
  const { userId } = useParams();
  const { user, axios } = useAppContext();
  const navigate = useNavigate();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    fetchFollowing();
    fetchProfileUser();
  }, [userId]);

  const fetchProfileUser = async () => {
    try {
      const { data } = await api.get(`/api/user/getUserProfile/${userId}`);
      setProfileUser(data.profile);
    } catch (error) {
      console.error("Error fetching profile user:", error);
    }
  };

  const fetchFollowing = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/user/following/${userId}`);
      setFollowing(data.following);
    } catch (error) {
      console.error("Error fetching following:", error);
      setError('Failed to load following list');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/api/user/follow', { followingId: targetUserId });
      fetchFollowing(); // Refresh the list
    } catch (error) {
      console.error("Error following user:", error);
      alert('Failed to follow user');
    }
  };

  const handleUnfollow = async (targetUserId) => {
    try {
      await api.post('/api/user/unfollow', { followingId: targetUserId });
      fetchFollowing(); // Refresh the list
    } catch (error) {
      console.error("Error unfollowing user:", error);
      alert('Failed to unfollow user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading following list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <UserPlus className="text-green-600" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profileUser ? `${profileUser.userId?.name}'s Following` : 'Following'}
                </h1>
                <p className="text-gray-600">{following.length} following</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="text-red-600" size={24} />
            </div>
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button 
              onClick={fetchFollowing}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : following.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Not following anyone yet</p>
            <p className="text-gray-400 text-sm mt-2">
              {profileUser ? `${profileUser.userId?.name} is not following anyone yet` : 'No following found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {following.map((followedUser) => (
              <div key={followedUser._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div 
                    onClick={() => navigate(`/profile/${followedUser._id}`)}
                    className="cursor-pointer"
                  >
                    {followedUser.profilePicture ? (
                      <img
                        src={followedUser.profilePicture}
                        alt={followedUser.name}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center border-2 border-gray-100">
                        <User size={24} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div 
                      onClick={() => navigate(`/profile/${followedUser._id}`)}
                      className="cursor-pointer"
                    >
                      <h3 className="font-semibold text-gray-900 text-lg hover:text-blue-600 transition-colors">
                        {followedUser.name}
                      </h3>
                      <p className="text-gray-600 text-sm">@{followedUser.username}</p>
                    </div>

                    <div className="mt-3 space-y-2">
                      {followedUser.email && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Mail size={14} />
                          {followedUser.email}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <MapPin size={14} />
                        Following since {new Date(followedUser.followedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {user && user._id !== followedUser._id && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleUnfollow(followedUser._id)}
                          className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          Unfollow
                        </button>
                        <button
                          onClick={() => navigate(`/profile/${followedUser._id}`)}
                          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          View Profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FollowingList;