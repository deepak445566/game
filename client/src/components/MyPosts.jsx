// components/MyPosts.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, FileText, User, Heart, MessageCircle, Share, Image, Video, Calendar, Edit, Trash2, Plus } from 'lucide-react';
import api from '../config/axios';

function MyPosts() {
  const { user, axios } = useAppContext();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchMyPosts();
    }
  }, [user]);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/post/getMyPosts'); // ✅ Using new route
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching my posts:", error);
      setError(error.response?.data?.message || 'Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };


const handleDeletePost = async (postId) => {
  if (!window.confirm('Are you sure you want to delete this post?')) return;

  try {
    const { data } = await api.delete('/api/post/delete', {
      data: { postId }  // DELETE requests send data this way
    });

    if (data.success) {
      setPosts(posts.filter(post => post._id !== postId));
      alert('Post deleted successfully');
    } else {
      alert(data.message || 'Failed to delete post');
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    alert(error.response?.data?.message || 'Failed to delete post');
  }
};



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Sign In Required
          </h2>
          <p className="text-gray-600">
            Please sign in to view your posts
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
          <p className="text-gray-600">Loading your posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
              
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="text-blue-600" size={20} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Posts</h1>
                  <p className="text-gray-600">{posts.length} posts created by you</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/create-post')}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              New Post
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-red-600" size={24} />
            </div>
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button 
              onClick={fetchMyPosts}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">You haven't created any posts yet</p>
            <p className="text-gray-400 text-sm mt-2">Start sharing your thoughts with the community</p>
            <button
              onClick={() => navigate('/create-post')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                
                {/* Post Header - User Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-gray-200">
                        <User size={18} className="text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-gray-500 text-sm">@{user.username}</p>
                      <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
                        <Calendar size={12} />
                        {formatDate(post.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons for Owner */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/edit-post/${post._id}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Post"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                {post.body && (
                  <div className="mb-4">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">{post.body}</p>
                  </div>
                )}

                {/* Media */}
                {post.media && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    {post.fileType === 'image' ? (
                      <img
                        src={post.media}
                        alt="Your post media"
                        className="w-full max-h-96 object-cover rounded-lg"
                      />
                    ) : post.fileType === 'video' ? (
                      <video
                        src={post.media}
                        controls
                        className="w-full max-h-96 rounded-lg"
                      />
                    ) : null}
                  </div>
                )}

                {/* Post Stats */}
                <div className="flex items-center justify-between text-gray-500 text-sm mb-4">
                  <div className="flex items-center gap-4">
                    <span>{post.likes || 0} likes</span>
                    <span>0 comments</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {post.fileType === 'image' && <Image size={14} />}
                    {post.fileType === 'video' && <Video size={14} />}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                    <Heart size={18} />
                    <span>Like</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <MessageCircle size={18} />
                    <span>Comment</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                    <Share size={18} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPosts;