import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

// Components & Pages
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import MemberDetails from "./pages/MemberDetails";
import RegisterPage from "./pages/RegisterPage";
import TransactionForm from "./components/TransactionForm";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (!window.confirm("Aap logout karna chahte hain?")) return;
    try {
      await signOut(auth);
    } catch (err) {
      alert("Logout failed: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-xl font-black text-blue-900 animate-pulse tracking-tighter">
          ANJANEY SAMUH APP LOADING...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {user ? (
          <>
            <Navbar user={user} handleLogout={handleLogout} />
            <main className="flex-grow">
              <Routes>
                {/* 🏠 Main Dashboard */}
                <Route path="/" element={<Dashboard />} />
                
                {/* ➕ Nayi Entry */}
                <Route path="/new-entry" element={<TransactionForm />} />
                
                {/* 👤 User Registration */}
                <Route path="/register" element={<RegisterPage />} />
                
                {/* 📄 Member Ki Passbook (Dynamic Route) */}
                <Route path="/member/:name" element={<MemberDetails />} />
                
                {/* Galat URL par Dashboard par wapas bhejein */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;