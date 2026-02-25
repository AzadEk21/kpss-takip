import { DB } from '../db/DB.js';
import { Auth } from '../auth/Auth.js';
import { State, ExtSettings } from '../state/State.js';
import { UI } from '../ui/UI.js';
import { Game } from '../game/Game.js';
import { PALETTE } from '../utils/Utils.js';

import { Stopwatch } from './App.Stopwatch.js';
import { SRS } from './App.SRS.js'; // SRS IMPORT EDİLDİ
import * as Courses from './App.Courses.js';
import * as Tests from './App.Tests.js';
import * as Topics from './App.Topics.js';
import * as Backup from './App.Backup.js';

export const App = {
    Stopwatch, SRS, ...Courses, ...Tests, ...Topics, ...Backup,

    async init() {
        try {
            ExtSettings.load(); 
            await DB.init(); 
            
            const hasSession = await Auth.restoreSession();
            if (hasSession) {
                document.getElementById('authModal').style.display = 'none';
                document.getElementById('mainAppWrapper').style.display = 'block';
                await State.load();
                document.getElementById('topBarUserName').innerText = `👤 ${State.currentUser.displayName}`;
                UI.init();
            } else {
                document.getElementById('authModal').style.display = 'flex';
                document.getElementById('mainAppWrapper').style.display = 'none';
            }
        } catch(e) { console.error(e); UI.showToast("Başlatma hatası", "var(--danger)"); }
    },

    async addStudySession(subj, mins) {
        if(!subj) return UI.showToast("Ders seçmelisin!", "var(--danger)"); if(isNaN(mins) || mins <= 0) return UI.showToast("Geçerli bir süre girin", "var(--danger)");
        const xp = Math.floor(mins / 10) * 5; 
        const session = { date: State.today, subject: subj, minutes: mins, xp: xp, userId: State.currentUser.id };
        await DB.put('studySessions', session); State.studySessions = await State.applyMigrationFilter('studySessions');
        if(xp > 0) Game.addXP(xp, 'Serbest Çalışma'); UI.showToast(`${mins} dakika kaydedildi!`, "var(--success)"); UI.renderMain();
    },

    async deleteStudySession(id) {
        if(ExtSettings.confirm("Bu çalışmayı silmek istediğine emin misin?")) {
            const s = State.studySessions.find(x => x.id === id); if(s && s.xp > 0) Game.removeXP(s.xp, 'Çalışma Silindi');
            await DB.delete('studySessions', id); State.studySessions = await State.applyMigrationFilter('studySessions'); UI.renderMain();
        }
    },

    async updateTaskTarget(id, val) { const num = parseInt(val); if(isNaN(num) || num<1) return; const task = State.settings.taskList.find(t=>t.id===id); if(task) { task.target = num; await State.saveSettings(); UI.renderMain(); UI.updateXPFooter(); } },
    async deleteCustomTask(id) { if(ExtSettings.confirm("Bu görevi silmek istediğine emin misin?")) { State.settings.taskList = State.settings.taskList.filter(t=>t.id !== id); await State.saveSettings(); UI.renderMain(); UI.updateXPFooter(); } },
    async addCustomTask() { const icon = document.getElementById('newTaskIcon').value.trim() || '⭐'; const title = document.getElementById('newTaskTitle').value.trim(); const target = parseInt(document.getElementById('newTaskTarget').value); if(!title || isNaN(target) || target<1) return UI.showToast("Görev Adı ve Hedef girin", "var(--danger)"); State.settings.taskList.push({ id: 'task_'+Date.now(), icon, title, target, isSys: false }); await State.saveSettings(); UI.renderMain(); UI.updateXPFooter(); },
    
    async incrementTask(id) { const log = State.logs.find(l=>l.realDate===State.today); if(log) { log.tasks[id] = (log.tasks[id] || 0) + 1; await State.saveLog(log); Game.checkTask(id); } },
    async decrementTask(id) { const log = State.logs.find(l=>l.realDate===State.today); if(log && log.tasks[id] > 0) { const task = State.settings.taskList.find(t=>t.id===id); if(task && log.tasks[id] === task.target) { Game.removeXP(10, 'Görev İptal'); } log.tasks[id] -= 1; await State.saveLog(log); UI.updateXPFooter(); } },
    
    fireConfetti() {
        if(!ExtSettings.data.animations) return;
        const canvas = document.getElementById('confetti'); const ctx = canvas.getContext('2d'); canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        const pieces = Array.from({length:150}, ()=>({ x:Math.random()*canvas.width, y:-10, c:PALETTE[Math.floor(Math.random()*PALETTE.length)], s:Math.random()*8+4, sp:Math.random()*5+2, a:Math.random()*6 }));
        function draw() { ctx.clearRect(0,0, canvas.width, canvas.height); let active=false; pieces.forEach(p => { p.y+=p.sp; p.x+=Math.sin(p.a); p.a+=0.1; ctx.fillStyle=p.c; ctx.fillRect(p.x, p.y, p.s, p.s); if(p.y<canvas.height) active=true; }); if(active) requestAnimationFrame(draw); else ctx.clearRect(0,0, canvas.width, canvas.height); } draw();
    },
    async resetAccount() {
        if(window.confirm("⚠️ DİKKAT! Bu hesaba ait TÜM VERİLER (dersler, testler, görevler, XP'ler) kalıcı olarak silinecektir. Geri alınamaz. Onaylıyor musunuz?")) {
            if(window.confirm("Son Kararın Mı? Her şey siliniyor...")) {
                await DB.clearUserData(State.currentUser.id);
                await DB.delete('users', State.currentUser.username);
                await window.Auth.logout(); // Çıkış yap ve giriş ekranına dön
            }
        }
    }
};