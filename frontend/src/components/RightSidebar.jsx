import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const RightSidebar = () => {
  const [trending, setTrending] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Fetch Trending
    api.get('/hashtags/trending').then(res => {
      setTrending(res.data.trending_hashtags || []);
    }).catch(()=>{});

    // Fetch Suggestions
    api.get('/users/suggestions').then(res => {
      setSuggestions(res.data.suggestions || []);
    }).catch(()=>{});
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Trending Box */}
      <div className="glass p-5 rounded-2xl shadow-sm">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Trending Now</h3>
        {trending.length > 0 ? (
          <div className="space-y-3">
            {trending.map((t, i) => (
              <div key={i} className="flex justify-between items-center cursor-pointer hover:bg-white hover:bg-opacity-50 p-2 rounded-lg transition">
                <span className="font-semibold text-primary-500">#{t.hashtag}</span>
                <span className="text-xs text-gray-500">{t.usage_count} posts</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No trending topics yet.</p>
        )}
      </div>

      {/* Suggested Users Box */}
      <div className="glass p-5 rounded-2xl shadow-sm">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Who to follow</h3>
        <div className="space-y-4">
          {suggestions.map((user) => (
            <div key={user.id} className="flex justify-between items-center">
              <Link to={`/profile/${user.id}`} className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-400 to-indigo-500 text-white flex items-center justify-center font-bold overflow-hidden">
                  {user.profile_picture ? <img src={`http://localhost:5000${user.profile_picture}`} alt="" className="w-full h-full object-cover"/> : user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="font-medium text-gray-800 text-sm">{user.full_name || user.username}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
              </Link>
              <button 
                onClick={async () => {
                  try {
                    await api.post(`/users/${user.id}/follow`);
                    // Refresh suggestions
                    const res = await api.get('/users/suggestions');
                    setSuggestions(res.data.suggestions || []);
                  } catch (e) {
                    console.error("Follow failed", e);
                  }
                }}
                className="text-primary-500 font-semibold text-sm hover:underline"
              >
                Follow
              </button>
            </div>
          ))}
          {suggestions.length === 0 && <p className="text-gray-500 text-sm">No suggestions right now.</p>}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
