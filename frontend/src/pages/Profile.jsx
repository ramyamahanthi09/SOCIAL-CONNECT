import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import EditProfileModal from '../components/EditProfileModal';
import { toast } from 'react-toastify';

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser } = useContext(AuthContext);
    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const isOwnProfile = currentUser && (currentUser.id === id || currentUser === id);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            // Fetch the definitive profile metadata from the new ID-based endpoint
            const profileRes = await api.get(`/users/id/${id}`);
            setProfileUser(profileRes.data);

            // Then fetch the associated posts
            const postRes = await api.get(`/users/${id}/posts`);
            setPosts(postRes.data.posts || []);

            // Check if following
            if (currentUser && !isOwnProfile) {
                const followRes = await api.get(`/users/${id}/followers`);
                const followers = followRes.data.followers || [];
                const following = followers.some(f => f.id === currentUser.id);
                setIsFollowing(following);
            }
        } catch (err) {
            if(err.response?.status === 403) {
                toast.error("Account is private");
            } else if (err.response?.status === 404) {
                toast.error("User not found");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [id, currentUser]);

    const handleFollowToggle = async () => {
        try {
            if (isFollowing) {
                await api.delete(`/users/${id}/follow`);
                toast.info(`Unfollowed ${profileUser.username}`);
            } else {
                await api.post(`/users/${id}/follow`);
                toast.success(`Following ${profileUser.username}`);
            }
            setIsFollowing(!isFollowing);
            // Refresh stats
            const updatedProfile = await api.get(`/users/id/${id}`);
            setProfileUser(updatedProfile.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        }
    };

    if (loading) return <div className="text-center mt-10 text-primary-500 font-bold animate-pulse">Loading Profile...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Cover Photo */}
            <div className="h-64 rounded-b-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg relative overflow-hidden">
                {profileUser?.cover_photo && <img src={`http://localhost:5000${profileUser.cover_photo}`} className="w-full h-full object-cover" alt="Cover" />}
            </div>

            {/* Profile Info */}
            <div className="glass -mt-16 mx-4 md:mx-10 rounded-3xl p-6 shadow-xl relative text-center md:text-left md:flex items-center justify-between">
                <div className="md:flex items-center space-x-6">
                    <div className="w-32 h-32 mx-auto md:mx-0 -mt-16 md:-mt-24 rounded-full border-4 border-white shadow-xl bg-white overflow-hidden text-5xl flex items-center justify-center font-bold text-gray-400">
                        {profileUser?.profile_picture ? (
                            <img src={`http://localhost:5000${profileUser.profile_picture}`} className="w-full h-full object-cover" alt="Profile" />
                        ) : (
                            profileUser?.username?.charAt(0).toUpperCase() || 'U'
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mt-4 md:mt-0">{profileUser?.full_name || profileUser?.username}</h1>
                        <p className="text-gray-500">@{profileUser?.username}</p>
                        <p className="text-sm mt-2 text-gray-700 max-w-md">{profileUser?.bio}</p>
                    </div>
                </div>

                <div className="mt-6 md:mt-0 flex flex-col space-y-3 md:items-end">
                    {isOwnProfile ? (
                        <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-full shadow-sm transition"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <button 
                            onClick={handleFollowToggle}
                            className={`px-6 py-2 rounded-full font-medium shadow-md transition ${isFollowing ? 'bg-gray-200 text-gray-800' : 'bg-primary-500 hover:bg-primary-600 text-white'}`}
                        >
                            {isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                    )}
                </div>
            </div>

            {/* Posts Grid */}
            <div className="mt-10 mx-4 md:mx-0">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Posts</h3>
                <div className="space-y-6">
                    {posts.length > 0 ? posts.map(post => (
                        <PostCard key={post.id} post={{...post, author: profileUser}} />
                    )) : (
                        <div className="text-center glass py-10 rounded-2xl">
                            <h3 className="text-gray-500">No posts visible.</h3>
                        </div>
                    )}
                </div>
            </div>
            
            <EditProfileModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                user={profileUser} 
                onUpdate={fetchProfile}
            />
        </div>
    );
};

export default Profile;
