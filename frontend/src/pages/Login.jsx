import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to login. Check credentials.');
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="w-full max-w-md glass p-8 rounded-2xl shadow-xl space-y-8 animate-fade-in">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-600">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Log in to keep connecting.</p>
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
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white bg-opacity-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary-500 hover:text-primary-400">Forgot password?</Link>
            </div>
          </div>
          
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md hover:shadow-lg text-white bg-gradient-to-r from-primary-500 to-indigo-600 hover:opacity-90 font-medium transition-all transform hover:-translate-y-0.5">
            Sign In
          </button>
        </form>
        
        <div className="text-center text-sm text-gray-500">
          Don't have an account? <Link to="/register" className="font-semibold text-primary-500 hover:text-primary-600 transition">Sign up</Link>
        </div>
        
        <div className="text-center text-xs text-gray-400 pt-2">
          Authorized personnel only: <Link to="/admin-login" className="font-semibold text-gray-500 hover:text-red-500 transition">Admin Portal</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
