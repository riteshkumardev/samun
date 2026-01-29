import React from 'react';

const PrintReport = ({ data, title, onDelete, onEdit, onMemberClick }) => {
  // 📈 Calculation Logic for Totals
  const totalCr = data
    .filter(item => item.type !== 'Loan Dena')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalDr = data
    .filter(item => item.type === 'Loan Dena')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const netBalance = totalCr - totalDr;

  return (
    <div className="bg-white p-4 sm:p-8 print-container min-h-screen">
      
      {/* 🏢 OFFICIAL HEADER */}
      <div className="text-center mb-6 border-b-4 border-double border-gray-900 pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-blue-900">
          Bihar Digital Ledger
        </h1>
        <p className="text-lg font-bold text-gray-700 mt-1">
          {title || "SAMUH DAILY PASSBOOK"}
        </p>
        <div className="flex justify-between mt-4 text-[10px] sm:text-xs font-bold uppercase text-gray-500">
          <span>📅 Date: {new Date().toLocaleDateString('hi-IN')}</span>
          <span>📍 Bihar Samuh Statement</span>
        </div>
      </div>

      {/* 📊 MAIN ACCOUNTING TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-2 border-black">
          <thead>
            <tr className="bg-gray-200 text-xs sm:text-sm uppercase font-black">
              <th className="border-2 border-black p-2 w-24">Date</th>
              <th className="border-2 border-black p-2 text-left">Sadasya (Member)</th>
              <th className="border-2 border-black p-2 text-left">Vivran (Particulars)</th>
              <th className="border-2 border-black p-2 text-right w-24 text-red-700">Debit (Dr.)</th>
              <th className="border-2 border-black p-2 text-right w-24 text-green-800">Credit (Cr.)</th>
              <th className="border-2 border-black p-2 text-center w-24 no-print">Actions</th>
            </tr>
          </thead>
          
          <tbody className="text-sm">
            {data.length > 0 ? data.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50 odd:bg-white even:bg-gray-50 border-b border-black">
                {/* 📅 Tarikh */}
                <td className="border-x border-black p-2 text-center font-mono text-xs">
                  {item.date}
                </td>
                
                {/* 👤 Sadasya ka Naam (Clickable for Passbook) */}
                <td 
                  onClick={() => onMemberClick && onMemberClick(item.memberName)}
                  className="border-x border-black p-2 font-bold uppercase cursor-pointer text-blue-800 hover:underline"
                >
                  {item.memberName}
                </td>
                
                {/* 📝 Vivran */}
                <td className="border-x border-black p-2 italic text-gray-600">
                  {item.type}
                </td>
                
                {/* 🔴 Debit (Paisa Gaya) */}
                <td className="border-x border-black p-2 text-right font-bold text-red-600">
                  {item.type === 'Loan Dena' ? `₹${Number(item.amount).toLocaleString('en-IN')}` : '-'}
                </td>

                {/* 🟢 Credit (Paisa Aaya) */}
                <td className="border-x border-black p-2 text-right font-bold text-green-700">
                  {item.type !== 'Loan Dena' ? `₹${Number(item.amount).toLocaleString('en-IN')}` : '-'}
                </td>

                {/* 🛠️ Action Buttons (No-Print) */}
                <td className="border-x border-black p-2 text-center no-print flex justify-center gap-2">
                  <button 
                    onClick={() => onEdit(item)}
                    className="bg-blue-50 text-blue-600 p-2 rounded hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    title="Sudhar Karein"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="bg-red-50 text-red-600 p-2 rounded hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    title="Hataayein"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="text-center p-12 font-bold text-gray-400 italic">
                  Abhi tak koi lenden darj nahi kiya gaya hai.
                </td>
              </tr>
            )}
          </tbody>

          {/* 💰 TOTALS FOOTER */}
          <tfoot>
            <tr className="bg-gray-100 font-black border-t-2 border-black">
              <td colSpan="3" className="border-2 border-black p-2 text-right uppercase text-xs">Sub-Total:</td>
              <td className="border-2 border-black p-2 text-right text-red-700">₹{totalDr.toLocaleString('en-IN')}</td>
              <td className="border-2 border-black p-2 text-right text-green-800">₹{totalCr.toLocaleString('en-IN')}</td>
              <td className="no-print border-2 border-black bg-gray-100"></td>
            </tr>
            <tr className="bg-blue-900 text-white font-black">
              <td colSpan="4" className="border-2 border-black p-3 text-right uppercase text-base">
                Net Samuh Balance (Total Saving):
              </td>
              <td className="border-2 border-black p-3 text-right text-lg">
                ₹{netBalance.toLocaleString('en-IN')}
              </td>
              <td className="no-print border-2 border-black bg-blue-900"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ✍️ OFFICIAL SIGNATURES (Print only) */}
      <div className="mt-20 flex justify-between items-end invisible print:visible px-10">
        <div className="text-center">
          <div className="border-t-2 border-black w-32 mb-1"></div>
          <p className="text-[10px] font-black uppercase">Adhyaksh ka Sign</p>
        </div>
        <div className="text-center">
          <div className="border-t-2 border-black w-32 mb-1"></div>
          <p className="text-[10px] font-black uppercase">Sadasya ka Sign</p>
        </div>
        <div className="text-center">
          <div className="border-t-2 border-black w-32 mb-1"></div>
          <p className="text-[10px] font-black uppercase">Koshadhyaksh ka Sign</p>
        </div>
      </div>

      {/* 📜 FOOTNOTE */}
      <div className="mt-8 text-[9px] text-gray-400 text-center italic invisible print:visible">
        * Yeh ek computer-generated digital statement hai, Bihar Digital Ledger dwara pradan kiya gaya.
      </div>
    </div>
  );
};

export default PrintReport;