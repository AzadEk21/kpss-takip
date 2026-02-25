import { DB } from '../db/DB.js';
import { State } from '../state/State.js';
import { UI } from '../ui/UI.js';

export const exportBackup = () => {
    const data = { courses:State.courses, settings:State.settings, logs:State.logs, tests:State.tests, studySessions:State.studySessions, mockExams:State.mockExams, topics:State.topics };
    const a = document.createElement('a'); a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data)); 
    a.download = `KPSS_Yedek_${State.currentUser.username}_${State.today}.json`; a.click();
};

export const importBackup = (e) => {
    const f = e.target.files[0]; if(!f) return; 
    if(!window.confirm("Kendi verileriniz silinip seçili yedek yüklenecek (Diğer kullanıcılar etkilenmez). Emin misiniz?")) { e.target.value=''; return; }
    const r = new FileReader();
    r.onload = async ev => {
        try {
            const data = JSON.parse(ev.target.result);
            if (!data || !data.settings) throw new Error("Geçersiz yedek dosyası!");
            
            // SADECE aktif kullanıcının verilerini temizle
            await DB.clearUserData(State.currentUser.id);

            const uId = State.currentUser.id;
            for(let c of data.courses||[]) { c.userId = uId; await DB.put('courses', c); }
            if(data.settings) { data.settings.userId = uId; data.settings.id = 'main_'+uId; await DB.put('settings', data.settings); }
            for(let l of data.logs||[]) { l.userId = uId; await DB.put('logs', l); } 
            for(let t of data.tests||[]) { t.userId = uId; await DB.put('tests', t); } 
            for(let s of data.studySessions||[]) { s.userId = uId; await DB.put('studySessions', s); }
            for(let m of data.mockExams||[]) { m.userId = uId; await DB.put('mockExams', m); } 
            for(let tp of data.topics||[]) { tp.userId = uId; await DB.put('topics', tp); }
            
            UI.showToast("Yedek başarıyla yüklendi!", "var(--success)");
            setTimeout(() => location.reload(), 1500);
        } catch(err) { 
            console.error(err);
            UI.showToast("Hatalı dosya!", "var(--danger)"); 
        }
    }; r.readAsText(f);
};