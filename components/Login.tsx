
import React, { useState, useEffect, useRef } from 'react';
import { WardenUser, SystemConfig } from '../types';

interface LoginProps {
  config: SystemConfig;
  wardens: WardenUser[];
  onLogin: (role: 'warden' | 'superadmin', name: string, phone?: string) => void;
  onCancel: () => void;
}

const Login: React.FC<LoginProps> = ({ config, wardens, onLogin, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedUser = username.toLowerCase().trim();

    // Check Super Admin
    if ((normalizedUser === 'admin' || normalizedUser === 'superadmin') && password === '1069') {
      onLogin('superadmin', 'Super Admin', '-');
      return;
    }

    // Check Warden
    const warden = wardens.find(w => w.username.toLowerCase() === normalizedUser && w.password === password);
    if (warden) {
      onLogin('warden', warden.name, warden.phone);
      return;
    }

    setError('ID atau Kata Laluan tidak sah.');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-[380px] rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 p-8 text-white text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-4">
              {config.logoUrl ? (
                <img src={config.logoUrl} className="h-14 w-auto drop-shadow-md" alt="Logo" />
              ) : (
                <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🔑</div>
              )}
            </div>
            <h2 className="text-xl font-black tracking-tight">{config.name}</h2>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Akses Kakitangan</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-[11px] font-bold border border-rose-100 flex items-center gap-2 animate-in shake duration-300">
              <span className="text-base">⚠️</span>
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">ID Pengguna</label>
              <input 
                ref={inputRef}
                required
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-slate-900 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300 text-sm"
                placeholder="Username"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Kata Laluan</label>
              <input 
                required
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-slate-900 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button 
              type="submit" 
              className="w-full bg-slate-900 py-4 rounded-xl text-white font-black shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all text-sm uppercase tracking-widest"
            >
              Log Masuk
            </button>
            <button 
              type="button" 
              onClick={onCancel} 
              className="w-full py-2 text-slate-400 text-[10px] font-bold hover:text-slate-600 transition-colors uppercase tracking-widest"
            >
              Batal
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-50 text-center">
            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">
              Guna <span className="text-slate-400">admin / 1069</span> untuk demo
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
