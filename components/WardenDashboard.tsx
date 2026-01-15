
import React, { useState, useRef } from 'react';
import { Application, AppStatus, AppType } from '../types';

interface WardenDashboardProps {
  applications: Application[];
  onUpdateStatus: (id: string, status: AppStatus, comment: string) => void;
  wardenName?: string;
  wardenPhone?: string;
  canAction?: boolean; // New prop to control access
}

const WardenDashboard: React.FC<WardenDashboardProps> = ({ applications, onUpdateStatus, wardenName, wardenPhone, canAction = true }) => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stats = {
    pending: applications.filter(a => a.status === AppStatus.PENDING).length,
    approved: applications.filter(a => a.status === AppStatus.APPROVED).length,
    mc: applications.filter(a => a.type === AppType.MC && a.status === AppStatus.PENDING).length
  };

  const handleAction = (status: AppStatus) => {
    if (!selectedApp || !canAction) return;
    setIsProcessing(true);
    setTimeout(() => {
      onUpdateStatus(selectedApp.id, status, comment);
      const updatedApp: Application = { 
        ...selectedApp, 
        status, 
        wardenComment: comment,
        wardenName: wardenName || "Warden Bertugas",
        wardenPhone: wardenPhone || "-"
      };
      setSelectedApp(updatedApp);
      setComment('');
      setIsProcessing(false);
    }, 1200);
  };

  const generateDigitalPass = () => {
    if (!selectedApp) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 1250;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = selectedApp.status === AppStatus.APPROVED ? '#10b981' : '#f43f5e';
    ctx.fillRect(0, 0, canvas.width, 250);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(40, 290, 720, 920);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 45px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAS PERGERAKAN DIGITAL', canvas.width / 2, 100);
    
    ctx.font = '900 75px sans-serif';
    ctx.fillText(selectedApp.status.toUpperCase(), canvas.width / 2, 190);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 24px sans-serif';
    
    let y = 350;
    const drawRow = (label: string, value: string, isSmall = false) => {
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(label.toUpperCase(), 80, y);
      y += 35;
      ctx.fillStyle = '#1e293b';
      ctx.font = isSmall ? 'bold 24px sans-serif' : 'bold 30px sans-serif';
      ctx.fillText(value, 80, y);
      y += 65;
    };

    drawRow('Nama Pelajar', selectedApp.studentName);
    drawRow('Tingkatan', `Tingkatan ${selectedApp.studentForm}`);
    drawRow('Jenis Permohonan', selectedApp.type);
    drawRow('Tarikh Keluar', selectedApp.dateOut);
    drawRow('Tarikh Kembali', selectedApp.dateReturn);
    drawRow('Kenderaan', `${selectedApp.vehicleType} (${selectedApp.vehiclePlate})`);
    
    y += 20;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, y);
    ctx.lineTo(720, y);
    ctx.stroke();
    y += 50;

    // Dinamik Label berdasarkan status
    const approverLabel = selectedApp.status === AppStatus.APPROVED ? 'Diluluskan Oleh' : 'Ditolak Oleh';
    drawRow(approverLabel, selectedApp.wardenName || 'Warden Bertugas');
    drawRow('No. Telefon Warden', selectedApp.wardenPhone || '-');

    if (selectedApp.wardenComment) {
      drawRow('Nota Tambahan', selectedApp.wardenComment, true);
    }

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`ID PENGESAHAN: ${selectedApp.id.toUpperCase()}`, canvas.width / 2, 1220);

    const link = document.createElement('a');
    link.download = `Pas_Digital_${selectedApp.studentName.replace(/\s+/g, '_')}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
  };

  const shareToWhatsApp = () => {
    if (!selectedApp) return;
    
    let phone = selectedApp.parentPhone.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '60' + phone.substring(1);
    } else if (!phone.startsWith('60')) {
      phone = '60' + phone;
    }

    const approverLabel = selectedApp.status === AppStatus.APPROVED ? 'Diluluskan Oleh' : 'Ditolak Oleh';

    const message = `*MAKLUMAN STATUS PERMOHONAN ASRAMA*%0A%0A` +
      `Sistem mengesahkan permohonan berikut telah *${selectedApp.status.toUpperCase()}*:%0A%0A` +
      `*Nama:* ${selectedApp.studentName}%0A` +
      `*Jenis:* ${selectedApp.type}%0A` +
      `*Tarikh:* ${selectedApp.dateOut} - ${selectedApp.dateReturn}%0A%0A` +
      `*${approverLabel}:* ${selectedApp.wardenName || 'Warden Bertugas'}%0A` +
      `*No. Tel Warden:* ${selectedApp.wardenPhone || '-'}%0A` +
      `*Komen:* ${selectedApp.wardenComment || '-'}%0A%0A` +
      `Sila simpan makluman ini untuk rujukan semasa menjemput/menghantar pelajar. Terima kasih.`;

    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const StatusBadge = ({ status }: { status: AppStatus }) => {
    const config = {
      [AppStatus.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
      [AppStatus.APPROVED]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      [AppStatus.REJECTED]: 'bg-rose-100 text-rose-700 border-rose-200',
    };
    return <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-wider shadow-sm ${config[status]}`}>{status}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center justify-center gap-3 bg-white/50 border border-slate-100 py-2 rounded-full w-fit mx-auto px-6 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
        </span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sistem Pemantauan Masa Nyata Aktif</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Perlu Kelulusan', value: stats.pending, icon: '⏳', color: 'indigo', sub: 'Tindakan diperlukan segera' },
          { label: 'Kes MC (Sakit)', value: stats.mc, icon: '🏥', color: 'rose', sub: 'Kes perubatan aktif' },
          { label: 'Jumlah Diluluskan', value: stats.approved, icon: '✅', color: 'emerald', sub: 'Rekod keseluruhan fasa ini' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 flex items-center justify-between group hover:border-indigo-200 transition-all">
            <div className="space-y-1">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
              <h4 className="text-5xl font-black text-slate-800 tracking-tighter">{s.value}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.sub}</p>
            </div>
            <div className={`text-3xl w-16 h-16 bg-${s.color}-50 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Log Permohonan</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semua aktiviti pergerakan</p>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {applications.length === 0 ? (
                <div className="p-24 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">📂</div>
                  <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Peti permohonan kosong</p>
                </div>
              ) : (
                applications.map(app => (
                  <div 
                    key={app.id} 
                    onClick={() => { setSelectedApp(app); setComment(''); }}
                    className={`p-6 flex items-center justify-between cursor-pointer transition-all duration-300 hover:bg-indigo-50/40 group ${selectedApp?.id === app.id ? 'bg-indigo-50/70 border-l-8 border-indigo-600' : 'border-l-8 border-transparent'}`}
                  >
                    <div className="flex gap-5 items-center">
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center text-indigo-600 font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        {app.studentName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-lg tracking-tight leading-none mb-1">{app.studentName}</h4>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ting. {app.studentForm} • {app.type}</p>
                        <p className="text-[10px] font-black text-indigo-500 uppercase mt-1 tracking-tighter">{app.dateOut} - {app.dateReturn}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <StatusBadge status={app.status} />
                      <p className="text-[10px] text-slate-300 mt-2 font-black uppercase tracking-widest">ID: {app.id.toUpperCase()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          {selectedApp ? (
            <div className="bg-white rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] border border-indigo-100 overflow-hidden sticky top-28 animate-in zoom-in-95 duration-300">
              <div className="p-10 space-y-8">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.3em] bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm">Perincian Kes</span>
                    <h3 className="text-3xl font-black text-slate-800 mt-4 tracking-tighter leading-none">{selectedApp.studentName}</h3>
                  </div>
                  <button onClick={() => setSelectedApp(null)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-inner">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Penjaga', value: selectedApp.parentName, icon: '👤' },
                    { label: 'No. Telefon', value: selectedApp.parentPhone, icon: '📞' }
                  ].map((d, i) => (
                    <div key={i} className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <span className="text-xs">{d.icon}</span> {d.label}
                      </p>
                      <p className="text-sm font-black text-slate-800 truncate">{d.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50 space-y-4">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span>🚗</span> Maklumat Kenderaan
                  </p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-black text-slate-700">{selectedApp.vehicleType || 'Tiada maklumat'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-indigo-600 bg-white px-3 py-1 rounded-lg border border-indigo-100 inline-block">{selectedApp.vehiclePlate || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                    <p className="text-sm text-indigo-100 leading-relaxed font-bold italic relative z-10">"{selectedApp.reason}"</p>
                  </div>

                  {selectedApp.attachment && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em] ml-2">Bukti Lampiran (MC / Surat)</p>
                      <div className="group relative rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl bg-slate-100">
                        <img 
                          src={selectedApp.attachment} 
                          className="w-full h-auto max-h-[300px] object-contain group-hover:scale-105 transition-transform duration-700" 
                          alt="Lampiran Dokumen" 
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                           <button 
                             onClick={() => {
                               const win = window.open();
                               if (win && selectedApp.attachment) {
                                 win.document.write(`<img src="${selectedApp.attachment}" style="max-width:100%; height:auto;" />`);
                               }
                             }} 
                             className="bg-white px-6 py-2.5 rounded-xl text-[10px] font-black text-slate-900 shadow-2xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                           >
                             Lihat Gambar Penuh
                           </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {selectedApp.status === AppStatus.PENDING ? (
                  <div className="space-y-6 pt-10 border-t-4 border-slate-50">
                    {canAction ? (
                      <>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ulasan Warden (Pilihan)</p>
                          <textarea 
                            placeholder="Berikan komen..." 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all resize-none shadow-inner"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            disabled={isProcessing}
                            onClick={() => handleAction(AppStatus.REJECTED)}
                            className="py-5 bg-white text-rose-600 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-rose-50 transition-all border-2 border-rose-100 shadow-lg active:scale-95"
                          >
                            Tolak
                          </button>
                          <button 
                            disabled={isProcessing}
                            onClick={() => handleAction(AppStatus.APPROVED)}
                            className="py-5 gradient-primary text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            {isProcessing ? 'Memproses...' : 'Luluskan'}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 text-center space-y-3">
                         <p className="text-2xl">👁️</p>
                         <p className="text-[11px] font-black text-indigo-700 uppercase tracking-widest leading-relaxed">
                           Paparan Sahaja (Super Admin)<br/>
                           <span className="text-indigo-400 font-bold normal-case">Hanya akaun Warden yang sah dibenarkan untuk meluluskan atau menolak permohonan pelajar.</span>
                         </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 pt-10 border-t-4 border-slate-50 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        {selectedApp.status === AppStatus.APPROVED ? 'Diluluskan Oleh' : 'Ditolak Oleh'}
                      </p>
                      <div className="mb-4">
                        <p className="text-sm font-black text-slate-800">{selectedApp.wardenName}</p>
                        <p className="text-xs font-bold text-slate-500">{selectedApp.wardenPhone}</p>
                      </div>
                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={generateDigitalPass}
                          className="w-full py-4 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-sm font-black text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
                        >
                          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Pas Digital (JPEG)
                        </button>
                        
                        <button 
                          onClick={shareToWhatsApp}
                          className="w-full py-4 bg-emerald-500 text-white rounded-2xl flex items-center justify-center gap-3 text-sm font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          WhatsApp Penjaga
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-[600px] bg-slate-100/50 border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-center p-16">
               <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center text-5xl mb-8 border border-slate-100">📋</div>
               <h4 className="text-2xl font-black text-slate-800 tracking-tight">Pilih Rekod</h4>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-4">Klik pada senarai untuk membuat keputusan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WardenDashboard;
