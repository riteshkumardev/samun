import React from 'react';

const PrintReport = ({ data, title, onDelete, onEdit, onMemberClick }) => {
  // 📈 Calculation Logic
  const totalCr = data
    .filter(item => item.type !== 'Loan Dena' && item.type !== 'Samuh Kharch')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalDr = data
    .filter(item => item.type === 'Loan Dena' || item.type === 'Samuh Kharch')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const netBalance = totalCr - totalDr;

  return (
    <div className="bg-white p-4 sm:p-8 print-container min-h-screen">
      
      {/* 🏢 OFFICIAL HEADER */}
      <div className="text-center mb-6 border-b-4 border-double border-gray-900 pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-blue-900">Anjaney Digital Ledger</h1>
        <p className="text-lg font-bold text-gray-700 mt-1 uppercase italic">{title || "SAMUH DAILY PASSBOOK"}</p>
        <div className="flex justify-between mt-4 text-[10px] sm:text-xs font-black uppercase text-gray-500">
          <span>📅 Date: {new Date().toLocaleDateString('hi-IN')}</span>
          <span>📍 Bihar Samuh Statement</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-2 border-black">
          <thead>
            <tr className="bg-gray-200 text-[10px] sm:text-xs uppercase font-black">
              <th className="border-2 border-black p-2 w-20">Date</th>
              <th className="border-2 border-black p-2 text-left">Member</th>
              <th className="border-2 border-black p-2 text-left">Particulars</th>
              {/* 🟢 Naya Interest Column */}
              <th className="border-2 border-black p-2 text-right w-16 text-blue-800">Int %</th>
              <th className="border-2 border-black p-2 text-right w-24 text-red-700">Debit (Dr.)</th>
              <th className="border-2 border-black p-2 text-right w-24 text-green-800">Credit (Cr.)</th>
              <th className="border-2 border-black p-2 text-center w-24 no-print">Actions</th>
            </tr>
          </thead>
          
          <tbody className="text-sm">
            {data.length > 0 ? data.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50 odd:bg-white even:bg-gray-50 border-b border-black font-medium text-[11px]">
                <td className="border-x border-black p-2 text-center font-mono">{item.date}</td>
                
                <td onClick={() => onMemberClick && onMemberClick(item.memberName)}
                  className="border-x border-black p-2 font-bold uppercase cursor-pointer text-blue-800 hover:underline">
                  {item.memberName}
                </td>
                
                <td className="border-x border-black p-2 italic text-gray-600">
                  {item.type}
                  {item.calcRef && <div className="text-[8px] text-blue-500 font-bold block mt-1">{item.calcRef}</div>}
                </td>

                {/* 📉 Interest Rate Display */}
                <td className="border-x border-black p-2 text-right font-black text-blue-700">
                  {item.interestRate ? `${item.interestRate}%` : '-'}
                </td>
                
                <td className="border-x border-black p-2 text-right font-bold text-red-600">
                  {(item.type === 'Loan Dena' || item.type === 'Samuh Kharch') 
                    ? `₹${Number(item.amount).toLocaleString('en-IN')}` : '-'}
                </td>

                <td className="border-x border-black p-2 text-right font-bold text-green-700">
                  {(item.type !== 'Loan Dena' && item.type !== 'Samuh Kharch') 
                    ? `₹${Number(item.amount).toLocaleString('en-IN')}` : '-'}
                </td>

                <td className="border-x border-black p-2 text-center no-print flex justify-center gap-2">
                  <button onClick={() => onEdit(item)} className="bg-blue-50 text-blue-600 p-2 rounded hover:bg-blue-600 hover:text-white transition-all">✏️</button>
                  <button onClick={() => onDelete(item.id)} className="bg-red-50 text-red-600 p-2 rounded hover:bg-red-600 hover:text-white transition-all">🗑️</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="7" className="text-center p-12 font-bold text-gray-400 italic">No Data Found</td></tr>
            )}
          </tbody>

          <tfoot>
            <tr className="bg-gray-100 font-black border-t-2 border-black text-xs">
              <td colSpan="4" className="border-2 border-black p-2 text-right uppercase">Sub-Total:</td>
              <td className="border-2 border-black p-2 text-right text-red-700">₹{totalDr.toLocaleString('en-IN')}</td>
              <td className="border-2 border-black p-2 text-right text-green-800">₹{totalCr.toLocaleString('en-IN')}</td>
              <td className="no-print border-2 border-black bg-gray-100"></td>
            </tr>
            <tr className="bg-blue-900 text-white font-black">
              <td colSpan="5" className="border-2 border-black p-3 text-right uppercase text-sm">Net Balance (Cash):</td>
              <td className="border-2 border-black p-3 text-right text-base font-mono">₹{netBalance.toLocaleString('en-IN')}</td>
              <td className="no-print border-2 border-black bg-blue-900"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-20 flex justify-between items-end invisible print:visible px-10">
        <div className="text-center">
          <div className="border-t-2 border-black w-32 mb-1"></div>
          <p className="text-[10px] font-black uppercase italic">Adhyaksh Sign</p>
        </div>
        <div className="text-center">
          <div className="border-t-2 border-black w-32 mb-1"></div>
          <p className="text-[10px] font-black uppercase italic">Sadasya Sign</p>
        </div>
        <div className="text-center">
          <div className="border-t-2 border-black w-32 mb-1"></div>
          <p className="text-[10px] font-black uppercase italic">Koshadhyaksh Sign</p>
        </div>
      </div>
    </div>
  );
};

export default PrintReport;