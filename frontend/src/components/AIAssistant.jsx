import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { FaRobot, FaTimes, FaPaperPlane, FaMagic } from 'react-icons/fa';

const AIAssistant = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm your SocialConnect AI. How can I help you explore the platform today?" }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!prompt.trim() || isTyping) return;

        const userMessage = { role: 'user', content: prompt };
        setMessages(prev => [...prev, userMessage]);
        setPrompt('');
        setIsTyping(true);

        try {
            const res = await api.post('/ai/chat', { prompt });
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
        } catch (error) {
            console.error('AI Assistant Error:', error.response || error);
            const errorMessage = error.response?.status === 404 
                ? "I'm having trouble finding the AI service (404). Please ensure the backend is updated and restarted."
                : "I'm having a little trouble connecting. But I'm still here! You can ask me about Admin features, Messaging, or how to create posts.";
            
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: errorMessage 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const suggestedQuestions = [
        "What can an Admin do?",
        "How do I message followers?",
        "How do I change my privacy?",
        "Tell me about video posts"
    ];

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Bubble Toggle */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 active:scale-95 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-gradient-to-tr from-primary-600 to-indigo-600'}`}
            >
                {isOpen ? <FaTimes className="text-white text-xl" /> : <FaRobot className="text-white text-2xl" />}
                {!isOpen && (
                    <div className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-primary-500"></span>
                    </div>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-80 md:w-96 glass-dark border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up origin-bottom-right">
                    {/* Header */}
                    <div className="p-4 bg-white/10 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary-500/20 rounded-xl text-primary-400">
                                <FaMagic />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Platform Assistant</h3>
                                <div className="flex items-center space-x-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Online</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 h-[400px] overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-primary-600 text-white rounded-tr-none' 
                                    : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none space-x-1 flex items-center">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer / Input */}
                    <div className="p-4 bg-white/5 border-t border-white/10">
                        {/* Suggestions */}
                        {messages.length < 3 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {suggestedQuestions.map((q, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => {
                                            setPrompt(q);
                                        }}
                                        className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-400 transition"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSend} className="relative flex items-center">
                            <input 
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ask about SocialConnect..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary-500 transition-all placeholder:text-gray-600"
                            />
                            <button 
                                type="submit" 
                                disabled={isTyping}
                                className="absolute right-2 p-1.5 text-primary-400 hover:text-primary-300 transition disabled:opacity-50"
                            >
                                <FaPaperPlane />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAssistant;
