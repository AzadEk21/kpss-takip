import { DB } from '../db/DB.js';
import { Utils, PALETTE } from '../utils/Utils.js';

export const ExtSettings = {
    data: { defaultTab: 'dashboard', density: 'normal', fontSize: 'medium', animations: true, microAnimations: true, confirmDelete: true, defaultAnalyticPeriod: 30 },
    load() { try { const s = JSON.parse(localStorage.getItem('bys_settings_v1')); if(s) this.data = {...this.data, ...s}; } catch(e){} this.apply(); },
    save() { localStorage.setItem('bys_settings_v1', JSON.stringify(this.data)); this.apply(); },
    apply() { document.body.className = `density-${this.data.density} font-${this.data.fontSize}`; const animStyle = document.getElementById('animStyleBlock'); if(!this.data.animations) { if(!animStyle) { const s = document.createElement('style'); s.id = 'animStyleBlock'; s.innerHTML = `* { transition: none !important; animation: none !important; scroll-behavior: auto !important; }`; document.head.appendChild(s); } } else { if(animStyle) animStyle.remove(); } },
    confirm(msg) { if(!this.data.confirmDelete) return true; return window.confirm(msg); }
};

export const State = {
    currentUser: null,
    courses: [], tests: [], logs: [], studySessions: [], mockExams: [], topics: [], srs: [],
    settings: { ytApiKey: '', theme: '#58a6ff', xp: 0, combo: 0, lastActive: null, examDate: '2026-09-06', courseGoals: {}, courseTestGoals: {}, taskList: [] },
    today: '', speed: 1.5, selectedColor: PALETTE[0], globalWeek: '', globalMonth: '',

    async applyMigrationFilter(storeName) {
        const all = await DB.getAll(storeName) || [];
        return await Promise.all(all.map(async item => {
            if (!item.userId) { item.userId = this.currentUser.id; await DB.put(storeName, item); }
            return item;
        })).then(res => res.filter(x => x.userId === this.currentUser.id));
    },

    async load() {
        if(!this.currentUser) return;
        this.today = Utils.getLocalDateStr(new Date());
        
        let sets = await DB.get('settings', 'main_' + this.currentUser.id);
        if(!sets) {
            sets = await DB.get('settings', 'main');
            if(sets && !sets.userId) {
                sets.id = 'main_' + this.currentUser.id; sets.userId = this.currentUser.id;
                await DB.put('settings', sets); await DB.delete('settings', 'main');
            } else {
                sets = { id: 'main_' + this.currentUser.id, userId: this.currentUser.id, ytApiKey: '', xp: 0, combo: 0, taskList: [ { id: 'vid', icon: '▶️', title: 'Video', target: 3, isSys: true }, { id: 'note', icon: '📝', title: 'Not', target: 1, isSys: true }, { id: 'rep', icon: '🔄', title: 'Tekrar', target: 1, isSys: true } ] };
            }
        }
        this.settings = {...this.settings, ...sets};

        this.courses = await this.applyMigrationFilter('courses');
        this.tests = await this.applyMigrationFilter('tests');
        this.logs = await this.applyMigrationFilter('logs');
        this.studySessions = await this.applyMigrationFilter('studySessions');
        this.mockExams = await this.applyMigrationFilter('mockExams');
        this.topics = await this.applyMigrationFilter('topics');
        this.srs = await this.applyMigrationFilter('srs');
        
        if (this.topics.length === 0) await this.seedTopics();

        const logId = `${this.today}_${this.currentUser.id}`;
        let todayLog = this.logs.find(l => l.date === logId);
        if(!todayLog) { 
            // SAATLİK VERİM İÇİN hourStats EKLENDİ
            todayLog = { date: logId, realDate: this.today, userId: this.currentUser.id, manualMinutes: 0, repeatMinutes: 0, videoCount: 0, tasks: {}, hourStats: {} }; 
            await DB.put('logs', todayLog); this.logs.push(todayLog); 
        } else {
            if(!todayLog.hourStats) todayLog.hourStats = {};
        }
        
        if(this.settings.lastActive && this.settings.lastActive !== this.today) {
            const yesterdayD = new Date(); yesterdayD.setDate(yesterdayD.getDate()-1);
            const yLog = this.logs.find(l => l.date === `${Utils.getLocalDateStr(yesterdayD)}_${this.currentUser.id}`);
            const vidTask = this.settings.taskList.find(t=>t.id==='vid');
            if(!yLog || (yLog.videoCount || 0) < (vidTask ? vidTask.target : 1)) this.settings.combo = 0;
        }
        this.settings.lastActive = this.today; this.globalWeek = Utils.getWeek(this.today); this.globalMonth = this.today.slice(0,7);
        await this.saveSettings();
    },

    async seedTopics() {
        // (Kısa tutulmuştur, mevcut seedTopics listenizi koruyabilirsiniz)
        const seedData = { "Türkçe": ["Cümlede Anlam", "Paragraf"], "Matematik": ["Sayı Kümeleri", "Problemler"] }; 
        for (const [ders, konular] of Object.entries(seedData)) { for (const ad of konular) { await DB.put('topics', { ders, ad, tamamlandi: false, userId: this.currentUser.id }); } }
        this.topics = await this.applyMigrationFilter('topics');
    },

    async saveCourse(c) { c.userId = this.currentUser.id; await DB.put('courses', c); },
    async saveSettings() { this.settings.userId = this.currentUser.id; await DB.put('settings', this.settings); },
    async saveLog(l) { l.userId = this.currentUser.id; await DB.put('logs', l); }
};