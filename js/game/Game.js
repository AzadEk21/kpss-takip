import { State, ExtSettings } from '../state/State.js';
import { UI } from '../ui/UI.js';

export const Game = {
    titles: ["Çömez", "Çırak", "Kalfa", "Usta", "Uzman", "Hafıza Lordu", "Siber Zihin", "KPSS Efsanesi"],
    getTreeStage(lvl) {
        if(lvl <= 3) return { emoji: '🌱', name: 'Tohum' }; if(lvl <= 8) return { emoji: '🌿', name: 'Filiz' };
        if(lvl <= 15) return { emoji: '🪴', name: 'Küçük Fidan' }; if(lvl <= 25) return { emoji: '🌳', name: 'Genç Ağaç' };
        return { emoji: '🍎', name: 'Meyve Veren Büyük Ağaç' };
    },
    addXP(amount, reason) {
        if(isNaN(amount) || amount <= 0) return; State.settings.xp = (State.settings.xp || 0) + amount + ((State.settings.combo || 0) * 2); 
        State.saveSettings(); UI.showToast(`+${amount} XP (${reason})`, "var(--xp-color)"); UI.updateXPFooter();
        
        if(ExtSettings.data.animations && ExtSettings.data.microAnimations) {
            const fBar = document.getElementById('xpFooterBar');
            if(fBar) { fBar.classList.remove('glow'); void fBar.offsetWidth; fBar.classList.add('glow'); }
        }
    },
    removeXP(amount, reason) {
        if(isNaN(amount) || amount <= 0) return; State.settings.xp = Math.max(0, (State.settings.xp || 0) - amount);
        State.saveSettings(); UI.showToast(`-${amount} XP (${reason})`, "var(--danger)"); UI.updateXPFooter();
    },
    checkTask(id) {
        const log = State.logs.find(l => l.date === State.today); if(!log) return;
        const task = State.settings.taskList.find(t=>t.id===id); if(!task) return;
        let current = id === 'vid' ? log.videoCount : (log.tasks[id] || 0);
        if(current === task.target) { this.addXP(10, 'Görev Tamamlandı'); } UI.updateXPFooter();
    },
    getLvlInfo() {
        const xp = State.settings.xp || 0; const lvl = Math.floor(Math.sqrt(xp/50)) + 1; const title = this.titles[Math.min(Math.floor(lvl/5), this.titles.length-1)];
        const next = Math.pow(lvl, 2)*50, prev = Math.pow(lvl-1, 2)*50; return { lvl, title, progress: ((xp-prev)/(next-prev))*100, xp, next };
    },
    getBadges(p, courseName) {
        let b = [];
        if(p>=25) b.push(`<div style="display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border:1px solid #2ECC71; border-radius:20px; background:rgba(46, 204, 113, 0.1); font-weight:bold; font-size:0.85em; box-shadow:0 4px 6px rgba(0,0,0,0.3); margin-bottom:5px;"><span style="font-size:16px;">🟢</span> ${courseName} Çırağı</div>`);
        if(p>=50) b.push(`<div style="display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border:1px solid #3498DB; border-radius:20px; background:rgba(52, 152, 219, 0.1); font-weight:bold; font-size:0.85em; box-shadow:0 4px 6px rgba(0,0,0,0.3); margin-bottom:5px;"><span style="font-size:16px;">🔵</span> ${courseName} Kalfası</div>`);
        if(p>=75) b.push(`<div style="display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border:1px solid #9B59B6; border-radius:20px; background:rgba(155, 89, 182, 0.1); font-weight:bold; font-size:0.85em; box-shadow:0 4px 6px rgba(0,0,0,0.3); margin-bottom:5px;"><span style="font-size:16px;">🟣</span> ${courseName} Ustası</div>`);
        if(p===100) b.push(`<div style="display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border:1px solid #F1C40F; border-radius:20px; background:rgba(241, 196, 15, 0.1); font-weight:bold; font-size:0.85em; box-shadow:0 4px 6px rgba(0,0,0,0.3); margin-bottom:5px;"><span style="font-size:16px;">👑</span> ${courseName} Fatihi</div>`);
        return b.join(' ');
    }
};