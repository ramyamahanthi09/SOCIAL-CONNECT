import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import PostCard from '../components/PostCard';
import RightSidebar from '../components/RightSidebar';
import { FaFire, FaSearch } from 'react-icons/fa';

const Explore = () => {
    const [explorePosts, setExplorePosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchExploreContent = async () => {
            try {
                const res = await api.get('/explore');
                setExplorePosts(res.data.explore || []);
            } catch (err) {} finally {
                setLoading(false);
            }
        };
        fetchExploreContent();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        if(!searchTerm.trim()){
           const res = await api.get('/explore');
           setExplorePosts(res.data.explore || []);
        } else {
           const res = await api.get(`/search/posts?q=${searchTerm}`);
           setExplorePosts(res.data.posts || []);
        }
        setLoading(false);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            <div className="md:col-span-3 lg:col-span-4 space-y-6">
                
                {/* Search Bar Top */}
                <div className="glass p-6 rounded-3xl shadow-sm flex items-center mb-8 relative">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-500 mr-8 flex items-center">
                        <FaFire className="text-orange-500 mr-3" /> Explore
                    </h2>
                    <form onSubmit={handleSearch} className="flex-1 hidden md:block relative">
                        <input 
                            type="text" 
                            placeholder="Search topics, hashtags, content..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white bg-opacity-70 rounded-full py-3 pl-12 pr-6 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition border border-gray-200"
                        />
                        <button type="submit" className="absolute left-4 top-4 text-gray-400 hover:text-primary-500">
                            <FaSearch />
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="text-center font-bold text-primary-500 py-10 animate-pulse text-xl">Discovering Content...</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 auto-rows-max">
                        {explorePosts.length > 0 ? explorePosts.map(post => (
                            <PostCard key={post.id} post={post} />
                        )) : (
                            <div className="col-span-full text-center glass py-12 rounded-3xl text-gray-500 text-lg">
                                No content matches your exploration. Try a different search!
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right Sidebar for Trending/Suggestions */}
            <div className="hidden lg:block lg:col-span-1 border-l pl-4 border-gray-200/50">
                <RightSidebar />
            </div>
        </div>
    );
};

export default Explore;
