// components/CreatePost.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Image, Video, X, Loader, Smile } from 'lucide-react';
import api from '../config/axios';

function CreatePost() {
  const { user, axios } = useAppContext();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [postData, setPostData] = useState({
    body: '',
    media: null
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const fileType = file.type.split('/')[0];
    if (fileType !== 'image' && fileType !== 'video') {
      alert('Please select an image or video file');
      return;
    }

    // Check file size (max 10MB for images, 50MB for videos)
    const maxSize = fileType === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size should be less than ${fileType === 'image' ? '10MB' : '50MB'}`);
      return;
    }

    setPostData(prev => ({ ...prev, media: file }));
    setFileType(fileType);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    setPostData(prev => ({ ...prev, media: null }));
    setPreviewUrl('');
    setFileType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!postData.body.trim() && !postData.media) {
      setError('Please add some text or media to your post');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('body', postData.body);
      if (postData.media) {
        formData.append('media', postData.media);
      }

      const { data } = await api.post('/api/post/postUpload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Post created:', data);
      navigate('/'); // Redirect to home after successful post
      
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Join to Create Posts
          </h2>
          <p className="text-gray-600">
            Sign in to share your thoughts and media with the community
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Create Post</h1>
          </div>
        </div>
      </div>

      {/* Create Post Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-6">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <Image size={20} className="text-gray-600" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-gray-500 text-sm">@{user.username}</p>
            </div>
          </div>

          {/* Post Form */}
          <form onSubmit={handleSubmit}>
            {/* Text Area */}
            <div className="mb-6">
              <textarea
                value={postData.body}
                onChange={(e) => setPostData(prev => ({ ...prev, body: e.target.value }))}
                placeholder="What's on your mind?"
                className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                <span>{postData.body.length}/1000</span>
                <button type="button" className="text-gray-400 hover:text-gray-600">
                  <Smile size={18} />
                </button>
              </div>
            </div>

            {/* Media Preview */}
            {previewUrl && (
              <div className="mb-6 relative">
                {fileType === 'image' ? (
                  <img
                    src={previewUrl}
                    alt="Post preview"
                    className="w-full max-h-96 object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full max-h-96 rounded-lg"
                  />
                )}
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Media Upload Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Image size={18} />
                Photo
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Video size={18} />
                Video
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                className="hidden"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (!postData.body.trim() && !postData.media)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </button>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h4 className="font-semibold text-blue-900 mb-2">Posting Tips</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Share your thoughts, experiences, or interesting content</li>
            <li>• You can add images or videos to make your post more engaging</li>
            <li>• Be respectful and follow community guidelines</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;