
import { GoogleGenAI } from "@google/genai";
import { Application, AppStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const emailService = {
  async notifyWardens(app: Application) {
    const prompt = `Anda adalah sistem pengurusan asrama automatik. Hasilkan emel notifikasi RASMI dan PROFESIONAL dalam Bahasa Melayu untuk Warden.
      Subjek emel: PERMOHONAN KELUAR ASRAMA (PENDING) - ${app.studentName}
      Butiran:
      Nama: ${app.studentName}
      Kelas: Tingkatan ${app.studentForm}
      Jenis: ${app.type}
      Tarikh: ${app.dateOut} hingga ${app.dateReturn}
      Kenderaan: ${app.vehicleType} (${app.vehiclePlate})
      Sebab: ${app.reason}
      Mesej: Minta warden untuk menyemak permohonan ini di Portal e-Asrama dengan kadar segera untuk tujuan keselamatan dan pengesahan kenderaan penjemput.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      console.log("%c[PORTAL EMEL: KEPADA WARDEN]", "color: #4f46e5; font-weight: 800; font-size: 12px;");
      console.log(response.text);
      return response.text;
    } catch (error) {
      console.error("Gagal menjana emel:", error);
    }
  },

  async notifyParentAndWardens(app: Application) {
    const statusText = app.status === AppStatus.APPROVED ? "DILULUSKAN" : "TIDAK DILULUSKAN";
    const prompt = `Hasilkan emel RASMI dari Pejabat Warden Asrama kepada Ibu Bapa (${app.parentName}).
      Status: ${statusText}
      Komen Warden: ${app.wardenComment || 'Tiada'}
      Pelajar: ${app.studentName}
      Permohonan: ${app.type}
      Pastikan nada emel adalah formal, profesional dan mengikut format surat rasmi sekolah. Nyatakan tarikh kembali yang wajib dipatuhi.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      console.log(`%c[PORTAL EMEL: KEPADA PENJAGA]`, "color: #059669; font-weight: 800; font-size: 12px;");
      console.log(response.text);
      return response.text;
    } catch (error) {
      console.error("Gagal menjana emel:", error);
    }
  }
};
