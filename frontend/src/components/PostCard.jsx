import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FaHeart, FaComment, FaShare, FaBookmark, FaRegHeart } from 'react-icons/fa';

const PostCard = ({ post, onLikeUpdate }) => {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes);
    const [saved, setSaved] = useState(false);

    // Comments State
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');

    const handleLike = async () => {
        try {
            if (liked) {
                await api.delete(`/posts/${post.id}/like`);
                setLikesCount(prev => prev - 1);
            } else {
                await api.post(`/posts/${post.id}/like`);
                setLikesCount(prev => prev + 1);
            }
            setLiked(!liked);
        } catch (error) { }
    };

    const handleSave = async () => {
        try {
            if (saved) {
                await api.delete(`/posts/${post.id}/save`);
            } else {
                await api.post(`/posts/${post.id}/save`);
            }
            setSaved(!saved);
        } catch (error) {}
    };

    const toggleComments = async () => {
        if (!showComments) {
            try {
                const res = await api.get(`/posts/${post.id}/comments`);
                setComments(res.data.comments || []);
            } catch (error) {}
        }
        setShowComments(!showComments);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if(!commentText.trim()) return;
        try {
            // Post comment then refetch to capture accurate user relational schema natively
            await api.post(`/posts/${post.id}/comments`, { content: commentText });
            const res = await api.get(`/posts/${post.id}/comments`);
            setComments(res.data.comments || []);
            setCommentText('');
        } catch (error) {}
    };

    return (
        <div className="glass p-5 rounded-2xl shadow-sm mb-6 animate-fade-in hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <Link to={`/profile/${post.author.id}`} className="flex items-center space-x-3 group">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-400 to-indigo-500 text-white flex items-center justify-center font-bold overflow-hidden shadow-sm">
                        {post.author.profile_picture ? <img src={`http://localhost:5000${post.author.profile_picture}`} alt="" className="w-full h-full object-cover"/> : post.author.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition">{post.author.username}</h4>
                        <span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</span>
                    </div>
                </Link>
                <button className="text-gray-400 hover:text-gray-600">
                    •••
                </button>
            </div>

            {/* Content */}
            <div className="mb-4 text-gray-800 whitespace-pre-wrap">
                <p>{post.content}</p>
                
                {post.media_url && (
                    <div className="mt-4 rounded-xl overflow-hidden shadow-md">
                        {post.post_type === 'video' ? (
                            <video src={`http://localhost:5000${post.media_url}`} controls className="w-full max-h-96 object-cover" />
                        ) : (
                            <img src={`http://localhost:5000${post.media_url}`} alt="Post Media" className="w-full max-h-96 object-cover" />
                        )}
                    </div>
                )}
            </div>

            {/* Footer Interactions */}
            <div className="flex justify-between items-center text-gray-500 border-t border-gray-100 pt-3 mt-2">
                <button 
                    onClick={handleLike} 
                    className={`flex items-center space-x-2 transition ${liked ? 'text-red-500' : 'hover:text-red-500'}`}
                >
                    {liked ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
                    <span className="font-medium text-sm">{likesCount}</span>
                </button>
                
                <button onClick={toggleComments} className="flex items-center space-x-2 hover:text-primary-500 transition">
                    <FaComment size={18} />
                    <span className="font-medium text-sm">{post.comments}</span>
                </button>
                
                <button className="flex items-center space-x-2 hover:text-green-500 transition">
                    <FaShare size={18} />
                </button>

                <button onClick={handleSave} className={`flex items-center space-x-2 transition ${saved ? 'text-indigo-500' : 'hover:text-indigo-500'}`}>
                    <FaBookmark size={18} />
                </button>
            </div>

            {/* Inline Comment Section */}
            {showComments && (
                <div className="mt-4 border-t border-gray-100/60 pt-4 animate-fade-in">
                    <form onSubmit={handleCommentSubmit} className="flex space-x-2 mb-4">
                        <input 
                            type="text" 
                            value={commentText} 
                            onChange={e => setCommentText(e.target.value)} 
                            className="flex-1 bg-white bg-opacity-60 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition" 
                            placeholder="Write a comment..." 
                        />
                        <button type="submit" className="text-white bg-primary-500 rounded-full px-4 py-2 text-sm font-bold shadow-sm hover:bg-primary-600 transition">Post</button>
                    </form>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {comments.length > 0 ? comments.map((c, i) => (
                            <div key={i} className="flex space-x-3 items-start">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-400 to-indigo-500 text-white flex shrink-0 items-center justify-center font-bold text-xs overflow-hidden shadow-sm">
                                    {c.author?.profile_picture ? <img src={`http://localhost:5000${c.author.profile_picture}`} className="w-full h-full object-cover"/> : c.author?.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 bg-white bg-opacity-50 p-3 rounded-2xl rounded-tl-sm text-sm border border-gray-100 shadow-sm">
                                    <b className="text-gray-800 focus:text-primary-500 block mb-1">{c.author?.username || 'User'}</b>
                                    <p className="text-gray-600 whitespace-pre-wrap">{c.content}</p>
                                </div>
                            </div>
                        )) : <p className="text-xs text-center text-gray-500 py-2">No comments yet. Start the conversation!</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostCard;
