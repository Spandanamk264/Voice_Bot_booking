import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, User, Lock, Mail, Phone } from 'lucide-react';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signup(fullName, email, password, phone);
      navigate('/login', { state: { message: "Account created successfully! Please log in." } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col md:flex-row-reverse">
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

          <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-dark-300 mb-8">Join us to experience AI-driven healthcare scheduling.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-dark-200">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-dark-400" />
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-dark-900/50 border border-dark-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-dark-200">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-dark-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-900/50 border border-dark-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-dark-200">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-dark-400" />
                <input 
                  type="text" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-dark-900/50 border border-dark-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-all"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-dark-200">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-dark-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-900/50 border border-dark-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-saffron-500 to-orange-500 text-white font-medium shadow-lg shadow-saffron-500/25 hover:shadow-saffron-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-8 text-center text-dark-300">
            Already have an account? <Link to="/login" className="text-saffron-500 font-medium hover:text-saffron-400 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="hidden md:flex w-1/2 relative bg-dark-900 border-r border-white/[0.02] overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent z-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/20 blur-[120px] rounded-full z-0"></div>
        
        <div className="relative z-10 max-w-md text-center">
          <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mx-auto mb-8 shadow-2xl backdrop-blur-sm">
            <User className="w-12 h-12 text-saffron-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Your Health Portal</h2>
          <p className="text-dark-300 text-lg">Securely manage your medical appointments and access your interaction history anywhere, anytime.</p>
        </div>
      </div>
    </div>
  );
}
