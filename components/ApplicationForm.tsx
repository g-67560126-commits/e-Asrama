
import React, { useState, useEffect } from 'react';
import { AppType, Application, AppStatus } from '../types';

interface ApplicationFormProps {
  onSubmit: (app: Application) => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    type: AppType.OUTING,
    studentName: '',
    studentForm: '1',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    vehicleType: '',
    vehiclePlate: '',
    dateOut: '',
    dateReturn: '',
    reason: '',
  });
  const [file, setFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => setFile(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation: Return date cannot be before Out date
    if (formData.dateReturn < formData.dateOut) {
      alert("Tarikh kembali tidak boleh lebih awal daripada tarikh keluar.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        attachment: file || undefined,
        status: AppStatus.PENDING,
        createdAt: new Date().toISOString(),
      });
      setIsSubmitting(false);
      setFormData({ 
        type: AppType.OUTING, 
        studentName: '', 
        studentForm: '1', 
        parentName: '', 
        parentPhone: '', 
        parentEmail: '', 
        vehicleType: '',
        vehiclePlate: '',
        dateOut: '', 
        dateReturn: '', 
        reason: '' 
      });
      setFile(null);
    }, 1500);
  };

  const InputLabel = ({ label, required = false }: { label: string; required?: boolean }) => (
    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Maklumat Pergerakan */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white p-2">
          <div className="bg-slate-50/50 rounded-[1.8rem] p-8 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Maklumat Pergerakan</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sila pilih jenis dan tarikh</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <InputLabel label="Jenis Permohonan" required />
                <div className="flex flex-col gap-2">
                  {Object.values(AppType).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`group relative overflow-hidden text-left px-6 py-4 rounded-2xl border-2 transition-all duration-300 ${
                        formData.type === t 
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                          : 'border-slate-100 bg-white text-slate-600 hover:border-indigo-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <span className="font-bold">{t}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.type === t ? 'border-white bg-white' : 'border-slate-200'}`}>
                          {formData.type === t && <div className="w-2 h-2 bg-indigo-600 rounded-full animate-in zoom-in"></div>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <InputLabel label="Tarikh Keluar" required />
                  <input 
                    required 
                    type="date" 
                    value={formData.dateOut} 
                    onChange={(e) => setFormData({ ...formData, dateOut: e.target.value })} 
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700 shadow-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <InputLabel label="Tarikh Kembali (Sila Pilih)" required />
                  <input 
                    required 
                    type="date" 
                    min={formData.dateOut}
                    value={formData.dateReturn} 
                    onChange={(e) => setFormData({ ...formData, dateReturn: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700 shadow-sm" 
                  />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide px-2">Sila pastikan tarikh kembali adalah selepas tarikh keluar.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Butiran Pelajar & Penjaga */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white p-2">
          <div className="bg-slate-50/50 rounded-[1.8rem] p-8 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Butiran Pelajar & Penjaga</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Maklumat hubungan dan kenderaan rasmi</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <InputLabel label="Nama Penuh Pelajar" required />
                  <input required type="text" placeholder="Cth: Muhammad Izzat Bin Ramli" value={formData.studentName} onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none font-bold text-slate-700 shadow-sm" />
                </div>
                <div>
                  <InputLabel label="Tingkatan" required />
                  <select value={formData.studentForm} onChange={(e) => setFormData({ ...formData, studentForm: e.target.value })} className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none font-bold text-slate-700 shadow-sm appearance-none bg-white">
                    {[1, 2, 3, 4, 5].map(f => <option key={f} value={f}>Tingkatan {f}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/50">
                 <div>
                   <InputLabel label="Nama Penuh Penjaga" required />
                   <input required type="text" placeholder="Cth: Ramli Bin Ahmad" value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none font-bold text-slate-700 shadow-sm" />
                 </div>
                 <div>
                   <InputLabel label="No. Telefon" required />
                   <input required type="tel" placeholder="01X-XXXXXXX" value={formData.parentPhone} onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })} className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none font-bold text-slate-700 shadow-sm" />
                 </div>
                 <div className="md:col-span-2">
                   <InputLabel label="Emel Rasmi" required />
                   <input required type="email" placeholder="penjaga@email.com" value={formData.parentEmail} onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })} className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none font-bold text-slate-700 shadow-sm" />
                 </div>
              </div>

              {/* Bahagian Kenderaan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/50">
                <div>
                  <InputLabel label="Jenis Kenderaan" required />
                  <input required type="text" placeholder="Cth: Toyota Vios / Perodua Myvi" value={formData.vehicleType} onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })} className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none font-bold text-slate-700 shadow-sm" />
                </div>
                <div>
                  <InputLabel label="Nombor Plat Kenderaan" required />
                  <input required type="text" placeholder="Cth: ABC 1234" value={formData.vehiclePlate} onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value.toUpperCase() })} className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none font-bold text-slate-700 shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Justifikasi & Dokumen */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white p-2">
          <div className="bg-slate-50/50 rounded-[1.8rem] p-8 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Justifikasi & Dokumen</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sebab dan bukti lampiran</p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <InputLabel label="Sebab Permohonan" required />
                <textarea required rows={4} placeholder="Sila nyatakan sebab permohonan dengan jelas untuk pertimbangan warden..." value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="w-full border border-slate-200 rounded-3xl px-6 py-5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none font-bold text-slate-700 shadow-sm resize-none" />
              </div>
              
              <div>
                <InputLabel label="Lampiran Dokumen (MC / Surat Rasmi)" />
                <div className="relative group">
                  <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full min-h-[180px] border-4 border-dashed border-slate-200 rounded-[2.5rem] cursor-pointer bg-white hover:bg-slate-50 hover:border-indigo-400 transition-all duration-300 group shadow-inner">
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      {file ? (
                        <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                          <div className="relative">
                            <img src={file} className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-2xl" />
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] shadow-lg">✓</div>
                          </div>
                          <span className="text-sm font-black text-emerald-600 uppercase tracking-wider">Dokumen Sedia Dimuat Naik</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-slate-300 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                          </div>
                          <p className="text-sm font-bold text-slate-500 tracking-tight">Klik untuk memuat naik atau seret dokumen ke sini</p>
                          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-[0.2em]">PDF, JPEG, PNG sahaja</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button 
          disabled={isSubmitting}
          type="submit"
          className="group w-full py-6 gradient-primary rounded-[2rem] font-black text-white shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xl flex items-center justify-center gap-4"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Sedang Mengesahkan...
            </>
          ) : (
            <>
              Hantar Permohonan Rasmi
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ApplicationForm;
