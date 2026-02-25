import { DB } from '../db/DB.js';
import { State } from '../state/State.js';
import { UI } from '../ui/UI.js';
import { Game } from '../game/Game.js';
import { Utils } from '../utils/Utils.js';

export const SRS = {
    intervals: [1, 3, 7, 30], 

    async add(type, refId, name, courseName) {
        if (!State.currentUser) return;
        
        const existing = State.srs.find(x => x.refId === refId && x.type === type);
        if (existing) return; 

        let nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + this.intervals[0]);

        const item = {
            id: 'srs_' + Date.now() + '_' + Math.random().toString(36).substring(2,9),
            userId: State.currentUser.id,
            type: type, 
            refId: refId,
            name: name,
            courseName: courseName,
            stage: 0,
            nextReviewDate: Utils.getLocalDateStr(nextDate),
            isCompleted: false
        };

        await DB.put('srs', item);
        State.srs.push(item);
    },

    async review(id) {
        let item = State.srs.find(x => x.id === id);
        if (!item) return;

        item.stage++;
        
        if (item.stage >= this.intervals.length) {
            item.isCompleted = true;
            UI.showToast("Mükemmel! Bu konuyu kalıcı hafızaya kazıdın!", "var(--study)");
            Game.addXP(30, 'SRS Kalıcı Hafıza Bonusu');
        } else {
            let nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + this.intervals[item.stage]);
            item.nextReviewDate = Utils.getLocalDateStr(nextDate);
            Game.addXP(10, 'Aralıklı Tekrar');
            UI.showToast(`Tekrar edildi! Sonraki tekrar ${this.intervals[item.stage]} gün sonra.`, "var(--success)");
        }

        await DB.put('srs', item);
        UI.renderMain(); 
    }
};