import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaHome, FaUser, FaBell, FaHashtag, FaCog, FaBookmark, FaEnvelope, FaUserShield } from 'react-icons/fa';

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="hidden md:block w-full">
            <div className="glass p-6 rounded-2xl shadow-sm space-y-8 sticky top-24">
                
                {/* Profile Summary */}
                {user && (
                    <div className="flex flex-col items-center border-b border-gray-200 pb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-400 to-indigo-500 shadow-md flex items-center justify-center text-white text-2xl font-bold mb-3 overflow-hidden">
                            {user.profile_picture ? (
                                <img src={`http://localhost:5000${user.profile_picture}`} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                                user.username.charAt(0).toUpperCase()
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">{user.username}</h2>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                )}

                {/* Navigation Links */}
                <nav className="space-y-2">
                    <Link to="/" className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white hover:bg-opacity-60 text-gray-700 hover:text-primary-600 transition font-medium">
                        <FaHome size={20} /> <span>Feed</span>
                    </Link>
                    <Link to="/explore" className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white hover:bg-opacity-60 text-gray-700 hover:text-primary-600 transition font-medium">
                        <FaHashtag size={20} /> <span>Explore</span>
                    </Link>
                    <Link to="/notifications" className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white hover:bg-opacity-60 text-gray-700 hover:text-primary-600 transition font-medium">
                        <FaBell size={20} /> <span>Notifications</span>
                    </Link>
                    <Link to="/messages" className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white hover:bg-opacity-60 text-gray-700 hover:text-primary-600 transition font-medium">
                        <FaEnvelope size={20} /> <span>Messages</span>
                    </Link>
                    <Link to="/saved" className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white hover:bg-opacity-60 text-gray-700 hover:text-primary-600 transition font-medium">
                        <FaBookmark size={20} /> <span>Bookmarks</span>
                    </Link>
                    <Link to={`/profile/${user?.id || user}`} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white hover:bg-opacity-60 text-gray-700 hover:text-primary-600 transition font-medium">
                        <FaUser size={20} /> <span>Profile</span>
                    </Link>
                    <Link to="/settings" className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white hover:bg-opacity-60 text-gray-700 hover:text-primary-600 transition font-medium">
                        <FaCog size={20} /> <span>Settings</span>
                    </Link>
                    {user?.is_admin && (
                        <Link to="/admin" className="flex items-center space-x-4 p-3 rounded-xl hover:bg-red-50 hover:bg-opacity-60 text-red-600 hover:text-red-700 transition font-bold border border-transparent hover:border-red-100 shadow-sm mt-4">
                            <FaUserShield size={20} /> <span>Admin Panel</span>
                        </Link>
                    )}
                </nav>

                <button 
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        document.querySelector('textarea')?.focus();
                    }}
                    className="w-full mt-4 bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition"
                >
                    Create Post
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
