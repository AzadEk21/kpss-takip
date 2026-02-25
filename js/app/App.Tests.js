import { DB } from '../db/DB.js';
import { State, ExtSettings } from '../state/State.js';
import { Game } from '../game/Game.js';
import { UI } from '../ui/UI.js';

export const addMockExam = async (data) => {
    await DB.put('mockExams', data); State.mockExams = await DB.getAll('mockExams');
    const totalNetXP = Math.round(data.gyNet + data.gkNet);
    if (totalNetXP > 0) Game.addXP(totalNetXP, 'Deneme Çözümü');
    UI.showToast("Deneme eklendi!", "var(--success)");
    UI.renderMain();
};

export const deleteMockExam = async (id) => {
    if(ExtSettings.confirm("Bu denemeyi silmek istediğine emin misin?")) {
        const e = State.mockExams.find(x => x.id === id);
        if(e) {
            const removedXP = Math.round((e.gyNet || 0) + (e.gkNet || 0));
            if(removedXP > 0) Game.removeXP(removedXP, 'Deneme Silindi');
        }
        await DB.delete('mockExams', id); 
        State.mockExams = await DB.getAll('mockExams'); 
        UI.renderMain();
    }
};

export const addVideoCourseTest = async (subj) => {
    const safeSubj = subj.replace(/\s+/g,'_');
    let corr = parseInt(document.getElementById(`tCorrV_${safeSubj}`).value);
    let wrng = parseInt(document.getElementById(`tWrngV_${safeSubj}`).value);
    let tot = parseInt(document.getElementById(`tTotalV_${safeSubj}`).value);
    
    if(isNaN(tot) && isNaN(corr) && isNaN(wrng)) return UI.showToast("Soru sayısı girin", "var(--danger)");
    if(!isNaN(tot) && isNaN(corr) && isNaN(wrng)) { corr = tot; wrng = 0; } 
    else { corr = corr || 0; wrng = wrng || 0; if(!isNaN(tot) && (corr+wrng) === 0) corr = tot; }
    
    await window.App.addTest(subj, corr, wrng);
    document.getElementById(`tCorrV_${safeSubj}`).value = ''; document.getElementById(`tWrngV_${safeSubj}`).value = ''; document.getElementById(`tTotalV_${safeSubj}`).value = '';
};

export const addTest = async (subj, corr, wrng) => {
    if(!subj || (corr===0 && wrng===0)) return; if(!State.courses.find(c=>c.name===subj)) await window.App.addCourseBase(subj, [], 'test'); 
    const net = Math.max(0, corr - (wrng*0.25)); const testXP = Math.max(0, Math.round(net)); 
    
    // SAATLİK VERİM: Test çözdüğü saati de log'a ekle
    const log = State.logs.find(l=>l.realDate===State.today);
    if(log) {
        const hr = new Date().getHours();
        if(!log.hourStats) log.hourStats = {};
        log.hourStats[hr] = (log.hourStats[hr] || 0) + 1;
        await State.saveLog(log);
    }

    const t = { date: State.today, subject: subj, correct: corr, wrong: wrng, net, xp: testXP, userId: State.currentUser.id };
    await DB.put('tests', t); State.tests = await State.applyMigrationFilter('tests'); if(testXP > 0) Game.addXP(testXP, 'Test Çözümü'); UI.renderMain();
};

export const deleteTest = async (id, btnElement) => {
    if(ExtSettings.confirm("Bu testi silmek istediğine emin misin?")) {
        const t = State.tests.find(x => x.id === id); 
        if(t) { 
            const removedXP = t.xp !== undefined ? t.xp : Math.max(0, Math.round(t.net)); 
            if(removedXP > 0) Game.removeXP(removedXP, 'Test Silindi'); 
        }
        
        // SİLİNME ANİMASYONU (Kayarak kaybolma)
        if(btnElement && ExtSettings.data.animations) {
            const itemDiv = btnElement.closest('.list-item');
            if(itemDiv) {
                itemDiv.classList.add('slide-out');
                setTimeout(async () => {
                    await DB.delete('tests', id); State.tests = await State.applyMigrationFilter('tests'); UI.renderMain();
                }, 350);
                return;
            }
        }

        await DB.delete('tests', id); State.tests = await State.applyMigrationFilter('tests'); UI.renderMain();
    }
};