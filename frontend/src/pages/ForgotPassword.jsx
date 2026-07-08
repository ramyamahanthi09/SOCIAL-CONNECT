import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email, new_password: newPassword });
      toast.success(res.data.message || 'Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="w-full max-w-md glass p-8 rounded-2xl shadow-xl space-y-8 animate-fade-in">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-600">Reset Password</h2>
          <p className="text-gray-500 mt-2">Enter your email and a new password.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white bg-opacity-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input 
              type="password" 
              required
              value={newPassword}
              onChange={(e)=>setNewPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white bg-opacity-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              minLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md hover:shadow-lg text-white bg-gradient-to-r from-primary-500 to-indigo-600 hover:opacity-90 font-medium transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
        </form>
        
        <div className="text-center text-sm text-gray-500">
          Remembered your password? <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-600 transition">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
