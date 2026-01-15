
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ApplicationForm from './components/ApplicationForm';
import WardenDashboard from './components/WardenDashboard';
import Login from './components/Login';
import SuperAdminPanel from './components/SuperAdminPanel';
import { Application, User, AppStatus, SystemConfig, WardenUser, AppType } from './types';
import { emailService } from './services/emailService';

const App: React.FC = () => {
  const [user, setUser] = useState<User>({ role: 'parent' });
  const [showLogin, setShowLogin] = useState(false);
  const [showCredit, setShowCredit] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [wardens, setWardens] = useState<WardenUser[]>([]);
  const [config, setConfig] = useState<SystemConfig>({
    name: 'e-Asrama',
    logoUrl: null
  });
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info' | 'error' | 'alert'} | null>(null);

  // Persistence & Real-time Sync across tabs
  useEffect(() => {
    const loadData = () => {
      const savedApps = localStorage.getItem('asrama_apps_pro_v2_manual');
      const savedWardens = localStorage.getItem('asrama_wardens');
      const savedConfig = localStorage.getItem('asrama_config');
      
      if (savedApps) setApplications(JSON.parse(savedApps));
      if (savedWardens) setWardens(JSON.parse(savedWardens));
      if (savedConfig) setConfig(JSON.parse(savedConfig));
    };

    loadData();

    // Listen for storage changes from other tabs (Simulated Real-time)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'asrama_apps_pro_v2_manual' && e.newValue) {
        const newApps: Application[] = JSON.parse(e.newValue);
        const oldApps: Application[] = e.oldValue ? JSON.parse(e.oldValue) : [];
        
        setApplications(newApps);

        // If a new pending application is detected and user is staff
        if (newApps.length > oldApps.length && (user.role === 'warden' || user.role === 'superadmin')) {
          const latestApp = newApps[0];
          if (latestApp.status === AppStatus.PENDING) {
            showNotification(`Permohonan Baharu: ${latestApp.studentName} (${latestApp.type})`, 'alert');
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user.role]);

  useEffect(() => {
    localStorage.setItem('asrama_apps_pro_v2_manual', JSON.stringify(applications));
    localStorage.setItem('asrama_wardens', JSON.stringify(wardens));
    localStorage.setItem('asrama_config', JSON.stringify(config));
  }, [applications, wardens, config]);

  const handleApplicationSubmit = async (app: Application) => {
    setApplications(prev => [app, ...prev]);
    showNotification('Permohonan rasmi telah berjaya dihantar ke sistem.', 'success');
    await emailService.notifyWardens(app);
  };

  const handleUpdateStatus = async (id: string, status: AppStatus, comment: string) => {
    // Only warden can trigger this via WardenDashboard, but we add safety check
    if (user.role === 'superadmin') return;

    const wardenName = user.name || "Warden Bertugas";
    const wardenPhone = user.phone || "-";
    const updatedApps = applications.map(app => 
      app.id === id ? { ...app, status, wardenComment: comment, wardenName, wardenPhone } : app
    );
    setApplications(updatedApps);

    const updatedApp = updatedApps.find(a => a.id === id);
    if (updatedApp) {
      showNotification(`Status permohonan telah dikemaskini kepada: ${status.toUpperCase()}`, 'info');
      await emailService.notifyParentAndWardens(updatedApp);
    }
  };

  const showNotification = (message: string, type: 'success' | 'info' | 'error' | 'alert') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 6000);
  };

  const handleLogin = (role: 'warden' | 'superadmin', name: string, phone?: string) => {
    setUser({ role, name, phone });
    setShowLogin(false);
    setShowCredit(true); // Trigger Credit Popup
    showNotification(`Log masuk berjaya. Selamat datang, ${name}`, 'success');
  };

  const pendingCount = applications.filter(a => a.status === AppStatus.PENDING).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar 
        config={config}
        role={user.role} 
        userName={user.name}
        pendingCount={pendingCount}
        onLogout={() => {
          setUser({ role: 'parent' });
          showNotification('Log keluar berjaya dilakukan.', 'info');
        }} 
        onSwitch={() => setShowLogin(true)} 
      />

      {showLogin && (
        <Login 
          config={config}
          wardens={wardens}
          onLogin={handleLogin}
          onCancel={() => setShowLogin(false)}
        />
      )}

      {/* Credit Popup Overlay */}
      {showCredit && (
        <div className="fixed inset-0 z-[150] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-2xl text-center relative overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
            <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">
              Sistem Sedia Digunakan
            </h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10">
              Aplikasi ini disediakan oleh <span className="text-indigo-600 font-black">Cikgu Hasyrul</span> untuk memudahkan pengurusan pergerakan pelajar.
            </p>
            <button 
              onClick={() => setShowCredit(false)}
              className="w-full py-5 gradient-primary text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:scale-[1.03] active:scale-[0.97] transition-all"
            >
              Mula Tugas
            </button>
          </div>
        </div>
      )}
      
      {notification && (
        <div className="fixed top-28 right-6 z-[60] animate-in fade-in slide-in-from-right-8 duration-500">
          <div className={`p-5 rounded-[2rem] shadow-2xl border-4 backdrop-blur-xl flex items-center gap-4 min-w-[360px] ${
            notification.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/20 text-emerald-50' :
            notification.type === 'error' ? 'bg-rose-900/90 border-rose-500/20 text-rose-50' :
            notification.type === 'alert' ? 'bg-indigo-900/95 border-indigo-400/30 text-white animate-bounce' :
            'bg-slate-900/90 border-slate-700 text-slate-50'
          }`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              notification.type === 'success' ? 'bg-emerald-500 text-white' : 
              notification.type === 'alert' ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/30' : 'bg-indigo-500 text-white'
            }`}>
              {notification.type === 'success' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              ) : notification.type === 'alert' ? (
                <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-0.5">
                {notification.type === 'success' ? 'Berjaya' : notification.type === 'alert' ? 'Notifikasi Real-time' : 'Makluman'}
              </p>
              <p className="text-sm font-bold leading-tight">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 py-16 max-w-7xl">
        {user.role === 'superadmin' && (
          <div className="space-y-20 animate-in fade-in slide-in-from-top-4 duration-700">
            <header className="text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-200">
                Pusat Kawalan Utama
              </div>
              <h1 className="text-6xl font-black text-slate-900 tracking-tighter">Sistem Pentadbiran</h1>
              <p className="text-slate-500 text-xl font-medium leading-relaxed">Penyelarasan konfigurasi sistem, identiti visual, dan pengurusan akses warden secara berpusat.</p>
            </header>
            <SuperAdminPanel 
              config={config} 
              wardens={wardens} 
              applications={applications}
              onUpdateConfig={(c) => { setConfig(c); showNotification('Identiti sistem telah dikemaskini.', 'success'); }}
              onAddWarden={(w) => { setWardens([...wardens, w]); showNotification('Akaun warden baharu telah didaftarkan.', 'success'); }}
              onDeleteWarden={(id) => { setWardens(wardens.filter(w => w.id !== id)); showNotification('Akaun warden telah dipadamkan.', 'info'); }}
            />
            <div className="pt-24 space-y-12">
              <div className="flex flex-col items-center gap-2">
                <div className="h-1.5 w-12 bg-indigo-600 rounded-full"></div>
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Pemantauan Kes Seluruh Asrama</h2>
              </div>
              <WardenDashboard 
                applications={applications} 
                onUpdateStatus={handleUpdateStatus} 
                wardenName={user.name}
                wardenPhone={user.phone}
                canAction={false} // CRITICAL: Super Admin is view-only
              />
            </div>
          </div>
        )}

        {user.role === 'warden' && (
          <div className="animate-in fade-in duration-700">
            <WardenDashboard 
              applications={applications} 
              onUpdateStatus={handleUpdateStatus} 
              wardenName={user.name}
              wardenPhone={user.phone}
              canAction={true} // CRITICAL: Warden is allowed to action
            />
          </div>
        )}

        {user.role === 'parent' && (
          <div className="space-y-24">
            <header className="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-8 duration-1000">
              <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-black uppercase tracking-[0.25em] border border-indigo-200 shadow-sm">
                Portal Rasmi Ibu Bapa & Penjaga
              </div>
              <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">
                Pintar & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Sistematik.</span>
              </h1>
              <p className="text-slate-500 text-2xl font-medium leading-relaxed max-w-2xl mx-auto">
                Pengurusan pergerakan pelajar <span className="text-slate-900 font-bold">{config.name}</span> kini lebih mudah dengan sistem permohonan digital 24 jam.
              </p>
            </header>

            <ApplicationForm onSubmit={handleApplicationSubmit} />
            
            <section className="max-w-4xl mx-auto pt-24 space-y-12">
               <div className="flex items-end justify-between border-b-4 border-slate-100 pb-6">
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight">Status Terkini</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Jejak permohonan aktif anda di sini</p>
                  </div>
                  <div className="text-right">
                    <span className="text-5xl font-black text-indigo-100">{applications.length}</span>
                  </div>
               </div>
               
               <div className="grid gap-6">
                {applications.slice(0, 5).map(app => (
                  <div key={app.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center group hover:scale-[1.01] transition-all duration-300">
                    <div className="flex gap-6 items-center">
                       <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-2xl shadow-lg ${
                         app.status === AppStatus.APPROVED ? 'bg-emerald-500 text-white' : 
                         app.status === AppStatus.REJECTED ? 'bg-rose-500 text-white' : 
                         'bg-amber-400 text-white animate-pulse'
                       }`}>
                         {app.type === AppType.BERMALAM ? '🏠' : app.type === AppType.OUTING ? '🚶' : '🏥'}
                       </div>
                       <div>
                         <p className="text-2xl font-black text-slate-800 tracking-tight">{app.studentName}</p>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{app.type} • Keluar: {app.dateOut} • Kembali: {app.dateReturn}</p>
                       </div>
                    </div>
                    <div className="flex flex-col items-end mt-4 md:mt-0 w-full md:w-auto border-t md:border-t-0 border-slate-50 pt-4 md:pt-0">
                       <span className={`px-6 py-2.5 rounded-2xl text-[11px] font-black tracking-[0.1em] uppercase border-2 shadow-sm ${
                          app.status === AppStatus.PENDING ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          app.status === AppStatus.APPROVED ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                       }`}>
                         {app.status}
                       </span>
                    </div>
                  </div>
                ))}
               </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
