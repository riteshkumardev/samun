import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import TransactionForm from '../components/TransactionForm';
import PrintReport from '../components/PrintReport';
import RegisterPage from './RegisterPage';
import MemberDetails from './MemberDetails';
import MemberRegistration from './MemberRegistration'; // Naya Page
import MemberList from './MemberList'; // Naya Page

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🟢 View 'none' rakha hai taaki shuruat mein Welcome Screen dikhe
  const [view, setView] = useState('none'); 
  const [selectedMember, setSelectedMember] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);
    });
    return () => unsubscribe();
  }, []);

  // Summary Calculations
  const totalCr = transactions.filter(t => t.type !== 'Loan Dena' && t.type !== 'Samuh Kharch').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalDr = transactions.filter(t => t.type === 'Loan Dena' || t.type === 'Samuh Kharch').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const currentBalance = totalCr - totalDr;
  
  const filteredTransactions = transactions.filter(t => t.memberName.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDelete = async (id) => {
    if (window.confirm("क्या आप इस एंट्री को हमेशा के लिए हटाना चाहते हैं?")) {
      try { await deleteDoc(doc(db, "transactions", id)); } 
      catch (error) { alert("Error deleting entry: " + error.message); }
    }
  };

  const handleEdit = async (item) => {
    const newAmount = prompt(`${item.memberName} की नई राशि लिखें:`, item.amount);
    if (newAmount !== null && newAmount !== "") {
      try { await updateDoc(doc(db, "transactions", item.id), { amount: Number(newAmount) }); } 
      catch (error) { alert("Update failed: " + error.message); }
    }
  };

  const handleMemberClick = (name) => { setSelectedMember(name); setView('details'); };
  const handlePrint = () => { setView('table'); setTimeout(() => { window.print(); }, 200); };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      
      {/* 🟦 SIDEBAR - Navigation Control */}
      <aside className={`no-print bg-blue-900 text-white transition-all duration-300 shadow-2xl ${isSidebarOpen ? 'w-64' : 'w-20'} sticky top-0 h-screen hidden md:flex flex-col`}>
        <div className="p-4 flex justify-between items-center border-b border-blue-800">
          {isSidebarOpen && <span className="font-black text-xl tracking-tighter">NAV</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-blue-800 rounded-lg">
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-2 px-3">
          <button onClick={() => { setView('table'); setSelectedMember(''); }} 
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all ${view === 'table' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
            <span>📊</span> {isSidebarOpen && <span className="font-bold text-sm">Hisab Dashboard</span>}
          </button>

          <button onClick={() => setView('member-list')} 
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all ${view === 'member-list' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
            <span>📋</span> {isSidebarOpen && <span className="font-bold text-sm">Member List</span>}
          </button>

          <button onClick={() => setView('add-member')} 
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all ${view === 'add-member' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
            <span>👤</span> {isSidebarOpen && <span className="font-bold text-sm">Add Member</span>}
          </button>

          <div className="border-t border-blue-800 my-2"></div>

          <button onClick={() => setView('form')} 
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all ${view === 'form' ? 'bg-green-600 shadow-lg' : 'hover:bg-blue-800'}`}>
            <span>➕</span> {isSidebarOpen && <span className="font-bold text-sm">Nayi Entry</span>}
          </button>
          
          <button onClick={() => setView('register')} 
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all ${view === 'register' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
            <span>⚙️</span> {isSidebarOpen && <span className="font-bold text-sm">Admin Settings</span>}
          </button>
        </nav>
      </aside>

      {/* ⬜ MAIN CONTENT AREA */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        
        {/* Welcome Screen */}
        {view === 'none' && (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-white rounded-3xl shadow-sm border border-dashed border-blue-200">
                <div className="text-6xl mb-4 animate-bounce">🏛️</div>
                <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Bihar Samuh Ledger</h2>
                <p className="text-gray-500 mt-2 font-bold italic">Kaam shuru karne ke liye Side Menu se option chunein.</p>
            </div>
        )}

        {/* 📊 Summary Cards (Dashboard View Only) */}
        {view === 'table' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 no-print animate-in fade-in duration-300">
                <div className="bg-white p-6 rounded-2xl shadow-sm border-b-8 border-green-500">
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-1">Kul Jama (Credit)</p>
                    <h2 className="text-3xl font-black text-green-700 font-mono">₹{totalCr.toLocaleString('en-IN')}</h2>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-b-8 border-red-500">
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-1">Kul Kharch/Loan (Debit)</p>
                    <h2 className="text-3xl font-black text-red-700 font-mono">₹{totalDr.toLocaleString('en-IN')}</h2>
                </div>
                <div className="bg-blue-900 p-6 rounded-2xl shadow-xl border-b-8 border-yellow-400">
                    <p className="text-blue-300 font-bold text-[10px] uppercase tracking-widest mb-1">Samuh Bachat (Cash)</p>
                    <h2 className="text-3xl font-black text-white font-mono">₹{currentBalance.toLocaleString('en-IN')}</h2>
                </div>
            </div>
        )}

        {/* 📄 View Content Logic */}
        <div className="transition-all duration-300">
          {view === 'form' && <TransactionForm />}
          {view === 'register' && <RegisterPage setView={setView} />}
          {view === 'details' && <MemberDetails memberName={selectedMember} setView={setView} />}
          {view === 'add-member' && <MemberRegistration />}
          {view === 'member-list' && <MemberList />}
          
          {view === 'table' && (
            <div className="animate-in slide-in-from-bottom-5 duration-500">
              <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4 no-print bg-white p-4 rounded-2xl shadow-sm">
                 <input 
                    type="text" placeholder="Member ka naam khojein..." 
                    className="w-full md:w-96 p-3 rounded-xl border-2 border-gray-50 focus:border-blue-500 outline-none font-bold text-sm shadow-inner"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                 />
                 <button onClick={handlePrint} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-black text-xs shadow-lg transition-all active:scale-95">🖨️ PRINT REPORT</button>
              </div>
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden print:shadow-none border border-gray-100">
                <div onClick={(e) => {
                    const text = e.target.innerText;
                    if (transactions.some(t => t.memberName === text)) handleMemberClick(text);
                }}>
                    <PrintReport data={filteredTransactions} onEdit={handleEdit} onDelete={handleDelete} title={searchTerm ? `${searchTerm.toUpperCase()} KA LEDGER` : "SAMUH DAILY PASSBOOK"} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;