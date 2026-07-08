import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import PostCard from '../components/PostCard';
import RightSidebar from '../components/RightSidebar';
import { FaSearch, FaUser, FaStickyNote } from 'react-icons/fa';

const Search = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'posts'

    useEffect(() => {
        if (initialQuery) {
            setSearchQuery(initialQuery);
            performSearch(initialQuery);
        } else {
            setLoading(false);
        }
    }, [initialQuery]);

    const performSearch = async (query) => {
        if (!query.trim()) {
            setUsers([]);
            setPosts([]);
            setLoading(false);
            return;
        }
        
        setLoading(true);
        try {
            const [usersRes, postsRes] = await Promise.all([
                api.get(`/search/users?q=${query}`),
                api.get(`/search/posts?q=${query}`)
            ]);
            setUsers(usersRes.data.users || []);
            setPosts(postsRes.data.posts || []);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        performSearch(searchQuery);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            <div className="md:col-span-3 lg:col-span-4 space-y-6">
                
                {/* Search Bar Top */}
                <div className="glass p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-center mb-8 relative gap-4">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-500 flex items-center">
                        <FaSearch className="text-primary-500 mr-3" /> Search
                    </h2>
                    <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
                        <input 
                            type="text" 
                            placeholder="Search users or posts..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white bg-opacity-70 rounded-full py-3 pl-12 pr-6 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition border border-gray-200"
                        />
                        <button type="submit" className="absolute left-4 top-4 text-gray-400 hover:text-primary-500">
                            <FaSearch />
                        </button>
                    </form>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`flex-1 py-3 text-center font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'users' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <FaUser /> Users ({users.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('posts')}
                        className={`flex-1 py-3 text-center font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'posts' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <FaStickyNote /> Posts ({posts.length})
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center font-bold text-primary-500 py-10 animate-pulse text-xl">Searching...</div>
                ) : (
                    <div>
                        {activeTab === 'users' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {users.length > 0 ? users.map(user => (
                                    <Link key={user.id} to={`/profile/${user.id}`} className="glass p-4 rounded-2xl flex items-center gap-4 hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer">
                                        <div>
                                            {user.profile_picture ? (
                                                <img src={`http://localhost:5000${user.profile_picture}`} alt={user.username} className="w-16 h-16 rounded-full object-cover border-2 border-primary-100" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-500">
                                                    <FaUser size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors">
                                                {user.full_name || user.username}
                                            </div>
                                            <p className="text-gray-500 text-sm">@{user.username}</p>
                                        </div>
                                    </Link>
                                )) : (
                                    <div className="col-span-full text-center glass py-12 rounded-3xl text-gray-500 text-lg">
                                        No users found matching "{searchQuery}".
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'posts' && (
                            <div className="space-y-6">
                                {posts.length > 0 ? posts.map(post => (
                                    <PostCard key={post.id} post={post} />
                                )) : (
                                    <div className="text-center glass py-12 rounded-3xl text-gray-500 text-lg">
                                        No posts found matching "{searchQuery}".
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block lg:col-span-1 border-l pl-4 border-gray-200/50">
                <RightSidebar />
            </div>
        </div>
    );
};

export default Search;
