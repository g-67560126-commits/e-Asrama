
import React from 'react';
import { UserRole, SystemConfig } from '../types';

interface NavbarProps {
  role: UserRole;
  userName?: string;
  config: SystemConfig;
  pendingCount: number;
  onLogout: () => void;
  onSwitch: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ role, userName, config, pendingCount, onLogout, onSwitch }) => {
  return (
    <nav className="sticky top-0 z-40 w-full bg-slate-900/95 border-b border-slate-800 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shrink-0">
              {config.logoUrl ? (
                <img src={config.logoUrl} className="w-8 h-8 object-contain" alt="Logo" />
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              )}
            </div>
            <div>
              <span className="text-xl font-extrabold text-white tracking-tight block leading-none">{config.name}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Portal Pengurusan</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Staff Notifications Bell */}
            {(role === 'warden' || role === 'superadmin') && (
              <div className="relative group cursor-pointer hidden sm:block">
                <div className="bg-slate-800 p-2 rounded-xl border border-slate-700 group-hover:bg-indigo-600/20 group-hover:border-indigo-500/50 transition-all">
                  <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse ring-2 ring-rose-500/20">
                    {pendingCount}
                  </span>
                )}
              </div>
            )}

            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-400 uppercase">Mod Semasa</span>
              <span className="text-sm font-bold text-indigo-400">
                {role === 'parent' ? 'Ibu Bapa / Penjaga' : role === 'superadmin' ? 'Super Admin' : `Warden: ${userName}`}
              </span>
            </div>
            
            <div className="flex items-center gap-3 border-l border-slate-700 pl-6">
              {role === 'parent' ? (
                <button 
                  onClick={onSwitch}
                  className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2 rounded-lg border border-slate-700 hover:border-indigo-500 transition-all flex items-center gap-2"
                >
                  🔒 Log Masuk Staff
                </button>
              ) : (
                <button 
                  onClick={onLogout}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95"
                >
                  Log Keluar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
