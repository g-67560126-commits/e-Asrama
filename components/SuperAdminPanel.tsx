
import React, { useState } from 'react';
import { SystemConfig, WardenUser, Application, AppStatus } from '../types';

interface SuperAdminPanelProps {
  config: SystemConfig;
  wardens: WardenUser[];
  applications: Application[];
  onUpdateConfig: (newConfig: SystemConfig) => void;
  onAddWarden: (warden: WardenUser) => void;
  onDeleteWarden: (id: string) => void;
}

const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ config, wardens, applications, onUpdateConfig, onAddWarden, onDeleteWarden }) => {
  const [activeTab, setActiveTab] = useState<'system' | 'wardens' | 'reports'>('system');
  const [newName, setNewName] = useState(config.name);
  const [newLogo, setNewLogo] = useState<string | null>(config.logoUrl);
  
  const [wName, setWName] = useState('');
  const [wUser, setWUser] = useState('');
  const [wPass, setWPass] = useState('');
  const [wPhone, setWPhone] = useState('');

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddWarden = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wName || !wUser || !wPass || !wPhone) return;
    onAddWarden({ 
      id: Date.now().toString(), 
      name: wName, 
      username: wUser, 
      password: wPass,
      phone: wPhone
    });
    setWName(''); setWUser(''); setWPass(''); setWPhone('');
  };

  const downloadCSV = () => {
    if (applications.length === 0) return;
    
    const headers = ["ID", "Jenis", "Nama Pelajar", "Tingkatan", "Nama Penjaga", "Telefon", "Emel", "Kenderaan", "No Plat", "Tarikh Keluar", "Tarikh Kembali", "Sebab", "Status", "Pelulus", "No Tel Warden", "Tarikh Mohon"];
    const rows = applications.map(app => [
      app.id,
      app.type,
      app.studentName,
      app.studentForm,
      app.parentName,
      app.parentPhone,
      app.parentEmail,
      app.vehicleType,
      app.vehiclePlate,
      app.dateOut,
      app.dateReturn,
      `"${app.reason.replace(/"/g, '""')}"`,
      app.status,
      app.wardenName || "-",
      app.wardenPhone || "-",
      new Date(app.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_eAsrama_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportStats = {
    total: applications.length,
    approved: applications.filter(a => a.status === AppStatus.APPROVED).length,
    pending: applications.filter(a => a.status === AppStatus.PENDING).length,
    rejected: applications.filter(a => a.status === AppStatus.REJECTED).length,
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
      <div className="flex border-b border-slate-50 bg-slate-50/30">
        <button onClick={() => setActiveTab('system')} className={`flex-1 py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'system' ? 'bg-white text-indigo-700 border-b-4 border-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}>
          ⚙️ Sistem
        </button>
        <button onClick={() => setActiveTab('wardens')} className={`flex-1 py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'wardens' ? 'bg-white text-indigo-700 border-b-4 border-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}>
          👮 Warden
        </button>
        <button onClick={() => setActiveTab('reports')} className={`flex-1 py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'reports' ? 'bg-white text-indigo-700 border-b-4 border-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}>
          📊 Laporan
        </button>
      </div>

      <div className="p-10">
        {activeTab === 'system' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Sistem</label>
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none font-bold text-slate-700"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Logo Institusi</label>
                  <input type="file" onChange={handleLogoChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer" />
                </div>
              </div>
              
              <div className="bg-slate-50/50 rounded-[2rem] p-8 flex flex-col items-center justify-center border-4 border-dashed border-slate-100">
                <p className="text-[10px] font-black text-slate-300 uppercase mb-6 tracking-[0.2em]">Pratonton Identiti</p>
                {newLogo ? (
                  <img src={newLogo} className="h-24 w-auto mb-6 drop-shadow-xl" alt="Logo" />
                ) : (
                  <div className="h-20 w-20 bg-indigo-600 rounded-3xl mb-6 shadow-lg shadow-indigo-200 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                )}
                <p className="text-2xl font-black text-slate-800 tracking-tighter">{newName}</p>
              </div>
            </div>
            
            <button 
              onClick={() => onUpdateConfig({ name: newName, logoUrl: newLogo })}
              className="w-full gradient-primary py-5 rounded-2xl text-white font-black shadow-xl shadow-indigo-100 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              Simpan Konfigurasi Sistem
            </button>
          </div>
        )}

        {activeTab === 'wardens' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <form onSubmit={handleAddWarden} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="lg:col-span-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Nama Warden</label>
                <input type="text" value={wName} onChange={(e) => setWName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none" placeholder="Cth: Hj. Ahmad" />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">No. Telefon</label>
                <input type="tel" value={wPhone} onChange={(e) => setWPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none" placeholder="01X-XXXXXXX" />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Username</label>
                <input type="text" value={wUser} onChange={(e) => setWUser(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none" placeholder="warden1" />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Password</label>
                <input type="password" value={wPass} onChange={(e) => setWPass(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none" />
              </div>
              <button type="submit" className="bg-indigo-600 text-white font-black py-3 px-4 rounded-xl hover:bg-indigo-700 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 lg:col-span-1">
                Daftar
              </button>
            </form>

            <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-6 py-4">Nama & No. Tel</th>
                    <th className="px-6 py-4">ID Log Masuk</th>
                    <th className="px-6 py-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {wardens.map(w => (
                    <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">{w.name.charAt(0)}</div>
                          <div>
                            <p className="font-bold text-slate-700 text-sm">{w.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{w.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-[11px] text-indigo-600 font-bold bg-indigo-50/30 px-2 py-1 rounded-lg">{w.username}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => onDeleteWarden(w.id)} className="text-rose-500 hover:text-rose-700 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg hover:bg-rose-50 transition-all">Hapus</button>
                      </td>
                    </tr>
                  ))}
                  {wardens.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">Pangkalan data warden kosong</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Jumlah Kes', value: reportStats.total, color: 'indigo' },
                { label: 'Diluluskan', value: reportStats.approved, color: 'emerald' },
                { label: 'Menunggu', value: reportStats.pending, color: 'amber' },
                { label: 'Ditolak', value: reportStats.rejected, color: 'rose' },
              ].map((s, i) => (
                <div key={i} className={`bg-${s.color}-50/50 p-6 rounded-3xl border border-${s.color}-100 shadow-sm`}>
                  <p className={`text-[9px] font-black text-${s.color}-600 uppercase tracking-widest mb-1`}>{s.label}</p>
                  <p className={`text-3xl font-black text-${s.color}-800 tracking-tighter`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-center relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner">📊</div>
                <div>
                  <h4 className="text-2xl font-black text-white tracking-tight">Jana Laporan Keseluruhan</h4>
                  <p className="text-indigo-200/60 text-xs font-bold uppercase tracking-widest mt-2">Format CSV sedia untuk dibuka dalam Excel / Sheets</p>
                </div>
                <button 
                  onClick={downloadCSV}
                  disabled={applications.length === 0}
                  className="px-10 py-5 bg-white text-slate-900 font-black rounded-2xl shadow-2xl hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-3 mx-auto uppercase text-xs tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Muat Turun Laporan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminPanel;
