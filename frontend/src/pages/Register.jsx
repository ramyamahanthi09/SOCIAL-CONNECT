import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirm_password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    
    try {
      await api.post('/auth/register', formData);
      toast.success('Registration successful. Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register.');
    }
  };

  return (
    <div className="flex justify-center items-center py-10 min-h-[85vh]">
      <div className="w-full max-w-lg glass p-8 rounded-2xl shadow-xl space-y-8 animate-fade-in">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-600">Join SocialConnect</h2>
          <p className="text-gray-500 mt-2">Create an account to discover stories.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input 
                type="text" name="username" required value={formData.username} onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-white bg-opacity-50 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="johndoe123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input 
                type="text" name="full_name" value={formData.full_name} onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-white bg-opacity-50 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              type="email" name="email" required value={formData.email} onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 bg-white bg-opacity-50 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" name="password" required value={formData.password} onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 bg-white bg-opacity-50 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input 
                type="password" name="confirm_password" required value={formData.confirm_password} onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 bg-white bg-opacity-50 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button type="submit" className="w-full mt-4 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-white bg-gradient-to-r from-primary-500 to-indigo-600 hover:opacity-90 font-medium transition-all transform hover:-translate-y-0.5">
            Create Account
          </button>
        </form>
        
        <div className="text-center text-sm text-gray-500 border-t border-gray-200/50 pt-4">
          Already have an account? <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-600 transition">Log in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
