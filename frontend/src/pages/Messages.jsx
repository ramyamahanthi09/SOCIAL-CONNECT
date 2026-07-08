import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaImage, FaVideo, FaPaperclip, FaFileAlt } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';

const Messages = () => {
    const { user } = useContext(AuthContext);
    const { userId } = useParams();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeUser, setActiveUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [file, setFile] = useState(null);
    const messagesEndRef = useRef(null);

    // Fetch conversations list
    useEffect(() => {
        fetchConversations();
        if (user) {
            fetchContacts();
        }
        const interval = setInterval(fetchConversations, 5000); // Poll conversations
        return () => clearInterval(interval);
    }, [user]);

    const fetchContacts = async () => {
        try {
            // Fetch both followers and following to create a 'Contacts' list
            const [followersRes, followingRes] = await Promise.all([
                api.get(`/users/${user.id}/followers`),
                api.get(`/users/${user.id}/following`)
            ]);
            
            const followers = followersRes.data.followers || [];
            const following = followingRes.data.following || [];
            
            // Merge and remove duplicates based on ID
            const merged = [...followers, ...following];
            const uniqueContacts = Array.from(new Map(merged.map(item => [item.id, item])).values());
            
            setContacts(uniqueContacts);
        } catch (error) {
            console.error('Failed to fetch contacts');
        }
    };

    // Set active user when jumping from URL or conversations
    useEffect(() => {
        if (userId) {
            handleSelectUser(userId);
        } else {
            setActiveUser(null);
            setMessages([]);
        }
    }, [userId]);

    // Poll messages if active user is selected
    useEffect(() => {
        let interval;
        if (activeUser) {
            fetchMessages(activeUser.id);
            interval = setInterval(() => fetchMessages(activeUser.id), 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeUser]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await api.get('/messages/conversations');
            setConversations(res.data.conversations || []);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMessages = async (targetUserId) => {
        try {
            const res = await api.get(`/messages/${targetUserId}`);
            setMessages(res.data.messages || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSelectUser = async (targetUserId) => {
        try {
            const res = await api.get(`/users/id/${targetUserId}`);
            setActiveUser(res.data);
            navigate(`/messages/${targetUserId}`);
            fetchMessages(targetUserId);
        } catch (error) {
            toast.error('Could not load user data');
            navigate('/messages');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !file) return;

        const formData = new FormData();
        formData.append('content', newMessage.trim());
        if (file) {
            formData.append('file', file);
        }

        try {
            const res = await api.post(`/messages/${activeUser.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessages([...messages, res.data]);
            setNewMessage('');
            setFile(null);
            fetchConversations(); // refresh sidebar instantly
            scrollToBottom();
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    const renderMessageMedia = (msg) => {
        if (!msg.media_url) return null;
        
        switch (msg.message_type) {
            case 'video':
                return <video src={`http://localhost:5000${msg.media_url}`} controls className="max-w-full rounded-xl mt-2 max-h-60 object-cover" />;
            case 'image':
                return <img src={`http://localhost:5000${msg.media_url}`} alt="Attached" className="max-w-full rounded-xl mt-2 max-h-60 object-cover border border-white/20" />;
            case 'file':
            default:
                return (
                    <a href={`http://localhost:5000${msg.media_url}`} target="_blank" rel="noreferrer" className="flex items-center space-x-2 mt-2 px-3 py-2 bg-indigo-500/20 text-indigo-100 rounded-lg max-w-fit hover:bg-indigo-500/40 transition">
                        <FaFileAlt />
                        <span className="text-sm truncate max-w-[200px]">Download File</span>
                    </a>
                );
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] w-full gap-6">
            {/* Conversations Sidebar */}
            <div className={`w-full md:w-80 glass flex flex-col rounded-3xl overflow-hidden shadow-sm ${userId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-5 border-b border-gray-100/50">
                    <h2 className="text-xl font-bold text-gray-800">Messages</h2>
                </div>

                {/* Contacts to message */}
                <div className="px-5 py-3 border-b border-gray-100/30">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Your Contacts</h3>
                    <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                        {contacts.length === 0 ? (
                            <p className="text-[10px] text-gray-400 italic">No contacts yet.</p>
                        ) : (
                            contacts.map(c => (
                                <div 
                                    key={c.id} 
                                    onClick={() => handleSelectUser(c.id)}
                                    className="flex flex-col items-center space-y-1 cursor-pointer group flex-shrink-0"
                                >
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-400 to-purple-400 flex-shrink-0 text-white font-bold flex items-center justify-center border-2 border-transparent group-hover:border-primary-400 transition-all shadow-sm">
                                        {c.profile_picture ? (
                                            <img src={c.profile_picture.startsWith('http') ? c.profile_picture : `http://localhost:5000${c.profile_picture}`} alt={c.username} className="w-full h-full object-cover" />
                                        ) : c.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-[10px] text-gray-600 font-medium truncate w-12 text-center">{c.username}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                
                <div className="overflow-y-auto flex-1 p-3 space-y-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Recent Chats</h3>
                    {conversations.length === 0 ? (
                        <p className="text-center text-gray-500 text-sm mt-10">No conversations yet.</p>
                    ) : (
                        conversations.map((conv) => (
                            <div 
                                key={conv.user.id} 
                                onClick={() => handleSelectUser(conv.user.id)}
                                className={`flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition ${activeUser?.id === conv.user.id ? 'bg-primary-500/10 border-primary-200 border' : 'hover:bg-white/50 border border-transparent'}`}
                            >
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-400 to-purple-400 flex-shrink-0 text-white font-bold flex items-center justify-center">
                                    {conv.user.profile_picture ? (
                                        <img src={conv.user.profile_picture.startsWith('http') ? conv.user.profile_picture : `http://localhost:5000${conv.user.profile_picture}`} alt={conv.user.username} className="w-full h-full object-cover" />
                                    ) : conv.user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="font-bold text-gray-900 truncate text-sm">{conv.user.username}</h4>
                                    </div>
                                    <p className={`truncate text-sm ${!conv.is_read && conv.user.id !== activeUser?.id ? 'font-bold text-primary-600' : 'text-gray-500'}`}>
                                        {conv.last_message || 'Media message'}
                                    </p>
                                </div>
                                {!conv.is_read && activeUser?.id !== conv.user.id && (
                                    <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 shadow-sm"></div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 glass flex flex-col rounded-3xl overflow-hidden shadow-sm relative ${!userId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                {!activeUser ? (
                    <div className="text-center text-gray-400 animate-fade-in">
                        <FaPaperPlane className="mx-auto text-5xl mb-4 opacity-50" />
                        <h3 className="text-xl font-medium text-gray-600 mb-2">Your Messages</h3>
                        <p>Select a contact to start messaging.</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-gray-100/50 bg-white/40 flex items-center shadow-sm z-10 space-x-4">
                            <button onClick={() => navigate('/messages')} className="md:hidden text-gray-500 p-2 rounded-full hover:bg-white transition">
                                ←
                            </button>
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-400 to-purple-400 flex-shrink-0 text-white font-bold flex items-center justify-center shadow-sm">
                                {activeUser.profile_picture ? (
                                    <img src={activeUser.profile_picture.startsWith('http') ? activeUser.profile_picture : `http://localhost:5000${activeUser.profile_picture}`} alt={activeUser.username} className="w-full h-full object-cover" />
                                ) : activeUser.username.charAt(0).toUpperCase()}
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">{activeUser.username}</h3>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((msg, index) => {
                                const isMine = msg.sender_id === user.id;
                                return (
                                    <div key={index} className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm flex flex-col ${isMine ? 'bg-gradient-to-br from-primary-500 to-indigo-600 text-white rounded-tr-sm' : 'bg-white bg-opacity-70 text-gray-800 rounded-tl-sm border border-gray-100'}`}>
                                            {msg.content && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                                            {renderMessageMedia(msg)}
                                            <span className={`text-[10px] mt-2 block self-end ${isMine ? 'text-indigo-100' : 'text-gray-400'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 bg-white/40 border-t border-gray-100/50">
                            {file && (
                                <div className="mb-3 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl flex justify-between items-center text-sm text-indigo-700 animate-fade-in shadow-sm">
                                    <div className="flex items-center space-x-2 truncate">
                                        <FaPaperclip />
                                        <span className="truncate">{file.name}</span>
                                    </div>
                                    <button onClick={() => setFile(null)} className="font-bold text-red-500 ml-4 hover:bg-red-50 p-1 rounded-full px-2 transition">×</button>
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="flex gap-2 relative items-end">
                                <div className="flex-1 relative">
                                    <textarea 
                                        className="w-full bg-white bg-opacity-80 py-3 pr-20 pl-5 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 resize-none transition-all shadow-sm max-h-32 min-h-[50px]"
                                        placeholder="Type a message..."
                                        rows="1"
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = (e.target.scrollHeight) + 'px';
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                    {/* Action Buttons inside Textarea */}
                                    <div className="absolute right-3 bottom-2.5 flex space-x-2 text-gray-400">
                                        <label className="cursor-pointer hover:text-indigo-500 transition p-1 hover:bg-gray-50 rounded-full">
                                            <FaImage />
                                            <input type="file" className="hidden" accept="image/*,video/*,.pdf,.doc,.zip" onChange={(e) => setFile(e.target.files[0])} />
                                        </label>
                                    </div>
                                </div>
                                <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 shadow-md transition transform hover:scale-105 active:scale-95">
                                    <FaPaperPlane className="ml-1" />
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Messages;
