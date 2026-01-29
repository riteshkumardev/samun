import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const MemberDetails = ({ memberName, setView }) => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ saving: 0, loan: 0, interest: 0 });

  useEffect(() => {
    if (!memberName) return;

    // Sirf is member ka data fetch karne ke liye query
    const q = query(
      collection(db, "transactions"),
      where("memberName", "==", memberName),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(data);

      // Calculation for personal summary
      let totalSaving = 0;
      let totalLoan = 0;
      let totalInterest = 0;

      data.forEach(t => {
        if (t.type === 'Bachat') totalSaving += Number(t.amount);
        if (t.type === 'Loan Dena') totalLoan += Number(t.amount);
        if (t.type === 'Byaj') totalInterest += Number(t.amount);
        if (t.type === 'Rin Vapsi') totalLoan -= Number(t.amount);
      });

      setStats({ saving: totalSaving, loan: totalLoan, interest: totalInterest });
    });

    return () => unsubscribe();
  }, [memberName]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Back Button & Header */}
      <div className="flex justify-between items-center mb-6 no-print">
        <button 
          onClick={() => setView('table')}
          className="bg-gray-600 text-white px-4 py-2 rounded shadow hover:bg-gray-700"
        >
          ← Wapas Jayein
        </button>
        <button 
          onClick={handlePrint}
          className="bg-green-700 text-white px-4 py-2 rounded shadow font-bold"
        >
          Print Passbook 🖨️
        </button>
      </div>

      {/* Member Profile Card */}
      <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-xl mb-8 print:bg-white print:text-black print:border-2 print:border-black">
        <h2 className="text-3xl font-black uppercase mb-2">{memberName}</h2>
        <p className="text-blue-200 text-sm mb-4 print:text-gray-600 tracking-widest">SADASYA PERSONAL PASSBOOK</p>
        
        <div className="grid grid-cols-3 gap-4 border-t border-blue-800 pt-4 print:border-black">
          <div>
            <p className="text-xs opacity-70 uppercase font-bold">Kul Bachat</p>
            <p className="text-xl font-black">₹{stats.saving}</p>
          </div>
          <div>
            <p className="text-xs opacity-70 uppercase font-bold">Baki Karz</p>
            <p className="text-xl font-black text-red-300 print:text-red-600">₹{stats.loan}</p>
          </div>
          <div>
            <p className="text-xs opacity-70 uppercase font-bold">Kul Byaj</p>
            <p className="text-xl font-black">₹{stats.interest}</p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden print:shadow-none print:border-none">
        <h3 className="p-4 bg-gray-100 font-bold border-b print:bg-white uppercase">Lenden Itihaas (Transaction History)</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase font-bold">
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Particulars</th>
              <th className="p-3 border text-right">Debit (Dr)</th>
              <th className="p-3 border text-right">Credit (Cr)</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {history.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="p-3 border">{t.date}</td>
                <td className="p-3 border italic">{t.type}</td>
                <td className="p-3 border text-right text-red-600 font-bold">
                  {t.type === 'Loan Dena' ? `₹${t.amount}` : '-'}
                </td>
                <td className="p-3 border text-right text-green-700 font-bold">
                  {t.type !== 'Loan Dena' ? `₹${t.amount}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberDetails;