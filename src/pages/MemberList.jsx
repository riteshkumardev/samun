import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedCalc, setSelectedCalc] = useState(null);

  useEffect(() => {
    // 1. Members ko hamesha naam ke hisab se mangwayein
    const qMembers = query(collection(db, "users"), orderBy("name", "asc"));
    const unsubMembers = onSnapshot(qMembers, (snap) => {
      setMembers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Transactions ko hamesha latest mangwayein
    const qTrans = query(collection(db, "transactions"), orderBy("timestamp", "desc"));
    const unsubTrans = onSnapshot(qTrans, (snap) => {
      setTransactions(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    return () => { unsubMembers(); unsubTrans(); };
  }, []);

  const getMemberSummary = (m) => {
    // 🔍 Case-Insensitive Match (RITESH aur ritesh ko ek hi maane)
    const mt = transactions.filter(t => t.memberName?.trim().toLowerCase() === m.name?.trim().toLowerCase());
    
    // 🛠️ Sabhi amounts ko Number() mein convert karna zaroori hai
    const savings = mt.filter(t => t.type === 'Bachat').reduce((s, t) => s + Number(t.amount || 0), 0);
    const loanTaken = mt.filter(t => t.type === 'Loan Dena').reduce((s, t) => s + Number(t.amount || 0), 0);
    const loanRepaid = mt.filter(t => t.type === 'Rin Vapsi').reduce((s, t) => s + Number(t.amount || 0), 0);
    const interestPaid = mt.filter(t => t.type === 'Byaj').reduce((s, t) => s + Number(t.amount || 0), 0);

    const pendingLoan = loanTaken - loanRepaid;
    let liveInterest = 0;
    let days = 0;

    // 📅 Latest Loan Entry se interest nikalna
    const activeLoan = mt.find(t => t.type === 'Loan Dena');
    if (activeLoan && activeLoan.date && pendingLoan > 0) {
      const parts = activeLoan.date.split('/');
      const loanDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      const today = new Date();
      days = Math.ceil(Math.abs(today - loanDate) / (1000 * 60 * 60 * 24));
      
      // Interest Formula: (Principal * Rate * Days/30) / 100
      liveInterest = (pendingLoan * Number(m.interestRate || 2) * (days / 30)) / 100;
    }

    // 💰 FINAL BALANCE: Isme humne 'Interest Paid' ko minus kiya hai
    const finalNetBalance = (pendingLoan + liveInterest) - interestPaid;

    return { 
      savings, pendingLoan, interestPaid, 
      liveInterest: Math.round(liveInterest),
      finalNetBalance: Math.round(finalNetBalance),
      breakdown: { loanAmt: pendingLoan, days, rate: m.interestRate || 2, name: m.name }
    };
  };

  return (
    <div className="max-w-6xl mx-auto p-4 relative font-sans">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in duration-500">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Master Member Ledger</h2>
            <p className="text-[10px] font-bold text-blue-300">Har entry ke baad auto-update hisab</p>
          </div>
          <span className="text-xs font-black bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
            Total: {members.length} Members
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 border-b border-gray-200">
              <tr>
                <th className="p-4">Member Info</th>
                <th className="p-4 text-green-700 bg-green-50/30">Savings</th>
                <th className="p-4 text-red-600 bg-red-50/30">Principal</th>
                <th className="p-4 text-orange-600">Expected Int.</th>
                <th className="p-4 text-blue-700">Int. Paid</th>
                <th className="p-4 text-gray-900 bg-gray-100">Final Balance</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map(m => {
                const s = getMemberSummary(m);
                return (
                  <tr key={m.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="p-4 font-black text-blue-900 uppercase text-xs">
                      {m.name}
                      <div className="text-[9px] font-bold text-gray-400">Rate: {m.interestRate}%</div>
                    </td>
                    <td className="p-4 font-bold text-green-700">₹{s.savings.toLocaleString('en-IN')}</td>
                    <td className="p-4 font-bold text-red-600">₹{s.pendingLoan.toLocaleString('en-IN')}</td>
                    <td className="p-4 font-black text-orange-600 animate-pulse">₹{s.liveInterest}</td>
                    <td className="p-4 font-bold text-blue-800">₹{s.interestPaid.toLocaleString('en-IN')}</td>
                    
                    <td className="p-4 bg-gray-50">
                      <div className={`font-black text-sm px-3 py-1 rounded-xl shadow-sm text-white ${s.finalNetBalance > 0 ? 'bg-red-600' : 'bg-green-600'}`}>
                        ₹{s.finalNetBalance.toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td className="p-4">
                      <button 
                        onClick={() => setSelectedCalc(s)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-blue-900 shadow-lg active:scale-95 transition-all"
                      >
                        VIEW HISAB
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🧾 HISAB BREAKDOWN POPUP */}
      {selectedCalc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-blue-900 p-8 text-white text-center">
              <h3 className="text-xl font-black uppercase italic tracking-widest">{selectedCalc.breakdown.name}</h3>
              <div className="mt-2 text-[10px] font-bold bg-white/20 inline-block px-3 py-1 rounded-full border border-white/30 italic">Detailed Statement</div>
            </div>
            
            <div className="p-8 space-y-4">
              <div className="flex justify-between items-center text-sm border-b pb-3 border-gray-100">
                <span className="text-gray-400 font-bold text-[10px] uppercase">Mool Dhan (+)</span>
                <span className="font-black text-gray-800 font-mono">₹{selectedCalc.pendingLoan}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-3 border-gray-100">
                <span className="text-gray-400 font-bold text-[10px] uppercase">Ban raha Byaj (+)</span>
                <span className="font-black text-orange-600 font-mono">₹{selectedCalc.liveInterest}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-3 border-gray-100">
                <span className="text-gray-400 font-bold text-[10px] uppercase">Diya gaya Byaj (-)</span>
                <span className="font-black text-blue-700 font-mono">₹{selectedCalc.interestPaid}</span>
              </div>

              <div className="bg-blue-50 p-6 rounded-3xl text-center border-2 border-blue-100 mt-4 shadow-inner">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Kul Den dari (Net Payable)</p>
                <h4 className="text-3xl font-black text-blue-900 font-mono italic">₹{selectedCalc.finalNetBalance}</h4>
              </div>

              <button onClick={() => setSelectedCalc(null)} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all uppercase tracking-widest">
                Done & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberList;