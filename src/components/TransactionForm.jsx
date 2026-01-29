import React, { useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const TransactionForm = () => {
  const [formData, setFormData] = useState({
    memberName: '',
    type: 'Bachat',
    amount: '',
    mobile: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Firebase mein data save ho raha hai
      await addDoc(collection(db, "transactions"), {
        memberName: formData.memberName,
        type: formData.type,
        amount: Number(formData.amount),
        mobile: formData.mobile,
        // Bharat/Bihar ke standard date format ke liye
        date: new Date().toLocaleDateString('hi-IN'), 
        timestamp: serverTimestamp()
      });
      
      alert("✅ Lenden Safaltapurvak Save Ho Gaya!");
      
      // Form reset karein
      setFormData({ memberName: '', type: 'Bachat', amount: '', mobile: '' });
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xl border-t-8 border-blue-900 no-print">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Nayi Lenden Entry</h2>
        <p className="text-sm text-gray-500 font-bold italic">Bihar Samuh Management System</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sadasya ka Naam */}
        <div className="md:col-span-2">
          <label className="block text-sm font-black text-gray-700 uppercase mb-1">Sadasya ka Naam (Member Name)</label>
          <input 
            type="text" 
            required
            placeholder="Naam likhein..."
            className="w-full p-4 border-2 border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-lg"
            value={formData.memberName}
            onChange={(e) => setFormData({...formData, memberName: e.target.value})}
          />
        </div>

        {/* Lenden ka Prakar (Debit/Credit logic yahan hai) */}
        <div>
          <label className="block text-sm font-black text-gray-700 uppercase mb-1">Lenden ka Prakar (Type)</label>
          <select 
            className="w-full p-4 border-2 border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold appearance-none"
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
          >
            <optgroup label="Credit (Paisa Aaya)">
              <option value="Bachat">Saptahik Bachat (Saving)</option>
              <option value="Rin Vapsi">Rin Vapsi (Loan Repayment)</option>
              <option value="Byaj">Byaj (Interest)</option>
              <option value="Dand">Dand (Fine/Penalty)</option>
            </optgroup>
            <optgroup label="Debit (Paisa Gaya)">
              <option value="Loan Dena">Loan Dena (Issue Loan)</option>
              <option value="Samuh Kharch">Samuh Kharch (Expenses)</option>
            </optgroup>
          </select>
        </div>

        {/* Rashi (Amount) */}
        <div>
          <label className="block text-sm font-black text-gray-700 uppercase mb-1">Rashi (Amount)</label>
          <div className="relative">
            <span className="absolute left-4 top-4 font-bold text-gray-400">₹</span>
            <input 
              type="number" 
              required
              className="w-full p-4 pl-10 border-2 border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
          </div>
        </div>

        {/* Mobile Number (Optional) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-black text-gray-700 uppercase mb-1">Mobile No. (Yadi ho)</label>
          <input 
            type="tel" 
            className="w-full p-4 border-2 border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
            placeholder="+91"
            value={formData.mobile}
            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
          />
        </div>

        {/* Submit Button */}
        <button 
          disabled={loading}
          className={`md:col-span-2 mt-4 w-full py-5 rounded-xl font-black text-xl text-white shadow-xl transform active:scale-95 transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800'}`}
        >
          {loading ? 'SAVING DATA...' : '✅ DATA SAVE KAREIN'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;