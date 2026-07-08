import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUserShield } from 'react-icons/fa';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Admin access verified!');
      // Assuming context updates the user, component might unmount or re-render
      // We push them to the admin dashboard manually.
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Access denied. Check credentials.');
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="w-full max-w-md glass border-2 border-red-100 p-8 rounded-2xl shadow-xl space-y-8 animate-fade-in relative overflow-hidden">
        
        {/* Admin Background Accent */}
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <FaUserShield size={120} />
        </div>

        <div className="text-center relative z-10">
          <h2 className="text-3xl font-bold flex items-center justify-center space-x-3 text-red-600">
            <FaUserShield /> 
            <span>Admin Gateway</span>
          </h2>
          <p className="text-gray-500 mt-2 font-medium">Restricted access portal.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-gray-700">Administrator Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white bg-opacity-70 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              placeholder="admin@socialconnect.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Administrator Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white bg-opacity-70 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm ml-auto">
              <Link to="/forgot-password" className="font-medium text-red-500 hover:text-red-400">Forgot credentials?</Link>
            </div>
          </div>
          
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md hover:shadow-lg text-white bg-gradient-to-r from-red-600 to-red-800 hover:opacity-90 font-medium transition-all transform hover:-translate-y-0.5">
            Authenticate System Access
          </button>
        </form>
        
        <div className="text-center text-sm text-gray-500 relative z-10 mt-6 pt-4 border-t border-gray-100">
           Not an admin? <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-600 transition">Go back to normal login</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
