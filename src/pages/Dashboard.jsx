import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import TransactionForm from '../components/TransactionForm';
import PrintReport from '../components/PrintReport';
import RegisterPage from './RegisterPage';
import MemberDetails from './MemberDetails';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('table'); 
  const [selectedMember, setSelectedMember] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar toggle state

  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);
    });
    return () => unsubscribe();
  }, []);

  // Summary Calculations (Same as before)
  const totalCr = transactions.filter(t => t.type !== 'Loan Dena').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalDr = transactions.filter(t => t.type === 'Loan Dena').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const currentBalance = totalCr - totalDr;
  const filteredTransactions = transactions.filter(t => t.memberName.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDelete = async (id) => {
    if (window.confirm("क्या आप इस एंट्री को हमेशा के लिए हटाना चाहते हैं?")) {
      try { await deleteDoc(doc(db, "transactions", id)); alert("एंट्री डिलीट हो गई!"); } 
      catch (error) { alert("Error deleting entry: " + error.message); }
    }
  };

  const handleEdit = async (item) => {
    const newAmount = prompt(`${item.memberName} की नई राशि लिखें:`, item.amount);
    if (newAmount !== null && newAmount !== "") {
      try { await updateDoc(doc(db, "transactions", item.id), { amount: Number(newAmount) }); alert("राशि अपडेट हो गई!"); } 
      catch (error) { alert("Update failed: " + error.message); }
    }
  };

  const handleMemberClick = (name) => { setSelectedMember(name); setView('details'); };
  const handlePrint = () => { setView('table'); setTimeout(() => { window.print(); }, 200); };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      
      {/* 🟦 SIDEBAR - no-print */}
      <aside className={`no-print bg-blue-900 text-white transition-all duration-300 shadow-2xl ${isSidebarOpen ? 'w-64' : 'w-20'} sticky top-0 h-screen hidden md:flex flex-col`}>
        <div className="p-4 flex justify-between items-center border-b border-blue-800">
          {isSidebarOpen && <span className="font-black text-xl tracking-tighter">NAV MENU</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-blue-800 rounded-lg">
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-2 px-3">
          <button onClick={() => { setView('table'); setSelectedMember(''); }} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${view === 'table' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
            <span>📊</span> {isSidebarOpen && <span className="font-bold">Dashboard</span>}
          </button>
          <button onClick={() => setView('form')} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${view === 'form' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
            <span>➕</span> {isSidebarOpen && <span className="font-bold">Nayi Entry</span>}
          </button>
          <button onClick={() => setView('register')} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${view === 'register' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
            <span>👤</span> {isSidebarOpen && <span className="font-bold">Add User</span>}
          </button>
          <button onClick={handlePrint} className="flex items-center gap-4 p-3 rounded-xl hover:bg-green-700 transition-all text-green-300">
            <span>🖨️</span> {isSidebarOpen && <span className="font-bold">Print Report</span>}
          </button>
        </nav>
      </aside>

      {/* ⬜ MAIN CONTENT AREA */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        
        {/* 📊 SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 no-print">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-green-600">
            <p className="text-gray-400 font-bold text-xs uppercase italic">Total Credit</p>
            <h2 className="text-3xl font-black text-green-700">₹{totalCr.toLocaleString('en-IN')}</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-red-600">
            <p className="text-gray-400 font-bold text-xs uppercase italic">Total Debit</p>
            <h2 className="text-3xl font-black text-red-700">₹{totalDr.toLocaleString('en-IN')}</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-blue-600">
            <p className="text-gray-400 font-bold text-xs uppercase italic">Net Balance</p>
            <h2 className="text-3xl font-black text-blue-900">₹{currentBalance.toLocaleString('en-IN')}</h2>
          </div>
        </div>

        {/* 🔍 SEARCH & MOBILE MENU (Shown on Mobile only) */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center no-print">
            <div className="md:hidden flex gap-2 w-full mb-4">
                <button onClick={() => setView('table')} className="bg-blue-800 text-white p-2 rounded flex-1 text-xs">Home</button>
                <button onClick={() => setView('form')} className="bg-blue-800 text-white p-2 rounded flex-1 text-xs">+ Entry</button>
            </div>
            {view === 'table' && (
              <input 
                type="text" 
                placeholder="Naam se khojein..." 
                className="w-full md:w-96 p-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            )}
        </div>

        {/* 📄 VIEW RENDERER */}
        <div className="transition-all duration-500">
          {view === 'form' && <div className="animate-in slide-in-from-bottom-5 duration-500"><TransactionForm /></div>}
          {view === 'register' && <RegisterPage setView={setView} />}
          {view === 'details' && <MemberDetails memberName={selectedMember} setView={setView} />}
          {view === 'table' && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden print:shadow-none">
              <div onClick={(e) => {
                const text = e.target.innerText;
                if (transactions.some(t => t.memberName === text)) handleMemberClick(text);
              }}>
                <PrintReport data={filteredTransactions} onEdit={handleEdit} onDelete={handleDelete} title={searchTerm ? `${searchTerm.toUpperCase()} KA LEDGER` : "SAMUH DAILY PASSBOOK"} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;