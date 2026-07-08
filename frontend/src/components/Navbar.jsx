import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaHome, FaCompass, FaBell, FaUser, FaSignOutAlt, FaSearch, FaEnvelope, FaUserShield } from 'react-icons/fa';
import api from '../utils/api';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications/unread');
      setUnreadCount(res.data.unread_count);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  React.useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchQuery.trim()) {
        navigate(`/search?q=${searchQuery}`);
    }
  }

  return (
    <nav className="glass sticky top-0 z-50 w-full h-16 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-600">
          SocialConnect
        </Link>

        {/* Search */}
        {user && (
          <form onSubmit={handleSearch} className="hidden md:flex w-1/3 relative">
            <input 
              type="text" 
              placeholder="Search users or posts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white bg-opacity-80 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 border border-gray-300 shadow-sm transition-all"
            />
            <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
          </form>
        )}

        {/* Icons */}
        <div className="flex gap-6 items-center">
          {user ? (
            <>
              <Link to="/" className="text-gray-600 hover:text-primary-500 transition-colors"><FaHome size={22} /></Link>
              <Link to="/explore" className="text-gray-600 hover:text-primary-500 transition-colors"><FaCompass size={22} /></Link>
              <Link to="/notifications" className="text-gray-600 hover:text-primary-500 transition-colors relative">
                  <FaBell size={22} />
                  {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                  )}
              </Link>
              <Link to="/messages" className="text-gray-600 hover:text-primary-500 transition-colors">
                  <FaEnvelope size={22} />
              </Link>
              {user?.is_admin && (
                  <Link to="/admin" className="text-red-600 hover:text-red-700 transition-colors">
                      <FaUserShield size={22} />
                  </Link>
              )}
              <Link to={`/profile/${user.id || user}`} className="text-gray-600 hover:text-primary-500 transition-colors flex items-center">
                  {user.profile_picture ? (
                      <img src={`http://localhost:5000${user.profile_picture}`} alt={user.username} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                      <FaUser size={22} />
                  )}
              </Link>
              <button onClick={handleLogout} className="text-gray-600 hover:text-red-500 transition-colors">
                  <FaSignOutAlt size={22} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 font-medium hover:text-primary-500 transition">Log in</Link>
              <Link to="/register" className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-full font-medium transition shadow-md shadow-primary-500/30">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
