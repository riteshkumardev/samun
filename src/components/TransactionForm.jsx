import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp, getDocs, onSnapshot, query } from 'firebase/firestore';

const TransactionForm = () => {
  const [formData, setFormData] = useState({
    memberName: '',
    otherName: '',
    type: 'Bachat',
    amount: '',
    interestRate: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]); // Interest logic ke liye zaroori hai
  const [currentCash, setCurrentCash] = useState(0);
  const [loading, setLoading] = useState(false);
  const [liveMemberStatus, setLiveMemberStatus] = useState(null);

  useEffect(() => {
    // 👥 Registered Members fetch karein
    const fetchMembers = async () => {
      const userSnapshot = await getDocs(collection(db, "users"));
      setMembers(userSnapshot.docs.map(doc => doc.data().name));
    };
    fetchMembers();

    // 💰 Live Transactions & Balance Listener
    const q = query(collection(db, "transactions"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalCr = 0, totalDr = 0;
      const transList = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        transList.push(data);
        const amt = Number(data.amount || 0);
        (data.type === 'Loan Dena' || data.type === 'Samuh Kharch') ? totalDr += amt : totalCr += amt;
      });
      setTransactions(transList);
      setCurrentCash(totalCr - totalDr);
    });
    return () => unsubscribe();
  }, []);

  // 📈 Member select karte hi uska "DUE INTEREST" calculate karna
  useEffect(() => {
    const name = formData.memberName === 'Other' ? formData.otherName : formData.memberName;
    if (!name) { setLiveMemberStatus(null); return; }

    const mt = transactions.filter(t => t.memberName === name.toUpperCase());
    const loanTaken = mt.filter(t => t.type === 'Loan Dena').reduce((s, t) => s + Number(t.amount), 0);
    const loanRepaid = mt.filter(t => t.type === 'Rin Vapsi').reduce((s, t) => s + Number(t.amount), 0);
    const pendingPrincipal = loanTaken - loanRepaid;

    // Byaj calculation
    let totalDueInterest = 0;
    const activeLoan = mt.find(t => t.type === 'Loan Dena');
    if (activeLoan && pendingPrincipal > 0) {
      const parts = activeLoan.date.split('/');
      const loanDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      const diffDays = Math.ceil(Math.abs(new Date() - loanDate) / (1000 * 60 * 60 * 24));
      const rate = activeLoan.interestRate || 2;
      totalDueInterest = (pendingPrincipal * rate * (diffDays / 30)) / 100;
    }

    setLiveMemberStatus({ pendingPrincipal, totalDueInterest: Math.round(totalDueInterest) });
  }, [formData.memberName, formData.otherName, transactions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalName = (formData.memberName === 'Other' ? formData.otherName : formData.memberName).trim().toUpperCase();
    const enterAmount = Number(formData.amount);
    const isLoan = formData.type === 'Loan Dena';
    
    setLoading(true);
    try {
      await addDoc(collection(db, "transactions"), {
        memberName: finalName,
        type: formData.type,
        amount: enterAmount,
        interestRate: isLoan ? Number(formData.interestRate) : null,
        // Calculation reference save karein taaki zero na ho
        calcStatus: liveMemberStatus ? `Prin:${liveMemberStatus.pendingPrincipal}|Int:${liveMemberStatus.totalDueInterest}` : "",
        date: new Date(formData.date).toLocaleDateString('hi-IN'), 
        timestamp: serverTimestamp()
      });
      
      alert("✅ Lenden Safaltapurvak Save Ho Gaya!");
      setFormData({ ...formData, memberName: '', otherName: '', amount: '', interestRate: '' });
    } catch (error) {
      alert("Error: " + error.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-2xl border-t-8 border-blue-900 no-print animate-in fade-in duration-500">
      
      {/* 💰 Live Stats Badge */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-2xl border text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase">Available Cash</p>
          <p className="font-black text-blue-900">₹{currentCash.toLocaleString('en-IN')}</p>
        </div>
        {liveMemberStatus && liveMemberStatus.pendingPrincipal > 0 && (
          <div className="bg-red-50 p-3 rounded-2xl border border-red-100 text-center animate-pulse">
            <p className="text-[10px] font-black text-red-400 uppercase">Due Int (Byaj)</p>
            <p className="font-black text-red-600 italic">₹{liveMemberStatus.totalDueInterest}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Lenden ki Tarikh</label>
          <input type="date" required className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-blue-50/30 font-bold outline-none"
            value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
        </div>

        <div className={formData.memberName === 'Other' ? 'md:col-span-1' : 'md:col-span-2'}>
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Sadasya Chunein</label>
          <select required className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 font-black focus:border-blue-600 outline-none"
            value={formData.memberName} onChange={(e) => setFormData({...formData, memberName: e.target.value})}>
            <option value="">-- Member Chunein --</option>
            {members.map((m, i) => <option key={i} value={m}>{m}</option>)}
            <option value="Other" className="text-blue-600 font-bold">+ Other</option>
          </select>
        </div>

        {formData.memberName === 'Other' && (
          <div className="animate-in slide-in-from-left-2 duration-300">
            <label className="text-[10px] font-black text-blue-600 uppercase ml-1">Naya Naam</label>
            <input type="text" required placeholder="Enter Name..." className="w-full p-4 border-2 border-blue-200 rounded-2xl bg-blue-50 font-black outline-none uppercase"
              value={formData.otherName} onChange={(e) => setFormData({...formData, otherName: e.target.value})} />
          </div>
        )}

        <div className="md:col-span-1">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Lenden Type</label>
          <select className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 font-black outline-none focus:border-blue-600"
            value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
            <optgroup label="Credit (Aaya)">
              <option value="Bachat">Saptahik Bachat</option>
              <option value="Rin Vapsi">Rin Vapsi (Principal)</option>
              <option value="Byaj">Byaj (Interest Only)</option>
            </optgroup>
            <optgroup label="Debit (Gaya)">
              <option value="Loan Dena">Loan Dena</option>
              <option value="Samuh Kharch">Samuh Kharch</option>
            </optgroup>
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Amount (Rashi)</label>
          <input type="number" required placeholder="₹ 0.00" className="w-full p-4 border-2 border-gray-50 rounded-2xl bg-gray-50 font-black text-xl text-blue-900 focus:border-blue-600 outline-none"
            value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
        </div>

        {formData.type === 'Loan Dena' && (
          <div className="md:col-span-2 p-4 bg-red-50 rounded-2xl border border-red-100 italic">
            <label className="text-[10px] font-black text-red-600 uppercase">Interest Rate (%)</label>
            <input type="number" required placeholder="2" className="w-full mt-1 p-3 border-b-2 border-red-200 bg-transparent font-black text-red-900 outline-none"
              value={formData.interestRate} onChange={(e) => setFormData({...formData, interestRate: e.target.value})} />
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