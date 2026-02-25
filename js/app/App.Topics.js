import { DB } from '../db/DB.js';
import { State } from '../state/State.js';
import { Game } from '../game/Game.js';
import { UI } from '../ui/UI.js';

export const toggleTopic = async (id, isChecked) => {
    const topic = State.topics.find(t => t.id === id);
    if (!topic) return;
    topic.tamamlandi = isChecked;
    await DB.put('topics', topic);
    if (isChecked) {
        Game.addXP(2, 'Konu Tamamlandı');
        // SRS'E EKLEME İŞLEMİ BURADA
        window.App.SRS.add('topic', topic.id, topic.ad, topic.ders);
    } else {
        Game.removeXP(2, 'Konu İptal');
    }
    UI.renderTopics(document.getElementById('mainContent'));
};

export const markAllTopics = async (ders, mark) => {
    const tList = State.topics.filter(t => t.ders === ders);
    let xpGained = 0;
    for (const t of tList) {
        if (t.tamamlandi !== mark) {
            t.tamamlandi = mark;
            await DB.put('topics', t);
            if (mark) {
                xpGained += 2;
                window.App.SRS.add('topic', t.id, t.ad, t.ders); // SRS Toplu Ekleme
            } else {
                Game.removeXP(2, 'Konu İptal');
            }
        }
    }
    if (xpGained > 0) Game.addXP(xpGained, 'Konular Tamamlandı');
    State.topics = await State.applyMigrationFilter('topics');
    UI.renderTopics(document.getElementById('mainContent'));
};