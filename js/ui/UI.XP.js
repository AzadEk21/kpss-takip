import { State } from '../state/State.js';
import { Game } from '../game/Game.js';

export const showToast = function(msg, bg="var(--success)") { 
    const t = document.getElementById('toast'); 
    if(!t) return; 
    t.innerText=msg; 
    t.style.background=bg; 
    t.style.opacity=1; 
    setTimeout(()=>t.style.opacity=0, 3000); 
};

export const updateXPFooter = function() {
    const i = Game.getLvlInfo(); 
    const log = State.logs.find(l=>l.date===State.today) || { videoCount: 0, tasks: {} }; 
    const treeInfo = Game.getTreeStage(i.lvl);
    
    if(document.getElementById('treeEmoji')) document.getElementById('treeEmoji').innerText = treeInfo.emoji;
    if(document.getElementById('treeName')) document.getElementById('treeName').innerText = treeInfo.name;
    
    if(document.getElementById('playerLevel')) document.getElementById('playerLevel').innerText = i.lvl; 
    if(document.getElementById('playerTitle')) document.getElementById('playerTitle').innerText = i.title;
    if(document.getElementById('xpBarFill')) document.getElementById('xpBarFill').style.width = `${i.progress}%`; 
    if(document.getElementById('xpTextOverlay')) document.getElementById('xpTextOverlay').innerText = `${i.xp} / ${i.next} XP`;
    if(document.getElementById('comboText')) document.getElementById('comboText').innerText = `🔥 ${State.settings.combo || 0}`;
    
    let tHtml = '';
    State.settings.taskList.forEach(t => {
        let current = t.id === 'vid' ? (log.videoCount||0) : (log.tasks?.[t.id]||0);
        let btn = !t.isSys ? `<button class="btn btn-sm" style="padding:0 4px; height:18px; font-size:10px; margin-left:5px; background:var(--danger); color:white; border:none;" onclick="event.stopPropagation(); App.decrementTask('${t.id}')">-</button><button class="btn btn-sm" style="padding:0 4px; height:18px; font-size:10px; margin-left:2px; background:var(--accent); color:black; border:none;" onclick="event.stopPropagation(); App.incrementTask('${t.id}')">+</button>` : '';
        tHtml += `<div style="display:flex; justify-content:space-between; margin-bottom:4px; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;"><span style="display:flex; align-items:center;">${t.icon} ${t.title} ${btn}</span><strong>${current}/${t.target}</strong></div>`;
    });
    const dCont = document.getElementById('dashTasksContainer'); 
    if(dCont) dCont.innerHTML = '<div style="margin-bottom:8px; color:var(--text-muted); font-weight:bold;">Günlük Görevler</div>' + tHtml;
};