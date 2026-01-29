import React, { useState } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const RegisterPage = ({ setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError("Password match nahi ho raha hai!");
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Naya User Safaltapurvak Ban Gaya!");
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      if(setView) setView('dashboard'); // Register ke baad wapas dashboard pe bhejne ke liye
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border-t-4 border-green-600">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 uppercase">Naya Operator Register Karein</h2>
      
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700">Email ID</label>
          <input 
            type="email" required
            className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="operator@samuh.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700">Password</label>
          <input 
            type="password" required
            className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700">Confirm Password</label>
          <input 
            type="password" required
            className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-600 text-sm font-bold">{error}</p>}

        <button 
          disabled={loading}
          type="submit" 
          className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition-all ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {loading ? 'Processing...' : 'USER BANAYEIN'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;