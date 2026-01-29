import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp, getDocs, onSnapshot, query } from 'firebase/firestore';

const TransactionForm = () => {
  const [formData, setFormData] = useState({
    memberName: '',
    otherName: '', // 'Other' ke liye extra field
    type: 'Bachat',
    amount: '',
    interestRate: '', // Sirf Loan ke waqt zarurat hogi
    date: new Date().toISOString().split('T')[0]
  });
  
  const [members, setMembers] = useState([]);
  const [currentCash, setCurrentCash] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 👥 Registered Members fetch karein
    const fetchMembers = async () => {
      const userSnapshot = await getDocs(collection(db, "users"));
      setMembers(userSnapshot.docs.map(doc => doc.data().name));
    };
    fetchMembers();

    // 💰 Live Balance Listener
    const q = query(collection(db, "transactions"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalCr = 0, totalDr = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const amt = Number(data.amount || 0);
        (data.type === 'Loan Dena' || data.type === 'Samuh Kharch') ? totalDr += amt : totalCr += amt;
      });
      setCurrentCash(totalCr - totalDr);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalName = formData.memberName === 'Other' ? formData.otherName : formData.memberName;
    const enterAmount = Number(formData.amount);
    const isLoan = formData.type === 'Loan Dena';
    const isDebit = isLoan || formData.type === 'Samuh Kharch';
    
    // Validations
    if (!finalName) return alert("⚠️ Kripya naam bharein!");
    if (isDebit && enterAmount > currentCash) return alert(`⚠️ Balance kam hai! Cash: ₹${currentCash}`);

    setLoading(true);
    try {
      await addDoc(collection(db, "transactions"), {
        memberName: finalName.trim().toUpperCase(),
        type: formData.type,
        amount: enterAmount,
        // ✅ Agar loan hai toh interest save karein, nahi toh null
        interestRate: isLoan ? Number(formData.interestRate) : null,
        date: new Date(formData.date).toLocaleDateString('hi-IN'), 
        timestamp: serverTimestamp()
      });
      
      alert("✅ Lenden Safaltapurvak Save Ho Gaya!");
      setFormData({ memberName: '', otherName: '', type: 'Bachat', amount: '', interestRate: '', date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      alert("Error: " + error.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-2xl border-t-8 border-blue-900 no-print animate-in fade-in duration-500">
      
      {/* 💰 Live Balance Badge */}
      <div className="mb-6 flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Samuh Cash</span>
        <span className={`px-4 py-1 rounded-full font-black text-sm shadow-sm ${currentCash < 1000 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          ₹{currentCash.toLocaleString('en-IN')}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* 📅 Date Input */}
        <div className="md:col-span-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Lenden ki Tarikh</label>
          <input type="date" required className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-blue-50/30 font-bold focus:border-blue-600 outline-none"
            value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
        </div>

        {/* 👤 Member Selection Box */}
        <div className={formData.memberName === 'Other' ? 'md:col-span-1' : 'md:col-span-2'}>
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Sadasya Chunein</label>
          <select required className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 font-black focus:border-blue-600 outline-none"
            value={formData.memberName} onChange={(e) => setFormData({...formData, memberName: e.target.value})}>
            <option value="">-- Member Chunein --</option>
            {members.map((m, i) => <option key={i} value={m}>{m}</option>)}
            <option value="Other" className="text-blue-600 font-bold">+ Other (Naya Naam)</option>
          </select>
        </div>

        {/* ➕ Other Name Popup (Input field) */}
        {formData.memberName === 'Other' && (
          <div className="animate-in slide-in-from-left-2 duration-300">
            <label className="text-[10px] font-black text-blue-600 uppercase ml-1">Naya Naam Likhein</label>
            <input type="text" required placeholder="Enter Name..." className="w-full p-4 border-2 border-blue-200 rounded-2xl bg-blue-50 font-black outline-none"
              value={formData.otherName} onChange={(e) => setFormData({...formData, otherName: e.target.value})} />
          </div>
        )}

        {/* 📝 Lenden Type */}
        <div className={formData.type === 'Loan Dena' ? 'md:col-span-1' : 'md:col-span-1'}>
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Lenden Type</label>
          <select className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 font-black outline-none focus:border-blue-600"
            value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
            <optgroup label="Credit (Aaya)">
              <option value="Bachat">Saptahik Bachat</option>
              <option value="Rin Vapsi">Rin Vapsi</option>
              <option value="Byaj">Byaj</option>
            </optgroup>
            <optgroup label="Debit (Gaya)">
              <option value="Loan Dena">Loan Dena</option>
              <option value="Samuh Kharch">Samuh Kharch</option>
            </optgroup>
          </select>
        </div>

        {/* 💰 Amount */}
        <div className="md:col-span-1">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Amount (Rashi)</label>
          <input type="number" required placeholder="₹ 0.00" className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 font-black text-xl text-blue-900 focus:border-blue-600 outline-none"
            value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
        </div>

        {/* 📈 Interest Rate (Sirf Loan par dikhega) */}
        {formData.type === 'Loan Dena' && (
          <div className="md:col-span-2 animate-in slide-in-from-top-2 duration-300">
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
              <label className="text-[10px] font-black text-red-600 uppercase">Interest Rate (%) - Masik</label>
              <input type="number" required placeholder="Example: 2% per month" className="w-full mt-1 p-3 border-b-2 border-red-200 bg-transparent font-black text-red-900 outline-none"
                value={formData.interestRate} onChange={(e) => setFormData({...formData, interestRate: e.target.value})} />
              <p className="text-[9px] text-red-400 mt-2 italic">* Yeh dar Member Details mein calculation ke waqt kaam aayegi.</p>
            </div>
          </div>
        )}

        <button disabled={loading} className={`md:col-span-2 mt-4 w-full py-5 rounded-3xl font-black text-xl text-white shadow-xl transition-all active:scale-95 ${loading ? 'bg-gray-400' : 'bg-blue-900 hover:shadow-blue-200'}`}>
          {loading ? 'PROCESSING...' : 'SAVE ENTRY'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;