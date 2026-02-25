import { DB } from '../db/DB.js';
import { State, ExtSettings } from '../state/State.js';
import { Game } from '../game/Game.js';
import { UI } from '../ui/UI.js';
import { Utils, PALETTE } from '../utils/Utils.js';

export const addCourseBase = async (name, videos, type='video') => {
    if(State.courses.find(c => c.name === name)) return UI.showToast("Bu ders zaten var!", "var(--danger)");
    const usedColors = State.courses.map(c=>c.color); let color = State.selectedColor || PALETTE[0];
    if(usedColors.includes(color)) color = PALETTE.find(p => !usedColors.includes(p)) || color;
    const c = { name, type, color, videos, userId: State.currentUser.id }; await State.saveCourse(c); State.courses.push(c);
    UI.closeModal('addCourseModal'); UI.showToast(`${name} Eklendi!`); UI.switchTab(name);
};

export const handleCSV = (e) => {
    const name = document.getElementById('newCourseName').value.trim(); if(!name) return UI.showToast("Ders adı zorunlu!", "var(--danger)");
    const f = e.target.files[0]; if(!f) return; const reader = new FileReader();
    reader.onload = async ev => {
        const lines = ev.target.result.split('\n'); const vids = [];
        for(let i=1; i<lines.length; i++) {
            const l = lines[i].trim(); if(!l) continue; const p = l.split(','); if(p.length<4) continue;
            const url = p[1].replace(/"/g,'').trim(), dur = p[p.length-1].replace(/"/g,'').trim(); const title = p.slice(2, p.length-1).join(',').replace(/"/g,'').trim();
            vids.push({ id:`vid_${Date.now()}_${i}`, title, url, duration:dur, sec:Utils.toSec(dur), watched:false, note:'' });
        }
        if(vids.length>0) window.App.addCourseBase(name, vids);
    }; reader.readAsText(f); e.target.value='';
};

export const handleYouTube = async () => {
    const name = document.getElementById('newCourseName').value.trim(); const apiKey = document.getElementById('ytApiKey').value.trim(); let link = document.getElementById('ytPlaylist').value.trim();
    if(!name || !apiKey || !link) return UI.showToast("Tüm alanları doldurun", "var(--danger)");
    let plId = link; if(link.includes('list=')) plId = new URLSearchParams(link.split('?')[1]).get('list');
    const btn = document.getElementById('ytBtn'); btn.innerText = "Çekiliyor..."; btn.disabled = true;
    try {
        let vids=[], token='';
        do {
            const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${plId}&key=${apiKey}&pageToken=${token}`);
            if(!res.ok) throw new Error("API Hatası. Linki veya Key'i kontrol et.");
            const data = await res.json(); if(!data.items || data.items.length === 0) break;
            const ids = data.items.map(i => i.snippet.resourceId.videoId).join(',');
            const vRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${apiKey}`); const vData = await vRes.json();
            data.items.forEach((item, idx) => {
                const snip = item.snippet, detail = vData.items.find(v=>v.id===snip.resourceId.videoId);
                if(snip.title !== "Private video" && detail) { const sec = Utils.parseISODuration(detail.contentDetails.duration); vids.push({ id:`vid_${Date.now()}_${idx}`, title:snip.title, url:`https://www.youtube.com/watch?v=${snip.resourceId.videoId}`, duration:Utils.formatTime(sec), sec, watched:false, note:'' }); }
            }); token = data.nextPageToken || '';
        } while(token);
        if(vids.length>0) { State.settings.ytApiKey = apiKey; await State.saveSettings(); window.App.addCourseBase(name, vids); } else UI.showToast("Video bulunamadı", "var(--warning)");
    } catch(e) { UI.showToast(e.message, "var(--danger)"); } finally { btn.innerText = "Listeyi Çek"; btn.disabled = false; }
};

export const createTestCourse = () => { const name = document.getElementById('newCourseName').value.trim(); if(!name) return UI.showToast("Ders adı zorunlu!", "var(--danger)"); window.App.addCourseBase(name, [], 'test'); };

export const toggleVid = async (el, encName, vId) => {
    const cName = decodeURIComponent(encName); const c = State.courses.find(x=>x.name===cName); if(!c) return; const v = c.videos.find(x=>x.id===vId); if(!v) return;
    v.watched = el.checked; v.watchedDate = v.watched ? State.today : null; await State.saveCourse(c);
    const log = State.logs.find(l=>l.realDate===State.today); 
    
    // TIKLAMA ANİMASYONU
    if(ExtSettings.data.animations) {
        const itemDiv = el.closest('.list-item');
        if(itemDiv) { itemDiv.classList.add('check-pop'); setTimeout(() => itemDiv.classList.remove('check-pop'), 300); }
    }

    let videoXP = 5; const mins = (v.sec || 0) / 60;
    if(mins > 90) videoXP = 30; else if(mins > 60) videoXP = 25; else if(mins > 45) videoXP = 20; else if(mins > 30) videoXP = 15; else if(mins > 15) videoXP = 10;

    if(log && v.watched) {
        log.videoCount = (log.videoCount || 0) + 1; 
        
        // SAATLİK VERİM TAKİBİ İÇİN:
        const hr = new Date().getHours();
        if(!log.hourStats) log.hourStats = {};
        log.hourStats[hr] = (log.hourStats[hr] || 0) + 1;

        Game.addXP(videoXP, 'Video İzlendi');
        window.App.SRS.add('video', v.id, v.title, c.name);

        if(c.videos.every(x=>x.watched)) if(ExtSettings.data.animations) window.App.fireConfetti();
        const vidTask = State.settings.taskList.find(t=>t.id==='vid');
        if(vidTask && log.videoCount === vidTask.target) { State.settings.combo = (State.settings.combo || 0) + 1; await State.saveSettings(); Game.addXP(10, 'Görev Tamamlandı'); UI.showToast(`🔥 Hedef Tamam! Combo: ${State.settings.combo}`); }
    } else if(log && !v.watched) { 
        const vidTask = State.settings.taskList.find(t=>t.id==='vid');
        if(vidTask && log.videoCount === vidTask.target) { State.settings.combo = Math.max(0, (State.settings.combo || 0) - 1); await State.saveSettings(); Game.removeXP(10, 'Görev İptal'); }
        log.videoCount = Math.max(0, (log.videoCount || 0) - 1); Game.removeXP(videoXP, 'Video İptal');
    }
    await State.saveLog(log); UI.renderMain(); UI.updateXPFooter();
};

export const deleteCourse = async (name) => {
    if(ExtSettings.confirm(`"${name}" adlı dersi ve içindeki her şeyi silmek istediğine emin misin?`)) { 
        const c = State.courses.find(x=>x.name===name);
        if(c && c.type !== 'test') {
            const watchedToday = (c.videos||[]).filter(v => v.watched && v.watchedDate === State.today).length;
            const log = State.logs.find(l => l.realDate === State.today);
            if(log && watchedToday > 0) { log.videoCount = Math.max(0, (log.videoCount || 0) - watchedToday); await State.saveLog(log); }
        }
        const relatedTests = State.tests.filter(t => t.subject === name); 
        for(let rt of relatedTests) { await DB.delete('tests', rt.id); } 
        State.tests = State.tests.filter(t => t.subject !== name);
        State.courses = State.courses.filter(x=>x.name!==name); 
        await DB.delete('courses', name); 
        
        // Sildiğimiz ders şu an açık olansa ekranı boşa düşür
        if(window.UI.activeVideoCourse === name) window.UI.activeVideoCourse = null;
        if(window.UI.activeTestCourse === name) window.UI.activeTestCourse = null;

        window.UI.renderMain(); 
        window.UI.showToast(`${name} başarıyla silindi.`, 'var(--warning)');
    }
};

export const saveNote = async (cName, vId, text) => { const c = State.courses.find(x=>x.name===cName); if(!c) return; const v = c.videos.find(x=>x.id===vId); if(!v) return; v.note = text; await State.saveCourse(c); const log = State.logs.find(l=>l.realDate===State.today); if(log) { log.tasks['note'] = (log.tasks['note']||0)+1; await State.saveLog(log); Game.checkTask('note'); } };

export const updateCourseGoal = (cName, val) => { State.settings.courseGoals[cName] = parseInt(val) || 3; State.saveSettings(); UI.renderMain(); };
export const updateCourseTestGoal = (cName, val) => { if(!State.settings.courseTestGoals) State.settings.courseTestGoals={}; State.settings.courseTestGoals[cName] = parseInt(val) || 0; State.saveSettings(); UI.renderMain(); };