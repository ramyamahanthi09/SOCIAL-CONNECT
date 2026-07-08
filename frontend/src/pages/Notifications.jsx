import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FaBell, FaHeart, FaComment, FaUserPlus, FaCheck, FaEnvelope } from 'react-icons/fa';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications/');
            setNotifications(res.data.notifications || []);
        } catch (err) {} finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {}
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            fetchNotifications();
        } catch (err) {}
    };

    const icons = {
        'like': <FaHeart className="text-red-500" size={20} />,
        'comment': <FaComment className="text-primary-500" size={20} />,
        'follow': <FaUserPlus className="text-indigo-500" size={20} />,
        'message': <FaEnvelope className="text-purple-500" size={20} />
    };

    if (loading) return <div className="text-center mt-10 text-primary-500 font-bold animate-pulse">Loading Notifications...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-transparent py-4 border-b border-gray-200">
                <h1 className="text-3xl font-bold flex items-center space-x-3 text-gray-800">
                    <FaBell className="text-primary-500" />
                    <span>Notifications</span>
                </h1>
                <button 
                    onClick={markAllRead} 
                    className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-2 transition"
                >
                    <FaCheck /> <span>Mark all as read</span>
                </button>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-20 glass rounded-3xl">
                        <FaBell className="mx-auto text-4xl text-gray-300 mb-4" />
                        <h2 className="text-lg font-bold text-gray-500">You're all caught up!</h2>
                    </div>
                ) : notifications.map(notif => (
                    <div 
                        key={notif.id} 
                        className={`p-6 rounded-2xl flex items-start space-x-4 transition shadow-sm ${notif.is_read ? 'glass opacity-70' : 'bg-white border hover:shadow-md'}`}
                        onClick={() => markAsRead(notif.id)}
                    >
                        <div className="p-3 bg-gray-50 rounded-full">
                            {icons[notif.type] || <FaBell className="text-gray-400" size={20} />}
                        </div>
                        <div className="flex-1 cursor-pointer">
                            <p className="text-gray-800 font-medium">
                                {notif.type === 'follow' && <span><b className="text-primary-500">{notif.related_user.username}</b> started following you</span>}
                                {notif.type === 'like' && <span><b className="text-primary-500">{notif.related_user.username}</b> liked your post</span>}
                                {notif.type === 'comment' && <span><b className="text-primary-500">{notif.related_user.username}</b> commented: "{notif.message}"</span>}
                                {notif.type === 'message' && <span><b className="text-primary-500">{notif.related_user.username}</b> {notif.message}</span>}
                            </p>
                            <span className="text-sm text-gray-400 mt-1 block">{new Date(notif.created_at).toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
