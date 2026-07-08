import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchFeed = async (reset = false) => {
        try {
            setLoading(true);
            const res = await api.get(`/posts/feed?page=${reset ? 1 : page}`);
            if (reset) {
                setPosts(res.data.posts);
                setPage(2);
            } else {
                setPosts(prev => [...prev, ...res.data.posts]);
                setPage(prev => prev + 1);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed(true);
    }, []);

    const handleNewPost = () => {
        fetchFeed(true);
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {/* Left Sidebar Menu */}
            <div className="md:col-span-1 lg:col-span-1">
                <Sidebar />
            </div>

            {/* Main Feed Content */}
            <div className="md:col-span-2 lg:col-span-3">
                <CreatePost onPostCreated={handleNewPost} />
                
                <div className="space-y-6">
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}

                    {posts.length === 0 && !loading && (
                        <div className="text-center py-10 glass rounded-2xl">
                            <h3 className="text-xl font-bold text-gray-700">No posts yet!</h3>
                            <p className="text-gray-500">Follow people or create your first post.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-6 text-primary-500 font-bold animate-pulse">
                            Loading more...
                        </div>
                    )}

                    {posts.length > 0 && !loading && (
                        <button onClick={() => fetchFeed()} className="w-full bg-white bg-opacity-60 hover:bg-opacity-80 transition py-3 rounded-xl font-medium shadow-sm border border-gray-100 text-gray-600">
                            Load More
                        </button>
                    )}
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
                <RightSidebar />
            </div>
        </div>
    );
};

export default Home;
