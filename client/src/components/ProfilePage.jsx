import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  User, Mail, MapPin, Briefcase, Calendar, 
  BookOpen, Building, GraduationCap, Share2,
  MessageCircle, Download, Edit, Globe, Phone,
  UserPlus, UserCheck, Users, Loader
} from 'lucide-react';
import api from '../config/axios';

function ProfilePage() {
  const { userId } = useParams();
  const { user, axios } = useAppContext();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('about');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [connectionStats, setConnectionStats] = useState({
    followers: 0,
    following: 0
  });

  useEffect(() => {
    if (userId) {
      fetchProfile();
      if (user) {
        checkFollowingStatus();
      }
    }
  }, [userId, user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/user/getUserProfile/${userId}`);
      setProfile(data.profile);
      fetchConnectionStats();
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 404) {
        setError('Profile not found');
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionStats = async () => {
    try {
      const { data } = await api.get(`/api/user/connection-counts/${userId}`);
      setConnectionStats(data.counts);
    } catch (error) {
      console.error("Error fetching connection stats:", error);
    }
  };

  const checkFollowingStatus = async () => {
    try {
      const { data } = await api.get(`/api/user/check-following/${userId}`);
      setIsFollowing(data.isFollowing);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setFollowLoading(true);
      
      if (isFollowing) {
        // Unfollow
        await api.post('/api/user/unfollow', { followingId: userId });
        setIsFollowing(false);
        setConnectionStats(prev => ({
          ...prev,
          followers: Math.max(0, prev.followers - 1)
        }));
      } else {
        // Follow
        await api.post('/api/user/follow', { followingId: userId });
        setIsFollowing(true);
        setConnectionStats(prev => ({
          ...prev,
          followers: prev.followers + 1
        }));
      }
    } catch (error) {
      console.error("Error following/unfollowing:", error);
      alert('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleDownloadProfile = async () => {
    try {
      const { data } = await api.get(`/api/user/download?id=${userId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${profile.userId.name}_profile.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Error downloading profile:", error);
      alert('Failed to download profile');
    }
  };

  const handleViewFollowers = () => {
    navigate(`/profile/followers/${userId}`);
  };

  const handleViewFollowing = () => {
    navigate(`/profile/following/${userId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
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
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Profile not found</p>
        </div>
      </div>
    );
  }

  const userData = profile.userId || profile;
  const isOwnProfile = user && user._id === userId;

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
                {/* Avatar */}
                <div className="relative">
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
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                  <div className="space-y-3">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{userData?.name}</h1>
                      <p className="text-gray-600 text-lg mt-1">@{userData?.username}</p>
                    </div>
                    
                    {profile?.headline && (
                      <p className="text-gray-700 text-lg font-medium flex items-center gap-2">
                        <Briefcase size={18} className="text-blue-600" />
                        {profile.headline}
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
                      {profile?.location && (
                        <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                          <MapPin size={14} />
                          {profile.location}
                        </span>
                      )}
                      <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                        <Calendar size={14} />
                        Joined {formatDate(userData?.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 flex-wrap">
                    <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                      <Share2 size={16} />
                      Share
                    </button>

                    {!isOwnProfile && user && (
                      <>
                        <button 
                          onClick={handleFollow}
                          disabled={followLoading}
                          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                            isFollowing
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {followLoading ? (
                            <Loader size={16} className="animate-spin" />
                          ) : isFollowing ? (
                            <UserCheck size={16} />
                          ) : (
                            <UserPlus size={16} />
                          )}
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                        
                        <button className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                          <MessageCircle size={16} />
                          Message
                        </button>
                      </>
                    )}

                    {isOwnProfile && (
                      <>
                        <button 
                          onClick={handleDownloadProfile}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Download size={16} />
                          Download PDF
                        </button>
                        <button 
                          onClick={() => navigate('/edit-profile')}
                          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
                        >
                          <Edit size={16} />
                          Edit Profile
                        </button>
                      </>
                    )}

                    {!user && (
                      <button
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
                      >
                        Login to View Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-t border-gray-100">
              <div className="px-8">
                <div className="flex space-x-8">
                  {['about', 'experience', 'education', 'skills', 'connections'].map((tab) => (
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
              {profile?.bio ? (
                <p className="text-gray-700 leading-relaxed text-sm">{profile.bio}</p>
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
              <h3 className="font-semibold text-gray-900 mb-4">Contact Info</h3>
              <div className="space-y-3">
                {userData?.email && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail size={16} className="text-blue-600" />
                    <span className="text-sm">{userData.email}</span>
                  </div>
                )}
                {profile?.location && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin size={16} className="text-blue-600" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                )}
                {profile?.phone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone size={16} className="text-blue-600" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                )}
                {profile?.website && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Globe size={16} className="text-blue-600" />
                    <a 
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={16} className="text-blue-600" />
                  <span className="text-sm">Joined {formatDate(userData?.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Profile Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Experience</span>
                  <span className="text-sm font-medium text-gray-900">
                    {profile?.pastwork?.length || 0} positions
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Education</span>
                  <span className="text-sm font-medium text-gray-900">
                    {profile?.education?.length || 0} degrees
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Skills</span>
                  <span className="text-sm font-medium text-gray-900">
                    {profile?.skills?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Professional Summary */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Briefcase className="text-blue-600" size={20} />
                        Professional Summary
                      </h3>
                      {profile?.bio ? (
                        <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                      ) : (
                        <p className="text-gray-500 italic">No professional summary added.</p>
                      )}
                    </div>

                    {/* Current Position */}
                    {profile?.headline && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Current Position</h4>
                        <p className="text-gray-700">{profile.headline}</p>
                      </div>
                    )}

                    {/* Industry */}
                    {profile?.industry && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Industry</h4>
                        <p className="text-gray-700">{profile.industry}</p>
                      </div>
                    )}
                  </div>

                  {/* Personal Details */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Details</h3>
                      <div className="space-y-3">
                        {profile?.location && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Location</span>
                            <span className="text-gray-900">{profile.location}</span>
                          </div>
                        )}
                        {profile?.phone && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone</span>
                            <span className="text-gray-900">{profile.phone}</span>
                          </div>
                        )}
                        {userData?.email && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email</span>
                            <span className="text-gray-900">{userData.email}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Member Since</span>
                          <span className="text-gray-900">{formatDate(userData?.createdAt)}</span>
                        </div>
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
                
                {profile?.pastwork && profile.pastwork.length > 0 ? (
                  <div className="space-y-6">
                    {profile.pastwork.map((work, index) => (
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
                          {work.description && (
                            <p className="text-gray-700 mt-2 text-sm">{work.description}</p>
                          )}
                          {work.location && (
                            <p className="text-gray-600 text-sm mt-1 flex items-center gap-1">
                              <MapPin size={14} />
                              {work.location}
                            </p>
                          )}
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
                
                {profile?.education && profile.education.length > 0 ? (
                  <div className="space-y-6">
                    {profile.education.map((edu, index) => (
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
                          <p className="text-gray-500 text-sm">{edu.years}</p>
                          {edu.description && (
                            <p className="text-gray-700 mt-2 text-sm">{edu.description}</p>
                          )}
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

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <BookOpen className="text-blue-600" size={20} />
                  Skills & Expertise
                </h3>
                
                {profile?.skills && profile.skills.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-3">
                      {profile.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors cursor-default"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    {/* Additional Skills Information */}
                    {profile?.languages && profile.languages.length > 0 && (
                      <div className="mt-8">
                        <h4 className="font-semibold text-gray-900 mb-4">Languages</h4>
                        <div className="flex flex-wrap gap-3">
                          {profile.languages.map((language, index) => (
                            <span 
                              key={index}
                              className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium"
                            >
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {profile?.certifications && profile.certifications.length > 0 && (
                      <div className="mt-8">
                        <h4 className="font-semibold text-gray-900 mb-4">Certifications</h4>
                        <div className="space-y-3">
                          {profile.certifications.map((cert, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-gray-700">{cert}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No skills added yet</p>
                    <p className="text-gray-400 text-sm mt-2">Add your skills and expertise to showcase your capabilities</p>
                  </div>
                )}
              </div>
            )}

            {/* Connections Tab */}
            {activeTab === 'connections' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="text-blue-600" size={20} />
                  Network
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
                        <p className="text-sm text-gray-600">People following {userData?.name}</p>
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
                        <p className="text-sm text-gray-600">People {userData?.name} follows</p>
                      </div>
                    </div>
                  </div>
                </div>

                {!isOwnProfile && user && (
                  <div className="mt-8 text-center">
                    <button 
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`px-8 py-3 rounded-lg transition-colors font-medium ${
                        isFollowing
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto`}
                    >
                      {followLoading ? (
                        <Loader size={16} className="animate-spin" />
                      ) : isFollowing ? (
                        <UserCheck size={16} />
                      ) : (
                        <UserPlus size={16} />
                      )}
                      {isFollowing ? 'Following' : `Follow ${userData?.name}`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;