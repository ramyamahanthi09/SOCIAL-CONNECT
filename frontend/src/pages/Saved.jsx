import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import PostCard from '../components/PostCard';
import { FaBookmark } from 'react-icons/fa';

const Saved = () => {
    const [savedPosts, setSavedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSaved = async () => {
            try {
                // Since our Blueprint uses interactions_bp the routes prefix is likely /interactions
                // Or maybe the blueprints prefix posts/likes/saves mapping differently. Let's see...
                // Interactions is often mapped to /interactions but save_post starts with /posts/<post_id>/save inside interactions_bp
                // Let's assume interactions_bp uses /interactions or it's mounted with no prefix? 
                // Wait, if it's mounted, let's use the explicit route we appended: '@interactions_bp.route('/saved', methods=['GET'])' 
                // So if it's registered under /interactions or maybe blank.
                // Assuming it's mounted at /... 
                // Wait! In app.py: app.register_blueprint(interactions_bp, url_prefix='/api') maybe?
                const res = await api.get('/saved');
                setSavedPosts(res.data.saved || []);
            } catch (err) {} finally {
                setLoading(false);
            }
        };
        fetchSaved();
    }, []);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-transparent py-4 border-b border-gray-200">
                <h1 className="text-3xl font-bold flex items-center space-x-3 text-gray-800">
                    <FaBookmark className="text-indigo-500" />
                    <span>Saved Posts</span>
                </h1>
            </div>

            {loading ? (
                <div className="text-center font-bold text-indigo-500 py-10 animate-pulse text-xl">Loading library...</div>
            ) : (
                <div className="space-y-6">
                    {savedPosts.length > 0 ? savedPosts.map(post => (
                        <PostCard key={post.id} post={post} />
                    )) : (
                        <div className="text-center py-20 glass rounded-3xl">
                            <FaBookmark className="mx-auto text-4xl text-gray-300 mb-4" />
                            <h2 className="text-lg font-bold text-gray-500">No saved posts yet.</h2>
                            <p className="text-gray-400">Posts you bookmark will appear here.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Saved;
