import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaUserShield, FaUsers, FaNewspaper, FaComments, FaHeart, FaUserSecret } from 'react-icons/fa';

const AdminDashboard = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('users');

    useEffect(() => {
        if (!user || user.is_admin === false) {
            navigate('/');
            toast.error("Unauthorized access.");
            return;
        }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, postsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/posts')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data.users || []);
            setPosts(postsRes.data.posts || []);
        } catch (error) {
            toast.error("Failed to fetch admin data");
        }
    };

    const handleImpersonate = async (targetUserId) => {
        if (!window.confirm("Are you sure you want to impersonate this user?")) return;
        
        try {
            const res = await api.post(`/admin/impersonate/${targetUserId}`);
            localStorage.setItem('access_token', res.data.access_token);
            toast.success(res.data.message);
            // hard refresh to force auth context reload and clear state
            window.location.href = '/';
        } catch (error) {
            toast.error('Failed to impersonate user');
        }
    };

    if (!stats) return <div className="text-center mt-20 text-gray-500 font-bold animate-pulse">Loading Admin Data...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-transparent py-4 border-b border-gray-200">
                <h1 className="text-3xl font-bold flex items-center space-x-3 text-gray-800">
                    <FaUserShield className="text-primary-600" />
                    <span>Admin Dashboard</span>
                </h1>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass p-6 rounded-3xl shadow-sm text-center transform transition hover:-translate-y-1">
                    <FaUsers className="mx-auto text-3xl mb-2 text-indigo-500" />
                    <h3 className="text-gray-500 font-medium">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.users}</p>
                </div>
                <div className="glass p-6 rounded-3xl shadow-sm text-center transform transition hover:-translate-y-1">
                    <FaNewspaper className="mx-auto text-3xl mb-2 text-blue-500" />
                    <h3 className="text-gray-500 font-medium">Total Posts</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.posts}</p>
                </div>
                <div className="glass p-6 rounded-3xl shadow-sm text-center transform transition hover:-translate-y-1">
                    <FaComments className="mx-auto text-3xl mb-2 text-green-500" />
                    <h3 className="text-gray-500 font-medium">Total Comments</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.comments}</p>
                </div>
                <div className="glass p-6 rounded-3xl shadow-sm text-center transform transition hover:-translate-y-1">
                    <FaHeart className="mx-auto text-3xl mb-2 text-red-500" />
                    <h3 className="text-gray-500 font-medium">Total Likes</h3>
                    <p className="text-3xl font-bold text-gray-800">{stats.likes}</p>
                </div>
            </div>

            {/* Management Section */}
            <div className="glass rounded-3xl overflow-hidden shadow-sm mt-8">
                <div className="flex border-b border-gray-100">
                    <button 
                        onClick={() => setActiveTab('users')} 
                        className={`flex-1 py-4 font-bold text-lg transition ${activeTab === 'users' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        User Management
                    </button>
                    <button 
                        onClick={() => setActiveTab('posts')} 
                        className={`flex-1 py-4 font-bold text-lg transition ${activeTab === 'posts' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Recent Posts Overview
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'users' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-gray-100 text-gray-600">
                                        <th className="py-3 px-4">User</th>
                                        <th className="py-3 px-4">Email</th>
                                        <th className="py-3 px-4">Role</th>
                                        <th className="py-3 px-4 text-center">Posts</th>
                                        <th className="py-3 px-4">Joined</th>
                                        <th className="py-3 px-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b border-gray-50 hover:bg-white/50 transition">
                                            <td className="py-3 px-4 flex items-center space-x-3">
                                                <img 
                                                    src={u.profile_picture ? (u.profile_picture.startsWith('http') ? u.profile_picture : `http://localhost:5000${u.profile_picture}`) : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} 
                                                    alt="profile" 
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                />
                                                <div>
                                                    <div className="font-medium text-gray-800">{u.username}</div>
                                                    {u.bio && <div className="text-xs text-gray-500 truncate max-w-[150px]">{u.bio}</div>}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500">{u.email}</td>
                                            <td className="py-3 px-4">
                                                {u.is_admin ? (
                                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase">Admin</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase">User</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center font-medium text-blue-600">
                                                {u.post_count !== undefined ? u.post_count : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button 
                                                        onClick={() => navigate(`/admin/user/${u.id}`)}
                                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full text-sm shadow-sm transition flex items-center space-x-2"
                                                    >
                                                        <span>View Details</span>
                                                    </button>
                                                    
                                                    {!u.is_admin && u.id !== user.id && (
                                                        <button 
                                                            onClick={() => handleImpersonate(u.id)}
                                                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-full text-sm shadow-sm transition flex items-center space-x-2"
                                                        >
                                                            <FaUserSecret />
                                                            <span>Login As</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    {activeTab === 'posts' && (
                         <div className="overflow-x-auto">
                         <table className="w-full text-left border-collapse">
                             <thead>
                                 <tr className="border-b-2 border-gray-100 text-gray-600">
                                     <th className="py-3 px-4">Author</th>
                                     <th className="py-3 px-4">Content Preview</th>
                                     <th className="py-3 px-4 text-center">Likes</th>
                                     <th className="py-3 px-4 text-center">Comments</th>
                                     <th className="py-3 px-4">Posted On</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {posts.map(p => (
                                     <tr key={p.id} className="border-b border-gray-50 hover:bg-white/50 transition">
                                         <td className="py-3 px-4 font-bold text-gray-800">@{p.author_username}</td>
                                         <td className="py-3 px-4 text-gray-600 max-w-sm truncate">{p.content || "[Media Post]"}</td>
                                         <td className="py-3 px-4 text-center text-red-500 font-medium">{p.likes}</td>
                                         <td className="py-3 px-4 text-center text-blue-500 font-medium">{p.comments}</td>
                                         <td className="py-3 px-4 text-sm text-gray-400">{new Date(p.created_at).toLocaleDateString()}</td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                         <p className="text-gray-400 text-xs text-center mt-4">* To manage or delete a post, impersonate the respective author from the User Management tab.</p>
                     </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
