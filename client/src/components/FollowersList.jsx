import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Users, User, Mail, MapPin, Loader, UserCheck } from 'lucide-react';


function FollowersList() {
  const { userId } = useParams();
  const { user, axios } = useAppContext();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileUser, setProfileUser] = useState(null);
  const [followLoading, setFollowLoading] = useState({});

  useEffect(() => {
    fetchFollowers();
    if (userId) {
      fetchProfileUser();
    }
  }, [userId]);

  const fetchProfileUser = async () => {
    try {
      const { data } = await axios.get(`/api/user/getUserProfile/${userId}`);
      setProfileUser(data.profile || data);
    } catch (error) {
      console.error("Error fetching profile user:", error);
    }
  };

  const fetchFollowers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/user/followers/${userId}`);
      const followersWithStatus = await Promise.all(
        (data.followers || []).map(async (follower) => {
          if (!user || user._id === follower._id) {
            return { ...follower, isFollowing: false, isFriend: false };
          }
          
          try {
            // Check if current user is following this follower
            const followStatusResponse = await axios.get(`/api/user/check-following/${follower._id}`);
            const isFollowing = followStatusResponse.data.isFollowing;
            
            // Check if it's mutual follow (friends)
            const isFriend = isFollowing; // Since they're already following you, if you follow back = friends
            
            return { ...follower, isFollowing, isFriend };
          } catch (error) {
            console.error(`Error checking follow status for ${follower._id}:`, error);
            return { ...follower, isFollowing: false, isFriend: false };
          }
        })
      );
      setFollowers(followersWithStatus);
    } catch (error) {
      console.error("Error fetching followers:", error);
      setError('Failed to load followers');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Don't allow following yourself
    if (user._id === targetUserId) {
      alert("You cannot follow yourself");
      return;
    }

    try {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: true }));
      
      const response = await axios.post('/api/user/follow', { 
        followingId: targetUserId 
      });
      
      console.log("Follow response:", response.data);
      
      // Update the local state to reflect the follow
      setFollowers(prev => 
        prev.map(follower => 
          follower._id === targetUserId 
            ? { ...follower, isFollowing: true, isFriend: true } // Now it's mutual follow = friends
            : follower
        )
      );
      
    } catch (error) {
      console.error("Error following user:", error);
      console.error("Error response data:", error.response?.data);
      
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
      
      await axios.post('/api/user/unfollow', { followingId: targetUserId });
      
      // Update the local state to reflect the unfollow
      setFollowers(prev => 
        prev.map(follower => 
          follower._id === targetUserId 
            ? { ...follower, isFollowing: false, isFriend: false }
            : follower
        )
      );
      
    } catch (error) {
      console.error("Error unfollowing user:", error);
      console.error("Error response data:", error.response?.data);
      
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to unfollow user');
      }
    } finally {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading followers...</p>
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
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="text-blue-600" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profileUser?.userId?.name || profileUser?.name || 'User'}'s Followers
                </h1>
                <p className="text-gray-600">{followers.length} followers</p>
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
              <Users className="text-red-600" size={24} />
            </div>
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button 
              onClick={fetchFollowers}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : followers.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No followers yet</p>
            <p className="text-gray-400 text-sm mt-2">
              {profileUser?.userId?.name || profileUser?.name || 'This user'} doesn't have any followers yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {followers.map((follower) => (
              <div key={follower._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div 
                    onClick={() => navigate(`/profile/${follower._id}`)}
                    className="cursor-pointer"
                  >
                    {follower.profilePicture ? (
                      <img
                        src={follower.profilePicture}
                        alt={follower.name}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-100">
                        <User size={24} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div 
                      onClick={() => navigate(`/profile/${follower._id}`)}
                      className="cursor-pointer"
                    >
                      <h3 className="font-semibold text-gray-900 text-lg hover:text-blue-600 transition-colors">
                        {follower.name}
                      </h3>
                      <p className="text-gray-600 text-sm">@{follower.username}</p>
                    </div>

                    <div className="mt-3 space-y-2">
                      {follower.email && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Mail size={14} />
                          {follower.email}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <MapPin size={14} />
                        Followed on {new Date(follower.followedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {user && user._id !== follower._id && (
                      <div className="mt-4">
                        {followLoading[follower._id] ? (
                          <button
                            disabled
                            className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
                          >
                            <Loader size={16} className="animate-spin" />
                            Processing...
                          </button>
                        ) : follower.isFriend ? (
                          // Friends - Green button
                          <button
                            disabled
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
                          >
                            <UserCheck size={16} />
                            Friends
                          </button>
                        ) : follower.isFollowing ? (
                          // Following - Show unfollow option
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUnfollow(follower._id)}
                              className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                            >
                              Unfollow
                            </button>
                            <button
                              onClick={() => navigate(`/profile/${follower._id}`)}
                              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                              View Profile
                            </button>
                          </div>
                        ) : (
                          // Not following - Show follow button
                          <button
                            onClick={() => handleFollow(follower._id)}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Follow Back
                          </button>
                        )}
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

export default FollowersList;