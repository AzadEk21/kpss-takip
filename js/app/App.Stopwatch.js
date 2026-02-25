import { UI } from '../ui/UI.js';

export const Stopwatch = {
    timer: null, sec: 0, isRunning: false, activeSubject: null,
    start() {
        const subj = document.getElementById('studySubject').value; if(!subj) return UI.showToast("Önce ders seçmelisin!", "var(--danger)");
        this.activeSubject = subj; if(this.isRunning) return; this.isRunning = true;
        this.timer = setInterval(() => { this.sec++; UI.updateStopwatchDisplay(); }, 1000);
        document.getElementById('swStartBtn').style.display = 'none'; document.getElementById('swPauseBtn').style.display = 'inline-flex'; document.getElementById('studySubject').disabled = true;
    },
    pause() {
        this.isRunning = false; clearInterval(this.timer);
        const sBtn = document.getElementById('swStartBtn'); const pBtn = document.getElementById('swPauseBtn');
        if(sBtn) sBtn.style.display = 'inline-flex'; if(pBtn) pBtn.style.display = 'none';
    },
    reset() { this.pause(); this.sec = 0; this.activeSubject = null; document.getElementById('studySubject').disabled = false; UI.updateStopwatchDisplay(); },
    async save() {
        if(this.sec < 60) return UI.showToast("Kaydetmek için en az 1 dakika çalışmalısın.", "var(--warning)");
        this.pause(); const mins = Math.floor(this.sec / 60); 
        await window.App.addStudySession(this.activeSubject, mins); 
        this.reset();
    }
};