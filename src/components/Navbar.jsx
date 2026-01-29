import React from 'react';

const Navbar = ({ user, handleLogout }) => {
  return (
    <nav className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 text-white p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)] no-print flex justify-between items-center sticky top-0 z-50 border-b border-blue-800/50 backdrop-blur-md">
      
      {/* 🏦 Brand Section with Icon Effect */}
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="bg-blue-600 p-2 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform duration-300">
          <span className="text-xl sm:text-2xl">🏛️</span>
        </div>
        <div>
          <h1 className="text-sm sm:text-xl font-black tracking-tighter uppercase leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-200">
            Bihar Digital Ledger
          </h1>
          <p className="text-[9px] sm:text-[10px] text-blue-400 font-bold hidden xs:block tracking-widest mt-0.5">
            BIHAR SAMUH MANAGEMENT SYSTEM
          </p>
        </div>
      </div>

      {/* 👤 User & Actions Section */}
      <div className="flex items-center gap-2 sm:gap-5">
        {/* Active Status Indicator */}
        <div className="hidden lg:flex items-center gap-3 bg-blue-950/50 px-4 py-1.5 rounded-2xl border border-blue-800/30">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-tighter">System Online</span>
            <span className="text-[11px] font-black text-white/90 truncate max-w-[150px]">
              {user?.email?.split('@')[0].toUpperCase() || "ADMIN"}
            </span>
          </div>
        </div>

        {/* Pro Logout Button */}
        <button
          onClick={handleLogout}
          className="group relative overflow-hidden bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-4 sm:px-6 py-2 rounded-xl font-black text-[10px] sm:text-xs shadow-[0_4px_15px_rgba(220,38,38,0.3)] transition-all active:scale-95 flex items-center gap-2 border border-red-400/20"
        >
          {/* Button Shine Effect */}
          <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
          
          <span className="relative z-10">LOGOUT</span>
          {/* <span className="relative z-10 text-sm group-hover:translate-x-1 transition-transform">➜</span> */}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;