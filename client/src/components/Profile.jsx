import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  User, Mail, MapPin, Briefcase, Calendar, Edit, 
  BookOpen, Camera, X, Loader, Users, UserPlus, UserCheck,
  Globe, GraduationCap, Building, Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';

function Profile() {
  const navigate = useNavigate();
  const { user, axios, fetchUser } = useAppContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('about');
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [connectionStats, setConnectionStats] = useState({
    followers: 0,
    following: 0
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchConnectionStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/user/getUserProfile');
      console.log("Profile data:", data);
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionStats = async () => {
    try {
      const { data } = await api.get(`/api/user/connection-counts/${user._id}`);
      setConnectionStats(data.counts);
    } catch (error) {
      console.error("Error fetching connection stats:", error);
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowUploadModal(true);
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('picture', selectedFile);

      const { data } = await api.post('/api/user/upload-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.profilePicture) {
        await fetchUser();
        await fetchUserProfile();
        setShowUploadModal(false);
        setSelectedFile(null);
        setPreviewUrl('');
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Remove profile picture
  const removeProfilePicture = async () => {
    try {
      setUploading(true);
      
      const { data } = await api.post('/api/user/remove-profile-picture');
      
      if (data.success) {
        await fetchUser();
        await fetchUserProfile();
        setShowUploadModal(false);
      }

    } catch (error) {
      console.error('Remove error:', error);
      alert('Failed to remove profile picture.');
    } finally {
      setUploading(false);
    }
  };

  // Navigate to followers/following pages
  const handleViewFollowers = () => {
    navigate(`/profile/followers/${user._id}`);
  };

  const handleViewFollowing = () => {
    navigate(`/profile/following/${user._id}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Join the Community
          </h2>
          <p className="text-gray-600 mb-6">
            Sign in to view and customize your professional profile
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
          <p className="text-gray-600">Crafting your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-red-600" size={24} />
          </div>
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button 
            onClick={fetchUserProfile}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const userData = profile?.userId || user;
  const profileData = profile || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="relative">
        <div className="h-64 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent"></div>
        </div>

        {/* Profile Card */}
        <div className="max-w-6xl mx-auto px-4 -mt-32 relative">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Profile Header */}
            <div className="relative">
              <div className="h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
              
              <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6 px-8 pb-8 -mt-20">
                {/* Avatar with Upload Functionality */}
                <div className="relative group">
                  <div className="relative">
                    {userData?.profilePicture ? (
                      <img
                        src={userData.profilePicture}
                        alt={userData.name}
                        className="w-40 h-40 rounded-2xl border-4 border-white shadow-2xl object-cover"
                      />
                    ) : (
                      <div className="w-40 h-40 rounded-2xl border-4 border-white bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl flex items-center justify-center">
                        <User size={48} className="text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-2xl border-2 border-white/20"></div>
                    
                    {/* Upload Overlay */}
                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                  
                  {/* Upload Button */}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110 border-2 border-white"
                  >
                    <Camera size={16} />
                  </button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                  <div className="space-y-3">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{userData?.name}</h1>
                      <p className="text-gray-600 text-lg mt-1">@{userData?.username}</p>
                    </div>
                    
                    {profileData?.currentPost && (
                      <p className="text-gray-700 text-lg font-medium flex items-center gap-2">
                        <Briefcase size={18} className="text-blue-600" />
                        {profileData.currentPost}
                      </p>
                    )}
                    
                    {/* Connection Stats */}
                    <div className="flex gap-6">
                      <button 
                        onClick={handleViewFollowers}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
                      >
                        <span className="font-semibold text-gray-900 group-hover:text-blue-600">
                          {connectionStats.followers}
                        </span>
                        <span>Followers</span>
                      </button>
                      
                      <button 
                        onClick={handleViewFollowing}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
                      >
                        <span className="font-semibold text-gray-900 group-hover:text-blue-600">
                          {connectionStats.following}
                        </span>
                        <span>Following</span>
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {userData?.email && (
                        <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                          <Mail size={14} />
                          {userData.email}
                        </span>
                      )}
                      <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                        <Calendar size={14} />
                        Joined {formatDate(userData?.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                      <Share2 size={16} />
                      Share
                    </button>
                    
                    <button 
                      onClick={() => navigate('/edit-profile')}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
                    >
                      <Edit size={16} />
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-t border-gray-100">
              <div className="px-1">
                <div className="flex space-x-3">
                  {['about', 'experience', 'education', 'connections'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Bio Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen size={18} />
                About
              </h3>
              {profileData?.bio ? (
                <p className="text-gray-700 leading-relaxed text-sm">{profileData.bio}</p>
              ) : (
                <p className="text-gray-500 italic text-sm">No bio added yet.</p>
              )}
            </div>

            {/* Connection Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={18} />
                Network
              </h3>
              <div className="space-y-4">
                <button 
                  onClick={handleViewFollowers}
                  className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <UserCheck size={16} className="text-green-600" />
                    <span className="text-sm text-gray-600">Followers</span>
                  </div>
                  <span className="font-semibold text-gray-900 group-hover:text-blue-600">
                    {connectionStats.followers}
                  </span>
                </button>
                
                <button 
                  onClick={handleViewFollowing}
                  className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <UserPlus size={16} className="text-blue-600" />
                    <span className="text-sm text-gray-600">Following</span>
                  </div>
                  <span className="font-semibold text-gray-900 group-hover:text-blue-600">
                    {connectionStats.following}
                  </span>
                </button>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3">
                {userData?.email && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail size={16} className="text-blue-600" />
                    <span className="text-sm">{userData.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={16} className="text-blue-600" />
                  <span className="text-sm">Joined {formatDate(userData?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="  lg:col-span-3 space-y-6">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Briefcase className="text-blue-600" size={20} />
                        Professional Summary
                      </h3>
                      {profileData?.bio ? (
                        <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
                      ) : (
                        <p className="text-gray-500 italic">No professional summary added.</p>
                      )}
                    </div>

                    {profileData?.currentPost && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Current Position</h4>
                        <p className="text-gray-700">{profileData.currentPost}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Profile Completeness</h4>
                      <div className="space-y-3">
                        {[
                          { label: 'Basic Info', complete: true },
                          { label: 'Profile Picture', complete: !!userData?.profilePicture },
                          { label: 'Bio', complete: !!profileData?.bio },
                          { label: 'Experience', complete: profileData?.pastwork?.length > 0 },
                          { label: 'Education', complete: profileData?.education?.length > 0 }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{item.label}</span>
                            <div className={`w-3 h-3 rounded-full ${item.complete ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Experience Tab */}
            {activeTab === 'experience' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Building className="text-blue-600" size={20} />
                  Work Experience
                </h3>
                
                {profileData?.pastwork && profileData.pastwork.length > 0 ? (
                  <div className="space-y-6">
                    {profileData.pastwork.map((work, index) => (
                      <div key={index} className="flex gap-4 group hover:bg-gray-50 p-4 rounded-lg transition-colors">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Briefcase size={20} className="text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">{work.position}</h4>
                          <p className="text-blue-600 font-medium">{work.company}</p>
                          <p className="text-gray-500 text-sm mt-1">{work.years}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No work experience added yet</p>
                    <p className="text-gray-400 text-sm mt-2">Add your professional experience to showcase your career journey</p>
                  </div>
                )}
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <GraduationCap className="text-blue-600" size={20} />
                  Education
                </h3>
                
                {profileData?.education && profileData.education.length > 0 ? (
                  <div className="space-y-6">
                    {profileData.education.map((edu, index) => (
                      <div key={index} className="flex gap-4 group hover:bg-gray-50 p-4 rounded-lg transition-colors">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <GraduationCap size={20} className="text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">{edu.degree}</h4>
                          <p className="text-blue-600 font-medium">{edu.school}</p>
                          <p className="text-gray-600 text-sm mt-1">{edu.fieldOfStudy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <GraduationCap size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No education information added yet</p>
                    <p className="text-gray-400 text-sm mt-2">Add your educational background to complete your profile</p>
                  </div>
                )}
              </div>
            )}

            {/* Connections Tab */}
            {activeTab === 'connections' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="text-blue-600" size={20} />
                  My Network
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Followers Card */}
                  <div 
                    onClick={handleViewFollowers}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 cursor-pointer hover:shadow-md transition-all border border-blue-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCheck className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">Followers</h4>
                        <p className="text-2xl font-bold text-blue-600">{connectionStats.followers}</p>
                        <p className="text-sm text-gray-600">People following you</p>
                      </div>
                    </div>
                  </div>

                  {/* Following Card */}
                  <div 
                    onClick={handleViewFollowing}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 cursor-pointer hover:shadow-md transition-all border border-green-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <UserPlus className="text-green-600" size={24} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">Following</h4>
                        <p className="text-2xl font-bold text-green-600">{connectionStats.following}</p>
                        <p className="text-sm text-gray-600">People you follow</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <button 
                    onClick={() => navigate('/network')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Explore Network
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Update Profile Picture
              </h3>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setPreviewUrl('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {previewUrl && (
              <div className="mb-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-32 h-32 rounded-lg mx-auto object-cover"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={uploading}
              >
                Change
              </button>
              
              <button
                onClick={uploadProfilePicture}
                disabled={uploading || !selectedFile}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </button>
            </div>

            {userData?.profilePicture && (
              <button
                onClick={removeProfilePicture}
                disabled={uploading}
                className="w-full mt-3 text-red-600 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:text-red-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Remove Current Picture'
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;