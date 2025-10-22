import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';


function Home() {
  const { user, axios, setShowLogin } = useAppContext();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentTexts, setCommentTexts] = useState({});
  const [showCommentsPopup, setShowCommentsPopup] = useState(null);
  const [postComments, setPostComments] = useState({});
  const [likingPost, setLikingPost] = useState(null);

  // ✅ Handle profile picture click
  const handleProfileClick = (userId) => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  // ✅ Fetch posts if user is logged in
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    fetchPosts();
  }, [user]);

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/post/getAllPosts');
      
      if (data.success) {
        setPosts(data.posts);
      } else {
        setError(data.message || 'Failed to fetch posts');
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      if (error.response?.status !== 401) {
        setError('Failed to load posts');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ LIKE/UNLIKE FUNCTION WITH ANIMATION
  const handleLike = async (postId) => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    try {
      setLikingPost(postId);
      
      const { data } = await axios.put('/api/post/like', { postId });
      
      if (data.success) {
        setPosts(prev => 
          prev.map(post => 
            post._id === postId ? { ...post, likes: data.likes } : post
          )
        );
      }
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setTimeout(() => {
        setLikingPost(null);
      }, 600);
    }
  };

  // ✅ Check if current user liked the post
  const isPostLiked = (post) => {
    if (!user || !post.likedBy) return false;
    return post.likedBy.some(likedUserId => 
      likedUserId.toString() === user._id.toString()
    );
  };

  // Fetch comments for a specific post
  const fetchComments = async (postId) => {
    try {
      const { data } = await axios.get('/api/post/comments', {
        params: { postId }
      });
      
      if (data.success) {
        setPostComments(prev => ({
          ...prev,
          [postId]: data.comments
        }));
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Open comments popup
  const openCommentsPopup = async (postId) => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    
    setShowCommentsPopup(postId);
    if (!postComments[postId]) {
      await fetchComments(postId);
    }
  };

  // Close comments popup
  const closeCommentsPopup = () => {
    setShowCommentsPopup(null);
  };

  // Add comment to a post
  const handleAddComment = async (postId) => {
    const commentText = commentTexts[postId]?.trim();
    if (!commentText || !user) return;

    try {
      const { data } = await axios.post('/api/post/comment', {
        postId,
        body: commentText
      });

      if (data.success) {
        setCommentTexts(prev => ({
          ...prev,
          [postId]: ''
        }));

        await fetchComments(postId);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Handle comment input change
  const handleCommentChange = (postId, text) => {
    setCommentTexts(prev => ({
      ...prev,
      [postId]: text
    }));
  };

  // Delete comment
  const handleDeleteComment = async (commentId, postId) => {
    try {
      const { data } = await axios.post('/api/post/deletecomment', {
        commentId
      });

      if (data.success) {
        await fetchComments(postId);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // ✅ Show login prompt if no user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
              in
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome to Your Professional Community
            </h1>
            <p className="text-gray-600 mb-6">
              Sign in to see posts from your network
            </p>
          </div>
          
          <button
            onClick={() => setShowLogin(true)}
            className="w-full bg-blue-500 text-white py-3 rounded-full hover:bg-blue-600 transition-colors font-medium text-lg"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4">
        
        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-500 text-lg">No posts found</p>
              <p className="text-gray-400 text-sm mt-2">Be the first to post something!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                
                {/* Post Header - User Info */}
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleProfileClick(post.userId?._id)}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
                    >
                      {post.userId?.profilePicture ? (
                        <img 
                          src={post.userId.profilePicture} 
                          alt={post.userId.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {post.userId?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </button>
                    <div className="flex-1">
                      <button 
                        onClick={() => handleProfileClick(post.userId?._id)}
                        className="text-left hover:text-blue-600 transition-colors focus:outline-none"
                      >
                        <h3 className="font-semibold text-gray-900">
                          {post.userId?.name || 'Unknown User'}
                        </h3>
                      </button>
                      <p className="text-gray-500 text-sm">
                        @{post.userId?.username || 'user'}
                      </p>
                    </div>
                  </div>

                  {/* Post Description */}
                  {post.body && (
                    <p className="text-gray-800 mt-3 whitespace-pre-wrap leading-relaxed">
                      {post.body}
                    </p>
                  )}
                </div>

                {/* Post Media */}
                {post.media && post.fileType === 'image' && (
                  <div className="border-t border-gray-100">
                    <img 
                      src={post.media} 
                      alt="Post"
                      className="w-full object-contain max-h-96 bg-gray-100"
                    />
                  </div>
                )}

                {post.media && post.fileType === 'video' && (
                  <div className="border-t border-gray-100">
                    <video 
                      controls 
                      className="w-full max-h-96 bg-black"
                    >
                      <source src={post.media} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {/* Post Stats */}
                <div className="px-4 py-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-gray-500 text-sm">
                    <span>{post.likes || 0} likes</span>
                    <span>{postComments[post._id]?.length || 0} comments</span>
                  </div>
                </div>

                {/* Post Actions - Like, Comment */}
                <div className="px-4 py-2 border-t border-gray-100">
                  <div className="flex items-center justify-around text-gray-600">
                    {/* Like Button with Animation */}
                    <button 
                      onClick={() => handleLike(post._id)}
                      disabled={likingPost === post._id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        isPostLiked(post) 
                          ? 'text-red-500 bg-red-50 font-semibold' 
                          : 'hover:text-red-500 hover:bg-gray-100'
                      } ${
                        likingPost === post._id ? 'scale-110 transform' : ''
                      }`}
                    >
                      <div className="relative">
                        <svg 
                          className={`w-5 h-5 transition-all duration-300 ${
                            likingPost === post._id ? 'scale-125' : ''
                          }`}
                          fill={isPostLiked(post) ? "currentColor" : "none"} 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        
                        {likingPost === post._id && (
                          <>
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse"></div>
                          </>
                        )}
                      </div>
                      
                      <span className="font-medium transition-all duration-300">
                        {isPostLiked(post) ? 'Liked' : 'Like'}
                        {likingPost === post._id && '...'}
                      </span>
                    </button>

                    {/* Comment Button */}
                    <button 
                      onClick={() => openCommentsPopup(post._id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg hover:text-blue-500 hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="font-medium">Comment</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comments Popup Modal */}
        {showCommentsPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
              {/* Popup Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
                <button 
                  onClick={closeCommentsPopup}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4">
                {postComments[showCommentsPopup]?.length > 0 ? (
                  <div className="space-y-4">
                    {postComments[showCommentsPopup].map((comment) => (
                      <div key={comment._id} className="flex gap-3">
                        <button 
                          onClick={() => handleProfileClick(comment.userId?._id)}
                          className="flex-shrink-0 hover:opacity-80 transition-opacity focus:outline-none"
                        >
                          {comment.userId?.profilePicture ? (
                            <img 
                              src={comment.userId.profilePicture} 
                              alt={comment.userId.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              {comment.userId?.name?.charAt(0) || 'U'}
                            </div>
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <button 
                                onClick={() => handleProfileClick(comment.userId?._id)}
                                className="hover:text-blue-600 transition-colors text-left focus:outline-none"
                              >
                                <h4 className="font-semibold text-gray-900">
                                  {comment.userId?.name || 'Unknown User'}
                                </h4>
                              </button>
                              {user && user._id === comment.userId?._id && (
                                <button 
                                  onClick={() => handleDeleteComment(comment._id, showCommentsPopup)}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            <p className="text-gray-700 mt-1">{comment.body}</p>
                          </div>
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>

              {/* Add Comment Input */}
              {user && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleProfileClick(user._id)}
                      className="flex-shrink-0 hover:opacity-80 transition-opacity focus:outline-none"
                    >
                      {user.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </button>
                    <input 
                      type="text" 
                      value={commentTexts[showCommentsPopup] || ''}
                      onChange={(e) => handleCommentChange(showCommentsPopup, e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 border border-gray-300 rounded-full px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(showCommentsPopup);
                        }
                      }}
                    />
                    <button 
                      onClick={() => handleAddComment(showCommentsPopup)}
                      className="bg-blue-500 text-white px-3 py-2 rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={!commentTexts[showCommentsPopup]?.trim()}
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;