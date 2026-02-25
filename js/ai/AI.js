import { State } from '../state/State.js';

export const AI = {
    getStats(dateFilter = null) {
        let totalVid=0, wVid=0, totalSec=0, wSec=0, cStats={};
        State.courses.forEach(c => {
            if(c.type === 'test') return; const cColor = c.color || '#58a6ff';
            const vids = dateFilter ? (c.videos||[]).filter(v => v.watched && dateFilter(v.watchedDate)) : (c.videos||[]);
            const count = (c.videos||[]).length, watched = vids.filter(v=>v.watched).length; totalVid+=count; wVid+=watched;
            let cs=0, ws=0;
            (c.videos||[]).forEach(v => { cs += (v.sec||0); if(v.watched && (!dateFilter || dateFilter(v.watchedDate))) ws += (v.sec||0); });
            totalSec+=cs; wSec+=ws;
            cStats[c.name] = { count, watched, percent: count ? Math.round((watched/count)*100) : 0, color: cColor, sec:cs, wSec:ws };
        });
        return { totalVid, wVid, totalSec, wSec, cStats };
    }
};