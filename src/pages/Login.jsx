import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, Activity, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      if (email === 'admin@sarvamhealth.com') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-8 md:px-24 relative z-10">
        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-saffron-500 to-orange-500 flex items-center justify-center shadow-lg shadow-saffron-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Sarvam<span className="text-saffron-500">Health</span>
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-dark-300 mb-8">Sign in to manage your appointments and chat with our AI.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {successMessage && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-dark-200">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-dark-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-900/50 border border-dark-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-all placeholder:text-dark-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-dark-200">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-dark-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-900/50 border border-dark-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-all placeholder:text-dark-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-saffron-500 to-orange-500 text-white font-medium shadow-lg shadow-saffron-500/25 hover:shadow-saffron-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-dark-300">
            Don't have an account? <Link to="/signup" className="text-saffron-500 font-medium hover:text-saffron-400 transition-colors">Create one</Link>
          </p>
        </div>
      </div>

      <div className="hidden md:flex w-1/2 relative bg-dark-900 border-l border-white/[0.02] overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-saffron-500/5 to-transparent z-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-saffron-500/20 blur-[120px] rounded-full z-0"></div>
        
        <div className="relative z-10 max-w-md text-center">
          <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mx-auto mb-8 shadow-2xl backdrop-blur-sm">
            <Activity className="w-12 h-12 text-saffron-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Intelligent Healthcare</h2>
          <p className="text-dark-300 text-lg">Experience the next generation of patient care with our AI-powered voice assistant. Book appointments instantly.</p>
        </div>
      </div>
    </div>
  );
}
