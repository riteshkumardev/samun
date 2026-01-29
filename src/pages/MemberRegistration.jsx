import React, { useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const MemberRegistration = () => {
  const [member, setMember] = useState({ name: '', mobile: '', interestRate: '2' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "users"), {
        name: member.name.trim(),
        mobile: member.mobile,
        interestRate: Number(member.interestRate),
        joiningDate: new Date().toLocaleDateString('hi-IN'),
        timestamp: serverTimestamp()
      });
      alert("✅ Naya Sadasya Safaltapurvak Jud Gaya!");
      setMember({ name: '', mobile: '', interestRate: '2' });
    } catch (err) {
      alert("Error: " + err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-3xl shadow-lg border-t-8 border-blue-900">
      <h2 className="text-xl font-black text-blue-900 mb-6 uppercase">👤 Naya Sadasya Ragister Karein</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">Sadasya ka Naam</label>
          <input type="text" required className="w-full p-3 border rounded-xl bg-gray-50 font-bold" 
            value={member.name} onChange={(e) => setMember({...member, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">Mobile Number</label>
          <input type="tel" className="w-full p-3 border rounded-xl bg-gray-50 font-bold" 
            value={member.mobile} onChange={(e) => setMember({...member, mobile: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">Interest Rate (%) - Mahina</label>
          <input type="number" className="w-full p-3 border rounded-xl bg-gray-50 font-bold" 
            value={member.interestRate} onChange={(e) => setMember({...member, interestRate: e.target.value})} />
        </div>
        <button disabled={loading} className="w-full py-4 bg-blue-900 text-white rounded-2xl font-black hover:bg-blue-800 transition-all">
          {loading ? 'SAVING...' : 'SADASYA BANAYEIN'}
        </button>
      </form>
    </div>
  );
};

export default MemberRegistration;