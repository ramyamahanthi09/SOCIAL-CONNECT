import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaUser, FaHeart, FaComment, FaImage, FaVideo } from 'react-icons/fa';

const AdminUserDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        if (!user || user.is_admin === false) {
            navigate('/');
            toast.error("Unauthorized access.");
            return;
        }
        fetchUserDetails();
    }, [user, id]);

    const fetchUserDetails = async () => {
        try {
            const res = await api.get(`/admin/users/${id}`);
            setUserData(res.data.user);
        } catch (error) {
            toast.error("Failed to fetch user details. They might not exist.");
            navigate('/admin');
        }
    };

    if (!userData) return <div className="text-center mt-20 text-gray-500 font-bold animate-pulse">Loading User Details...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button 
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2 text-gray-500 hover:text-primary-600 transition font-medium"
            >
                <FaArrowLeft />
                <span>Back to Admin Dashboard</span>
            </button>

            <div className="glass p-8 rounded-3xl shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    <img 
                        src={userData.profile_picture ? (userData.profile_picture.startsWith('http') ? userData.profile_picture : `http://localhost:5000${userData.profile_picture}`) : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md mx-auto md:mx-0"
                    />
                    <div className="flex-1 text-center md:text-left w-full">
                        <h1 className="text-3xl font-bold text-gray-800">{userData.full_name || userData.username}</h1>
                        <p className="text-gray-500 font-medium">@{userData.username}</p>
                        
                        <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
                            <div><strong>Email:</strong> {userData.email}</div>
                            {userData.location && <div><strong>Location:</strong> {userData.location}</div>}
                            <div><strong>Joined:</strong> {new Date(userData.created_at).toLocaleDateString()}</div>
                            <div><strong>Role:</strong> {userData.is_admin ? <span className="text-red-500 font-bold">Admin</span> : "User"}</div>
                        </div>

                        {userData.bio && (
                            <div className="mt-6 bg-gray-50 p-4 rounded-xl text-gray-700 italic border border-gray-100">
                                "{userData.bio}"
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-8 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">User Posts ({userData.post_count})</h2>
            </div>
            
            <div className="space-y-6">
                {userData.posts && userData.posts.length > 0 ? (
                    userData.posts.map(post => (
                        <div key={post.id} className="glass p-6 rounded-3xl shadow-sm">
                            <div className="text-sm text-gray-400 mb-3">{new Date(post.created_at).toLocaleString()}</div>
                            {post.content && <p className="text-gray-800 whitespace-pre-wrap mb-4">{post.content}</p>}
                            {post.media_url && (
                                <div className="mt-4 rounded-2xl overflow-hidden shadow-sm">
                                    {post.post_type === 'video' ? (
                                        <video src={post.media_url.startsWith('http') ? post.media_url : `http://localhost:5000${post.media_url}`} controls className="w-full max-h-96 object-cover bg-black" />
                                    ) : (
                                        <img src={post.media_url.startsWith('http') ? post.media_url : `http://localhost:5000${post.media_url}`} alt="Post media" className="w-full max-h-96 object-cover" />
                                    )}
                                </div>
                            )}
                            <div className="flex items-center space-x-6 mt-4 text-gray-500">
                                <span className="flex items-center space-x-2"><FaHeart className="text-red-500" /> <span>{post.likes}</span></span>
                                <span className="flex items-center space-x-2"><FaComment className="text-blue-500" /> <span>{post.comments}</span></span>
                                {post.post_type && (
                                    <span className="flex items-center space-x-2 ml-auto text-xs font-bold uppercase py-1 px-3 bg-gray-100 rounded-full">
                                        {post.post_type === 'image' && <FaImage />}
                                        {post.post_type === 'video' && <FaVideo />}
                                        {post.post_type === 'text' && <FaComment />}
                                        <span className="ml-1">{post.post_type} post</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass p-12 rounded-3xl text-center text-gray-500 font-medium">
                        This user hasn't posted anything yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUserDetails;
