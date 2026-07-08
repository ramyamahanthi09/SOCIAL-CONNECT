import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaUser, FaLock, FaBell, FaShieldAlt } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Settings = () => {
    const { user, setUser } = useContext(AuthContext);
    const [tab, setTab] = useState('account');

    // Account Tab State
    const [accountData, setAccountData] = useState({
        username: user?.username || '',
        bio: user?.bio || '',
    });

    // Privacy State
    const [privacyData, setPrivacyData] = useState({
        is_private: user?.is_private || false,
    });

    const handleAccountSave = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put('/auth/profile', accountData);
            setUser({ ...user, ...accountData });
            toast.success("Profile updated successfully");
        } catch (err) {
            toast.error("Failed to update profile");
        }
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
            {/* Sidebar nav for settings */}
            <div className="w-full md:w-64 glass p-4 rounded-3xl space-y-2 h-fit">
                <h3 className="font-bold text-gray-800 px-4 mb-4 text-lg">Settings</h3>
                <button 
                    onClick={() => setTab('account')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 transition font-medium ${tab === 'account' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-600 hover:bg-white hover:bg-opacity-50'}`}
                >
                    <FaUser /> <span>Account</span>
                </button>
                <button 
                    onClick={() => setTab('security')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 transition font-medium ${tab === 'security' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-600 hover:bg-white hover:bg-opacity-50'}`}
                >
                    <FaLock /> <span>Security</span>
                </button>
                <button 
                    onClick={() => setTab('notifications')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 transition font-medium ${tab === 'notifications' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-600 hover:bg-white hover:bg-opacity-50'}`}
                >
                    <FaBell /> <span>Notifications</span>
                </button>
                <button 
                    onClick={() => setTab('privacy')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 transition font-medium ${tab === 'privacy' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-600 hover:bg-white hover:bg-opacity-50'}`}
                >
                    <FaShieldAlt /> <span>Privacy</span>
                </button>
            </div>

            {/* Main Settings Panel */}
            <div className="flex-1 glass p-8 rounded-3xl min-h-[500px]">
                {tab === 'account' && (
                    <div className="animate-fade-in space-y-6">
                        <h2 className="text-2xl font-bold border-b pb-4 text-gray-800">Account Preferences</h2>
                        <form onSubmit={handleAccountSave} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input 
                                    type="text" 
                                    value={accountData.username} 
                                    onChange={e => setAccountData({...accountData, username: e.target.value})}
                                    className="w-full bg-white bg-opacity-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea 
                                    value={accountData.bio} 
                                    onChange={e => setAccountData({...accountData, bio: e.target.value})}
                                    rows="4"
                                    className="w-full bg-white bg-opacity-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none" 
                                ></textarea>
                            </div>
                            <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-8 rounded-full shadow-md transition transform hover:-translate-y-0.5">
                                Save Changes
                            </button>
                        </form>
                    </div>
                )}
                
                {tab === 'security' && (
                    <div className="animate-fade-in space-y-6">
                        <h2 className="text-2xl font-bold border-b pb-4 text-gray-800">Security Parameters</h2>
                        <p className="text-gray-500 text-sm">Update your password and secure your account.</p>
                        {/* Placeholder for Password Reset */}
                        <div className="space-y-4">
                            <input type="password" placeholder="Current Password" className="w-full bg-white bg-opacity-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition" />
                            <input type="password" placeholder="New Password" className="w-full bg-white bg-opacity-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition" />
                            <button className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-full shadow-md transition">Update Password</button>
                        </div>
                    </div>
                )}

                {tab === 'notifications' && (
                    <div className="animate-fade-in space-y-6">
                        <h2 className="text-2xl font-bold border-b pb-4 text-gray-800">Alert Configuration</h2>
                        <div className="space-y-4">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="form-checkbox h-5 w-5 text-primary-500 rounded border-gray-300" defaultChecked />
                                <span className="text-gray-700 font-medium">Email me when someone follows me</span>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" className="form-checkbox h-5 w-5 text-primary-500 rounded border-gray-300" defaultChecked />
                                <span className="text-gray-700 font-medium">Send push notifications for new likes</span>
                            </label>
                        </div>
                    </div>
                )}

                {tab === 'privacy' && (
                    <div className="animate-fade-in space-y-6">
                        <h2 className="text-2xl font-bold border-b pb-4 text-gray-800">Privacy & Visibility</h2>
                        <label className="flex items-center space-x-3 cursor-pointer p-4 bg-white bg-opacity-40 rounded-xl border border-gray-100 shadow-sm">
                            <input 
                                type="checkbox" 
                                checked={privacyData.is_private}
                                onChange={async (e) => {
                                    const newStatus = e.target.checked;
                                    setPrivacyData({ is_private: newStatus });
                                    try {
                                        await api.put('/auth/profile', { is_private: newStatus });
                                        setUser({ ...user, is_private: newStatus });
                                        toast.success("Privacy settings updated");
                                    } catch (err) {
                                        toast.error("Failed to update privacy settings");
                                        setPrivacyData({ is_private: !newStatus });
                                    }
                                }}
                                className="form-checkbox h-6 w-6 text-primary-500 rounded border-gray-300" 
                            />
                            <div>
                                <span className="text-gray-800 font-bold block">Private Account</span>
                                <span className="text-gray-500 text-sm">Only approved followers can see your posts. If enabled, your account and posts are private and hidden from non-followers.</span>
                            </div>
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
