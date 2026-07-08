import React, { useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import EmojiPicker from 'emoji-picker-react';
import { FaImage, FaVideo, FaPaperclip, FaSmile } from 'react-icons/fa';

const CreatePost = ({ onPostCreated }) => {
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [showPicker, setShowPicker] = useState(false);

    const onEmojiClick = (emojiObject) => {
        setContent(prev => prev + emojiObject.emoji);
        setShowPicker(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!content && !file) {
            toast.warning('Post content cannot be empty.');
            return;
        }

        const formData = new FormData();
        formData.append('content', content);
        if (file) {
            formData.append('file', file);
        }

        try {
            const res = await api.post('/posts/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Post created!');
            setContent('');
            setFile(null);
            if (onPostCreated) onPostCreated(); // trigger a re-fetch in parent
        } catch (error) {
            toast.error('Failed to create post');
        }
    };

    return (
        <div className="glass p-5 rounded-2xl shadow-sm mb-6 flex space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-400 to-indigo-500 shadow-md flex-shrink-0"></div>
            
            <div className="flex-1">
                <form onSubmit={handleSubmit}>
                    <textarea 
                        className="w-full bg-white bg-opacity-40 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none transition-all placeholder-gray-500" 
                        rows="3" 
                        placeholder="What's happening?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                    
                    {file && (
                        <div className="mt-2 text-sm text-primary-600 flex items-center">
                            <FaPaperclip className="mr-2"/> {file.name} 
                            <button type="button" onClick={() => setFile(null)} className="ml-3 font-bold text-red-500">×</button>
                        </div>
                    )}

                    {showPicker && (
                        <div className="mt-3 w-full shadow-md rounded-xl overflow-hidden border border-gray-100 z-10 animate-fade-in relative">
                            <EmojiPicker onEmojiClick={onEmojiClick} theme="light" width="100%" height={350} />
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100/50">
                        <div className="flex space-x-4 text-primary-500">
                            <label className="cursor-pointer hover:text-indigo-600 transition flex items-center space-x-2">
                                <FaImage size={20} />
                                <input type="file" className="hidden" accept="image/*,video/*" onChange={(e)=>setFile(e.target.files[0])} />
                            </label>
                            <button type="button" onClick={() => setShowPicker(!showPicker)} className="hover:text-indigo-600 transition flex items-center"><FaSmile size={20} /></button>
                        </div>
                        <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-6 rounded-full shadow-md transition-all">
                            Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
