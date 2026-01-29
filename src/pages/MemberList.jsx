import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, query } from 'firebase/firestore';

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // 1. Members fetch karein
    onSnapshot(collection(db, "users"), (snap) => {
      setMembers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    // 2. Transactions fetch karein
    onSnapshot(collection(db, "transactions"), (snap) => {
      setTransactions(snap.docs.map(doc => doc.data()));
    });
  }, []);

  // 📈 Member ki puri details calculate karne ka logic
  const getMemberSummary = (name) => {
    const mt = transactions.filter(t => t.memberName === name);
    const savings = mt.filter(t => t.type === 'Bachat').reduce((s, t) => s + t.amount, 0);
    const loanTaken = mt.filter(t => t.type === 'Loan Dena').reduce((s, t) => s + t.amount, 0);
    const loanRepaid = mt.filter(t => t.type === 'Rin Vapsi').reduce((s, t) => s + t.amount, 0);
    const interestPaid = mt.filter(t => t.type === 'Byaj').reduce((s, t) => s + t.amount, 0);
    
    return { savings, pendingLoan: loanTaken - loanRepaid, interestPaid };
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="bg-blue-900 p-6 text-white flex justify-between items-center">
        <h2 className="text-xl font-black uppercase italic">Samuh Sadasya Master List</h2>
        <span className="text-xs bg-blue-800 px-3 py-1 rounded-full border border-blue-700 font-bold">Total: {members.length} Members</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-[10px] uppercase font-black text-gray-600 border-b border-gray-200">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Mobile</th>
              <th className="p-4 text-green-700">Total Savings</th>
              <th className="p-4 text-red-600">Pending Loan</th>
              <th className="p-4 text-blue-700">Interest Paid</th>
              <th className="p-4">Rate (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map(m => {
              const summary = getMemberSummary(m.name);
              return (
                <tr key={m.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-4 font-black text-blue-900">{m.name}</td>
                  <td className="p-4 font-bold text-gray-400 text-xs">{m.mobile || '---'}</td>
                  <td className="p-4 font-black text-green-700 italic">₹{summary.savings.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg font-black text-xs ${summary.pendingLoan > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                      ₹{summary.pendingLoan.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-blue-800 italic text-xs">₹{summary.interestPaid.toLocaleString('en-IN')}</td>
                  <td className="p-4 font-black text-gray-600">{m.interestRate}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberList;