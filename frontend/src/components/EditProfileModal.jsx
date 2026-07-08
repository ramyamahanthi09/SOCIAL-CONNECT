import React, { useState } from 'react';
import { FaTimes, FaCamera } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        bio: user?.bio || '',
        location: user?.location || '',
        website: user?.website || ''
    });
    const [profilePic, setProfilePic] = useState(null);
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [previews, setPreviews] = useState({
        profile: user?.profile_picture ? `http://localhost:5000${user.profile_picture}` : null,
        cover: user?.cover_photo ? `http://localhost:5000${user.cover_photo}` : null
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleTextChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (e.target.name === 'profile_picture') {
                setProfilePic(file);
                setPreviews({ ...previews, profile: URL.createObjectURL(file) });
            } else {
                setCoverPhoto(file);
                setPreviews({ ...previews, cover: URL.createObjectURL(file) });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            submitData.append(key, formData[key]);
        });

        if (profilePic) submitData.append('profile_picture', profilePic);
        if (coverPhoto) submitData.append('cover_photo', coverPhoto);

        try {
            await api.put('/auth/profile', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Profile updated successfully!");
            onUpdate();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="glass w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300 my-auto">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
                        <FaTimes size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Cover Photo Upload */}
                    <div className="relative group h-40 rounded-2xl bg-gray-100 overflow-hidden shadow-inner">
                        {previews.cover ? (
                            <img src={previews.cover} className="w-full h-full object-cover" alt="Cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-indigo-400 to-purple-400" />
                        )}
                        <label className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center cursor-pointer transition-all">
                            <FaCamera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                            <input type="file" name="cover_photo" onChange={handleFileChange} className="hidden" accept="image/*" />
                        </label>
                    </div>

                    {/* Profile Picture Upload */}
                    <div className="relative -mt-16 ml-6 w-32 h-32">
                        <div className="w-full h-full rounded-full border-4 border-white shadow-xl overflow-hidden bg-white group relative">
                            {previews.profile ? (
                                <img src={previews.profile} className="w-full h-full object-cover" alt="Avatar" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-3xl font-bold text-gray-400">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <label className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center cursor-pointer transition-all">
                                <FaCamera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                                <input type="file" name="profile_picture" onChange={handleFileChange} className="hidden" accept="image/*" />
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 ml-1">Full Name</label>
                            <input 
                                type="text" name="full_name" value={formData.full_name} onChange={handleTextChange}
                                className="w-full p-3 bg-white bg-opacity-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition"
                                placeholder="Enter full name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 ml-1">Location</label>
                            <input 
                                type="text" name="location" value={formData.location} onChange={handleTextChange}
                                className="w-full p-3 bg-white bg-opacity-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition"
                                placeholder="Where are you?"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600 ml-1">Website</label>
                        <input 
                            type="url" name="website" value={formData.website} onChange={handleTextChange}
                            className="w-full p-3 bg-white bg-opacity-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition"
                            placeholder="https://yourwebsite.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600 ml-1">Bio</label>
                        <textarea 
                            name="bio" value={formData.bio} onChange={handleTextChange} rows="3"
                            className="w-full p-3 bg-white bg-opacity-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition resize-none"
                            placeholder="Tell the world about yourself..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-full transition">
                            Cancel
                        </button>
                        <button 
                            type="submit" disabled={loading}
                            className="px-8 py-2 bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-semibold rounded-full shadow-lg shadow-primary-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
