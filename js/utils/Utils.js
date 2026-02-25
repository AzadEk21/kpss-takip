import { State } from '../state/State.js';

export const PALETTE = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71', '#F1C40F', '#E74C3C', '#1ABC9C', '#34495E', '#95A5A6', '#D35400', '#C0392B', '#16A085', '#27AE60', '#8E44AD'];

export const Utils = {
    toSec(str) { if(!str) return 0; const h=str.match(/(\d+)h/), m=str.match(/(\d+)m/), s=str.match(/(\d+)s/); return (h?+h[1]*3600:0) + (m?+m[1]*60:0) + (s?+s[1]:0); },
    formatTime(sec) { if(isNaN(sec) || sec < 0) return "0dk 0sn"; const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = Math.floor(sec%60); return h>0 ? `${h}sa ${m}dk` : `${m}dk ${s}sn`; },
    pad(num) { return num.toString().padStart(2, '0'); },
    parseISODuration(iso) { const match = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/); if(!match) return 0; return ((parseInt(match[1])||0)*3600) + ((parseInt(match[2])||0)*60) + (parseInt(match[3])||0); },
    getLocalDateStr(dateObj) { const d = new Date(dateObj); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0,10); },
    getWeekStart(w, y) { let simple = new Date(y, 0, 1 + (w - 1) * 7); let dow = simple.getDay(); let ISOweekStart = simple; if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1); else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay()); return ISOweekStart; },
    getWeek(dateStr) { try { const d = new Date(dateStr); d.setHours(0,0,0,0); d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7); const w = new Date(d.getFullYear(), 0, 4); return `${d.getFullYear()}-W${String(Math.round(((d.getTime() - w.getTime()) / 86400000 - 3 + (w.getDay() + 6) % 7) / 7) + 1).padStart(2,'0')}`; } catch(e) { return "2026-W01"; } },
    
    getDersOrtalamaNetleri() {
        const dersler = { turkce: [], matematik: [], tarih: [], cografya: [], vatandaslik: [], guncel: [] };

        State.mockExams.forEach(exam => {
            if (exam.turkce) dersler.turkce.push(Math.max(0, exam.turkce.net || 0));
            if (exam.matematik) dersler.matematik.push(Math.max(0, exam.matematik.net || 0));
            if (exam.tarih) dersler.tarih.push(Math.max(0, exam.tarih.net || 0));
            if (exam.cografya) dersler.cografya.push(Math.max(0, exam.cografya.net || 0));
            if (exam.vatandaslik) dersler.vatandaslik.push(Math.max(0, exam.vatandaslik.net || 0));
            if (exam.guncel) dersler.guncel.push(Math.max(0, exam.guncel.net || 0));
        });

        const ortalama = arr => arr.length ? (arr.reduce((a,b)=>a+b,0) / arr.length) : 0;

        return {
            turkce: ortalama(dersler.turkce),
            matematik: ortalama(dersler.matematik),
            tarih: ortalama(dersler.tarih),
            cografya: ortalama(dersler.cografya),
            vatandaslik: ortalama(dersler.vatandaslik),
            guncel: ortalama(dersler.guncel)
        };
    }
};