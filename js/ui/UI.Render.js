import { State, ExtSettings } from '../state/State.js';
import { Utils } from '../utils/Utils.js';
import { Game } from '../game/Game.js';
import { AI } from '../ai/AI.js';

export const drawBarChart = function(canvasId, labels, data) {
    const canvas = document.getElementById(canvasId);
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const maxVal = 30; 
    const padX = 20, padY = 30;
    const barW = (W - padX*2) / labels.length - 10;
    const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#F1C40F', '#9B59B6', '#1ABC9C'];
    data.forEach((val, i) => {
        const h = (val / maxVal) * (H - padY * 2);
        const x = padX + i * (barW + 10);
        const y = H - padY - h;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        if (ctx.roundRect) { ctx.roundRect(x, y, barW, h, [4, 4, 0, 0]); } else { ctx.rect(x, y, barW, h); }
        ctx.fill();
        ctx.fillStyle = 'white'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(val.toFixed(1), x + barW/2, y - 5);
        ctx.fillStyle = 'var(--text-muted)'; ctx.font = '11px sans-serif'; ctx.fillText(labels[i], x + barW/2, H - 10);
    });
};

export const getSVGPie = function(data, size=140) {
    let total = data.reduce((s,d)=>s+d.val, 0);
    if(total===0) return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:var(--border);"></div>`;
    let html = `<svg width="${size}" height="${size}" viewBox="-1 -1 2 2" style="transform: rotate(-90deg); border-radius:50%; box-shadow: 0 0 20px rgba(0,0,0,0.4); overflow: visible;">`;
    let cum = 0;
    data.forEach(d => {
        let pct = d.val / total;
        if(pct === 1) { html += `<circle cx="0" cy="0" r="1" fill="${d.color}"><title>${d.label}</title></circle>`; return; }
        let startX = Math.cos(2 * Math.PI * cum); let startY = Math.sin(2 * Math.PI * cum); cum += pct;
        let endX = Math.cos(2 * Math.PI * cum); let endY = Math.sin(2 * Math.PI * cum); let largeArc = pct > 0.5 ? 1 : 0;
        html += `<path d="M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArc} 1 ${endX} ${endY} Z" fill="${d.color}" style="cursor:pointer; transition: opacity 0.2s, transform 0.2s;" onmouseover="this.style.opacity=0.8; this.style.transform='scale(1.05)'" onmouseout="this.style.opacity=1; this.style.transform='scale(1)'"><title>${d.label}</title></path>`;
    });
    html += `</svg>`; return html;
};

export const getSVGLineChart = function(dataArr, width=300, height=150) {
    if(dataArr.length < 2) return '<div style="color:var(--text-muted); padding:20px; text-align:center;">Çizim için en az 2 deneme gerekli.</div>';
    let max = Math.max(...dataArr), min = Math.min(...dataArr);
    if(max === min) { max += 5; min -= 5; }
    const padding = 20;
    const pts = dataArr.map((d, i) => { const x = padding + (i / (dataArr.length - 1)) * (width - padding*2); const y = height - padding - ((d - min) / (max - min)) * (height - padding*2); return `${x},${y}`; }).join(' ');
    let texts = dataArr.map((d, i) => { const x = padding + (i / (dataArr.length - 1)) * (width - padding*2); const y = height - padding - ((d - min) / (max - min)) * (height - padding*2) - 10; return `<text x="${x}" y="${y}" fill="var(--text-main)" font-size="10" text-anchor="middle" font-weight="bold">${Math.round(d)}</text><circle cx="${x}" cy="${y+10}" r="3" fill="var(--accent)"/>`; }).join('');
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:visible; background:rgba(0,0,0,0.2); border-radius:8px;"><polyline fill="none" stroke="var(--accent)" stroke-width="2" points="${pts}"/>${texts}</svg>`;
};

export const renderTabs = function() {
    const c = document.getElementById('tabs'); if(!c) return;
    let html = `
        <div class="tab ${this.currentTab==='dashboard'?'active':''}" onclick="UI.switchTab('dashboard')">📊 Dashboard</div>
        <div class="tab ${this.currentTab==='analytics'?'active':''}" onclick="UI.switchTab('analytics')">📈 Analizler</div>
        <div class="tab ${this.currentTab==='scheduler'?'active':''}" style="color:var(--ai-color);" onclick="UI.switchTab('scheduler')">🤖 Planlayıcı</div>
        <div class="tab ${this.currentTab==='study'?'active':''}" onclick="UI.switchTab('study')">⏱️ Kronometre</div>
        <div class="tab ${this.currentTab==='mockExam'?'active':''}" onclick="UI.switchTab('mockExam')">📊 Denemeler</div>
        <div class="tab ${this.currentTab==='topics'?'active':''}" onclick="UI.switchTab('topics')">📚 Konular</div>
        <div style="border-right: 1px solid var(--border); margin: 0 5px; opacity:0.5;"></div>
        <div class="tab ${this.currentTab==='videos'?'active':''}" style="color:var(--accent);" onclick="UI.switchTab('videos')">▶️ Videolar</div>
        <div class="tab ${this.currentTab==='tests'?'active':''}" style="color:var(--warning);" onclick="UI.switchTab('tests')">✏️ Soru Bankası</div>
        <div class="tab ${this.currentTab==='forest'?'active':''}" style="color:var(--success);" onclick="UI.switchTab('forest')">🌲 Orman</div>
    `;
    // 'Ayarlar' sekmesi buradan kaldırıldı, profil menüsüne bağlandı.
    c.innerHTML = html;
};

export const renderMain = function() {
    const main = document.getElementById('mainContent'); if(!main) return;
    if(this.currentTab === 'dashboard') this.renderDashboard(main);
    else if(this.currentTab === 'videos') this.renderVideosTab(main); 
    else if(this.currentTab === 'tests') this.renderTestsTab(main); 
    else if(this.currentTab === 'scheduler') this.renderAIPlannerSimple(main);
    else if(this.currentTab === 'analytics') this.renderAnalyticsExt(main);
    else if(this.currentTab === 'settings') this.renderSettingsExt(main);
    else if(this.currentTab === 'forest') this.renderForest(main);
    else if(this.currentTab === 'study') this.renderStudy(main);
    else if(this.currentTab === 'mockExam') this.renderMockExam(main);
    else if(this.currentTab === 'topics') this.renderTopics(main);
};

// VİDEO DERSLERİ ALT SEKME (SUB-NAV) SİSTEMİ
export const renderVideosTab = function(c) {
    const vCrs = State.courses.filter(crs => crs.type !== 'test');
    if(vCrs.length === 0) return c.innerHTML = '<div class="card" style="text-align:center; padding:30px; color:var(--text-muted);">Henüz video ders eklenmedi. Sağ üstten ➕ Ders Ekle butonunu kullanın.</div>';
    
    if(!this.activeVideoCourse || !vCrs.find(x => x.name === this.activeVideoCourse)) {
        this.activeVideoCourse = vCrs[0].name;
    }

    let pills = vCrs.map(crs => `
        <div class="sub-nav-pill ${this.activeVideoCourse === crs.name ? 'active' : ''}" style="${this.activeVideoCourse === crs.name ? 'background:'+(crs.color||'#58a6ff')+';' : ''}" onclick="UI.activeVideoCourse='${crs.name.replace(/'/g, "\\\\'")}'; UI.renderMain();">
            ▶ ${crs.name}
            <span class="pill-close" onclick="event.stopPropagation(); App.deleteCourse('${crs.name.replace(/'/g, "\\\\'")}')">✕</span>
        </div>
    `).join('');
    
    c.innerHTML = `<div class="sub-nav">${pills}</div><div id="subTabContent"></div>`;
    
    const subContent = document.getElementById('subTabContent');
    const oldTab = this.currentTab;
    this.currentTab = this.activeVideoCourse; 
    this.renderCourse(subContent); 
    this.currentTab = oldTab; 
};

// TEST/SORU DERSLERİ ALT SEKME SİSTEMİ
export const renderTestsTab = function(c) {
    const tCrs = State.courses.filter(crs => crs.type === 'test');
    if(tCrs.length === 0) return c.innerHTML = '<div class="card" style="text-align:center; padding:30px; color:var(--text-muted);">Henüz sadece soru takibi yapılan ders yok. Ders ekle menüsünden "Sadece Test" ekleyin.</div>';
    
    if(!this.activeTestCourse || !tCrs.find(x => x.name === this.activeTestCourse)) {
        this.activeTestCourse = tCrs[0].name;
    }

    let pills = tCrs.map(crs => `
        <div class="sub-nav-pill ${this.activeTestCourse === crs.name ? 'active' : ''}" style="${this.activeTestCourse === crs.name ? 'background:'+(crs.color||'#d29922')+';' : ''}" onclick="UI.activeTestCourse='${crs.name.replace(/'/g, "\\\\'")}'; UI.renderMain();">
            📝 ${crs.name}
            <span class="pill-close" onclick="event.stopPropagation(); App.deleteCourse('${crs.name.replace(/'/g, "\\\\'")}')">✕</span>
        </div>
    `).join('');
    
    c.innerHTML = `<div class="sub-nav">${pills}</div><div id="subTabContent"></div>`;
    
    const subContent = document.getElementById('subTabContent');
    const oldTab = this.currentTab;
    this.currentTab = this.activeTestCourse; 
    const crsObj = State.courses.find(x => x.name === this.activeTestCourse);
    this.renderTestCourse(subContent, crsObj); 
    this.currentTab = oldTab; 
};

export const renderAnalyticsExt = function(c) {
    // 1. ETA (Tahmini Bitiş Tarihi) HESAPLAMA
    let totalUnwatchedSec = 0; let watchedLast7Sec = 0;
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    State.courses.filter(crs => crs.type !== 'test').forEach(crs => {
        (crs.videos || []).forEach(v => {
            if(!v.watched) totalUnwatchedSec += (v.sec || 0);
            if(v.watched && v.watchedDate) {
                const wd = new Date(v.watchedDate);
                if(wd >= sevenDaysAgo) watchedLast7Sec += (v.sec || 0);
            }
        });
    });
    const avgDailySec = watchedLast7Sec / 7; let etaHtml = '';
    if(avgDailySec < 60) {
        etaHtml = `<div style="font-size:1.5em; font-weight:bold; color:var(--warning);">Veri Yetersiz</div><div style="font-size:0.85em; color:var(--text-muted);">Tahmin için daha çok video izleyin.</div>`;
    } else {
        const remDays = Math.ceil(totalUnwatchedSec / avgDailySec);
        const etaDate = new Date(); etaDate.setDate(etaDate.getDate() + remDays);
        etaHtml = `<div style="font-size:1.5em; font-weight:bold; color:var(--success);">${etaDate.toLocaleDateString('tr-TR')}</div><div style="font-size:0.85em; color:var(--text-muted);">Ortalama ${Utils.formatTime(avgDailySec)}/gün hızla</div>`;
    }

    // 2. EN VERİMLİ SAAT HESAPLAMA
    const hourAggr = {};
    State.logs.forEach(l => { if(l.hourStats) { Object.keys(l.hourStats).forEach(hr => { hourAggr[hr] = (hourAggr[hr] || 0) + l.hourStats[hr]; }); } });
    let peakHourStr = '-'; let maxH = 0;
    Object.keys(hourAggr).forEach(hr => { if(hourAggr[hr] > maxH) { maxH = hourAggr[hr]; peakHourStr = `${hr}:00 - ${parseInt(hr)+1}:00`; } });

    // 3. KONU HAKİMİYET MATRİSİ (Mastery Matrix)
    let matrixHtml = `<table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.9em; margin-top:15px;"><tr style="border-bottom:1px solid var(--border); color:var(--text-muted);"><th style="padding:8px;">Ders</th><th style="padding:8px;">Video İlerlemesi</th><th style="padding:8px;">Konu Durumu</th><th style="padding:8px;">Soru Doğruluğu</th></tr>`;
    State.courses.forEach(crs => {
        let vPct = null; if(crs.type !== 'test' && crs.videos && crs.videos.length > 0) vPct = Math.round((crs.videos.filter(v=>v.watched).length / crs.videos.length)*100);
        const tps = State.topics.filter(t => t.ders === crs.name); let tPct = tps.length > 0 ? Math.round((tps.filter(t=>t.tamamlandi).length / tps.length)*100) : null;
        const tts = State.tests.filter(t => t.subject === crs.name); let aPct = null;
        if(tts.length > 0) { let tc = 0, tw = 0; tts.forEach(t => { tc += (parseInt(t.correct)||0); tw += (parseInt(t.wrong)||0); }); if(tc+tw > 0) aPct = Math.round((tc/(tc+tw))*100); }
        const colorize = (val) => val === null ? '-' : `<span style="color:${val>=80?'var(--success)':val>=50?'var(--warning)':'var(--danger)'}; font-weight:bold;">%${val}</span>`;
        matrixHtml += `<tr style="border-bottom:1px solid rgba(255,255,255,0.05);"><td style="padding:8px; font-weight:bold; color:${crs.color||'white'};">${crs.name}</td><td style="padding:8px;">${colorize(vPct)}</td><td style="padding:8px;">${colorize(tPct)}</td><td style="padding:8px;">${colorize(aPct)}</td></tr>`;
    });
    matrixHtml += `</table>`;

    // 4. İLERİ DÜZEY ANALİTİK HESAPLAMALARI (Grafikler ve Heatmap)
    const pDays = this.analyticsPeriod || 30; const statsMap = {}; const now = new Date(); now.setHours(0,0,0,0);
    const dStats = [];
    for(let i=pDays-1; i>=0; i--) { const d = new Date(now); d.setDate(d.getDate() - i); const ds = Utils.getLocalDateStr(d); const entry = { date: ds, vMins:0, vCount:0, sMins:0, tNet:0, tCount:0, pMins:0, pActual:0, xp:0, studyBlocks:[] }; statsMap[ds] = entry; dStats.push(entry); }
    State.studySessions.forEach(s => { if(statsMap[s.date]) { const m = parseInt(s.minutes)||0; statsMap[s.date].sMins += m; statsMap[s.date].studyBlocks.push(m); statsMap[s.date].xp += (s.xp||0); }});
    State.courses.forEach(crs => { if(crs.type!=='test') { (crs.videos||[]).forEach(v => { if(v.watched && v.watchedDate && statsMap[v.watchedDate]) { statsMap[v.watchedDate].vMins += Math.floor((v.sec||0)/60); statsMap[v.watchedDate].vCount++; } }); } });
    State.tests.forEach(t => { if(statsMap[t.date]) { statsMap[t.date].tNet += (parseFloat(t.net)||0); statsMap[t.date].tCount += ((parseInt(t.correct)||0)+(parseInt(t.wrong)||0)); statsMap[t.date].xp += (t.xp||0); } });
    
    let heatHtml = '';
    dStats.forEach(wd => { const totalMins = wd.vMins + wd.sMins; let cls = 'heat-box'; if(totalMins>0)cls+=' heat-l1'; if(totalMins>30)cls+=' heat-l2'; if(totalMins>90)cls+=' heat-l3'; if(totalMins>150)cls+=' heat-l4'; heatHtml += `<div class="${cls}" title="${wd.date}: ${totalMins} dk (V:${wd.vMins}m, S:${wd.sMins}m, XP:${wd.xp})"></div>`; });
    
    let y=2026, w=1; try { [y, w] = State.globalWeek.split('-W'); } catch(e){} const wStart = Utils.getWeekStart(w, y); const curM = State.globalMonth;
    const weekStudyData = [];
    for(let i=0; i<7; i++) { const d = new Date(wStart); d.setDate(d.getDate() + i); const ds = Utils.getLocalDateStr(d); let totalMins = 0; State.studySessions.filter(s => s.date === ds).forEach(s => totalMins += (parseInt(s.minutes)||0)); weekStudyData.push({ date: ds, mins: totalMins }); }
    let maxS = Math.max(...weekStudyData.map(w => w.mins), 1); let sBarsHTML = '';
    weekStudyData.forEach(wd => { const h = (wd.mins / maxS) * 100; const dayName = new Date(wd.date).toLocaleDateString('tr-TR', {weekday:'short'}); sBarsHTML += `<div style="display:flex; flex-direction:column; align-items:center; flex:1; gap:5px; height:150px; justify-content:flex-end;"><span style="font-size:12px; font-weight:bold;">${wd.mins}m</span><div title="${dayName}: ${wd.mins} dk" onmouseover="this.style.filter='brightness(1.5)'" onmouseout="this.style.filter='none'" style="width:100%; max-width:40px; background:var(--study); border-radius:4px 4px 0 0; height:${h}%; min-height:3px; transition:height 0.5s, filter 0.2s; cursor:pointer;"></div><span style="font-size:11px; color:var(--text-muted); border-top:2px solid var(--study); width:100%; text-align:center; padding-top:4px;">${dayName}</span></div>`; });
    
    const weekData = [];
    for(let i=0; i<7; i++) { const d = new Date(wStart); d.setDate(d.getDate() + i); const ds = Utils.getLocalDateStr(d); const log = State.logs.find(l => l.date === ds); weekData.push({ date: ds, vids: log ? (parseInt(log.videoCount)||0) : 0 }); }
    let maxV = Math.max(...weekData.map(w => w.vids), 1); let barsHTML = '';
    weekData.forEach(wd => { const h = (wd.vids / maxV) * 100; const dayName = new Date(wd.date).toLocaleDateString('tr-TR', {weekday:'short'}); barsHTML += `<div style="display:flex; flex-direction:column; align-items:center; flex:1; gap:5px; height:150px; justify-content:flex-end;"><span style="font-size:12px; font-weight:bold;">${wd.vids}</span><div title="${dayName}: ${wd.vids} Video" onmouseover="this.style.filter='brightness(1.5)'" onmouseout="this.style.filter='none'" style="width:100%; max-width:40px; background:var(--accent); border-radius:4px 4px 0 0; height:${h}%; min-height:3px; transition:height 0.5s, filter 0.2s; cursor:pointer;"></div><span style="font-size:11px; color:var(--text-muted); border-top:2px solid var(--accent); width:100%; text-align:center; padding-top:4px;">${dayName}</span></div>`; });
    
    const weekTestData = [];
    for(let i=0; i<7; i++) { const d = new Date(wStart); d.setDate(d.getDate() + i); const ds = Utils.getLocalDateStr(d); let qSum = 0; State.tests.filter(t => t.date === ds).forEach(t => qSum += (parseInt(t.correct)||0) + (parseInt(t.wrong)||0)); weekTestData.push({ date: ds, count: qSum }); }
    let maxT = Math.max(...weekTestData.map(w => w.count), 1); let tBarsHTML = '';
    weekTestData.forEach(wd => { const h = (wd.count / maxT) * 100; const dayName = new Date(wd.date).toLocaleDateString('tr-TR', {weekday:'short'}); tBarsHTML += `<div style="display:flex; flex-direction:column; align-items:center; flex:1; gap:5px; height:150px; justify-content:flex-end;"><span style="font-size:12px; font-weight:bold;">${wd.count}</span><div title="${dayName}: ${wd.count} Soru" onmouseover="this.style.filter='brightness(1.5)'" onmouseout="this.style.filter='none'" style="width:100%; max-width:40px; background:var(--warning); border-radius:4px 4px 0 0; height:${h}%; min-height:3px; transition:height 0.5s, filter 0.2s; cursor:pointer;"></div><span style="font-size:11px; color:var(--text-muted); border-top:2px solid var(--warning); width:100%; text-align:center; padding-top:4px;">${dayName}</span></div>`; });
    
    const studyStats = {}; let totalStudyMins = 0;
    State.studySessions.forEach(s => { if(s.date.startsWith(curM)) { totalStudyMins += (parseInt(s.minutes)||0); if(!studyStats[s.subject]) { const crs = State.courses.find(x => x.name === s.subject); studyStats[s.subject] = { mins: 0, color: crs ? crs.color : '#8b949e' }; } studyStats[s.subject].mins += (parseInt(s.minutes)||0); } });
    let sPieData = [], sL=''; let maxStudySubject = { name: '-', mins: 0 };
    if(totalStudyMins > 0) { Object.keys(studyStats).forEach(k => { const st = studyStats[k]; const p = (st.mins / totalStudyMins) * 100; if(st.mins > maxStudySubject.mins) maxStudySubject = { name: k, mins: st.mins }; sPieData.push({val: st.mins, color: st.color, label: `${k}: ${st.mins} dk (%${Math.round(p)})`}); sL += `<div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:10px; align-items:center;"><span><span class="color-chip" style="width:14px;height:14px;background:${st.color};display:inline-block;margin-right:8px;border:none;border-radius:3px;"></span>${k}</span><strong>%${Math.round(p)} (${st.mins} dk)</strong></div>`; }); } else { sL='<div style="color:var(--text-muted)">Bu ay için veri yok</div>'; }
    
    const mStats = AI.getStats(d => d.startsWith(curM)); let wPieData=[], wL='';
    if(mStats.wSec>0) { Object.keys(mStats.cStats).forEach(k => { const crs = mStats.cStats[k]; if(crs.wSec>0) { const p = (crs.wSec/mStats.wSec)*100; wPieData.push({val: crs.wSec, color: crs.color, label: `${k}: ${Utils.formatTime(crs.wSec)} (%${Math.round(p)})`}); wL+=`<div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:10px; align-items:center;"><span><span class="color-chip" style="width:14px;height:14px;background:${crs.color};display:inline-block;margin-right:8px;border:none;border-radius:3px;"></span>${k}</span> <strong>%${Math.round(p)} (${Utils.formatTime(crs.wSec)})</strong></div>`; } }); } else { wL='<div style="color:var(--text-muted)">Bu ay için veri yok</div>'; }
    let mVid = 0; State.logs.forEach(l => { if(l.date.startsWith(curM)) mVid += (parseInt(l.videoCount)||0); });
    
    const tStats = {}; let totalQ = 0;
    State.tests.forEach(t => { if(t.date.startsWith(curM)) { const qCount = (parseInt(t.correct)||0) + (parseInt(t.wrong)||0); if(qCount > 0) { totalQ += qCount; if(!tStats[t.subject]) { const crs = State.courses.find(x => x.name === t.subject); tStats[t.subject] = { count: 0, color: crs ? crs.color : '#8b949e' }; } tStats[t.subject].count += qCount; } } });
    let tPieData=[], tL='';
    if(totalQ > 0) { Object.keys(tStats).forEach(k => { const st = tStats[k]; const p = (st.count / totalQ) * 100; tPieData.push({val: st.count, color: st.color, label: `${k}: ${st.count} Soru (%${Math.round(p)})`}); tL += `<div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:10px; align-items:center;"><span><span class="color-chip" style="width:14px;height:14px;background:${st.color};display:inline-block;margin-right:8px;border:none;border-radius:3px;"></span>${k}</span><strong>%${Math.round(p)} (${st.count} Soru)</strong></div>`; }); } else { tL='<div style="color:var(--text-muted)">Bu ay için veri yok</div>'; }
    let mTestCount = 0; let mTestNet = 0; let mTestQCount = 0;
    State.tests.forEach(t => { if(t.date.startsWith(curM)) { mTestCount++; mTestNet += parseFloat(t.net)||0; mTestQCount += (parseInt(t.correct)||0) + (parseInt(t.wrong)||0); } });
    
    const last7 = dStats.slice(-7).reduce((s, d)=>s+(d.vMins+d.sMins),0)/7; const last30 = dStats.slice(-30).reduce((s, d)=>s+(d.vMins+d.sMins),0)/Math.min(30, dStats.length);
    let trend = last30 > 0 ? (((last7 - last30)/last30)*100).toFixed(1) : 0; let trendIcon = trend > 0 ? '↗️' : (trend < 0 ? '↘️' : '➡️');
    
    const totalTopics = State.topics.length; const compTopics = State.topics.filter(t => t.tamamlandi).length;
    const topicPieData = totalTopics > 0 ? [ {val: compTopics, color: 'var(--success)', label: `Tamamlanan: ${compTopics}`}, {val: totalTopics - compTopics, color: 'var(--border)', label: `Kalan: ${totalTopics - compTopics}`} ] : [];
    let totalGY = 0, totalGK = 0; State.mockExams.forEach(e => { totalGY += parseFloat(e.gyNet) || 0; totalGK += parseFloat(e.gkNet) || 0; });
    const examLen = State.mockExams.length || 1; const avgGY = totalGY / examLen; const avgGK = totalGK / examLen;
    const gyGkPieData = State.mockExams.length > 0 ? [ { val: avgGY, color: '#3498DB', label: `GY Net: ${avgGY.toFixed(1)}` }, { val: avgGK, color: '#E67E22', label: `GK Net: ${avgGK.toFixed(1)}` } ] : [];
    
    let canvasHTML = '';
    if (State.mockExams.length > 0) {
        canvasHTML = `<canvas id="dersNetChart" width="400" height="150" style="width:100%; max-width:400px;"></canvas>`;
        setTimeout(() => { const ort = Utils.getDersOrtalamaNetleri(); const labels = ["Türkçe","Matematik","Tarih","Coğrafya","Vatandaşlık","Güncel"]; const data = [ort.turkce, ort.matematik, ort.tarih, ort.cografya, ort.vatandaslik, ort.guncel]; window.UI.drawBarChart("dersNetChart", labels, data); }, 50); 
    } else { canvasHTML = '<div style="color:var(--text-muted); text-align:center; width:100%; padding:20px;">Kayıtlı deneme bulunmuyor.</div>'; }
    const recentExams = State.mockExams.slice(-10); const netData = recentExams.map(e => (parseFloat(e.gyNet)||0) + (parseFloat(e.gkNet)||0));
    const mockLineChart = netData.length > 0 ? this.getSVGLineChart(netData, 300, 150) : '<div style="color:var(--text-muted); padding:10px; text-align:center;">Grafik için deneme çözün.</div>';

    // BİRLEŞTİRİLMİŞ HTML ÇIKTISI
    c.innerHTML = `
        <div class="card hover-scale" style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; background:var(--border);">
            <div style="font-weight:bold; color:white;">🔍 YENİ NESİL ANALİZ & ISI HARİTASI</div>
            <select id="anaPeriodSel" class="fancy-input" onchange="UI.analyticsPeriod = parseInt(this.value); UI.renderMain();" style="border:none; font-weight:bold;">
                <option value="7" ${pDays===7?'selected':''}>Son 7 Gün</option><option value="30" ${pDays===30?'selected':''}>Son 30 Gün</option><option value="90" ${pDays===90?'selected':''}>Son 90 Gün</option>
            </select>
        </div>

        <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
            <div class="card hover-scale" style="border-top: 4px solid var(--success); text-align:center;">
                <h3 style="color:var(--success);">Tüm Müfredat Tahmini Bitiş (ETA)</h3>
                <div style="margin-top:15px;">${etaHtml}</div>
            </div>
            <div class="card hover-scale" style="border-top: 4px solid var(--study); text-align:center;">
                <h3 style="color:var(--study);">En Verimli Çalışma Saatiniz</h3>
                <div style="font-size:1.8em; font-weight:bold; color:var(--study); margin-top:15px;">${peakHourStr}</div>
                <div style="font-size:0.85em; color:var(--text-muted);">Sistem loglarına göre</div>
            </div>
        </div>

        <div class="card hover-scale" style="margin-bottom:20px; border-left:4px solid var(--accent); overflow-x:auto;">
            <h3 style="color:var(--accent);">🎯 KONU HAKİMİYET MATRİSİ</h3>
            ${matrixHtml}
        </div>

        <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));">
            <div class="card hover-scale" style="text-align:center;"><div style="color:var(--text-muted); font-size:0.8em; margin-bottom:5px;">Son 7 Gün Ortalama</div><div style="font-size:1.8em; font-weight:bold; color:var(--study);">${Math.round(last7)}<span style="font-size:0.5em; color:var(--text-muted)">dk/gün</span></div></div>
            <div class="card hover-scale" style="text-align:center;"><div style="color:var(--text-muted); font-size:0.8em; margin-bottom:5px;">Periyot Ortalaması</div><div style="font-size:1.8em; font-weight:bold; color:var(--accent);">${Math.round(last30)}<span style="font-size:0.5em; color:var(--text-muted)">dk/gün</span></div></div>
            <div class="card hover-scale" style="text-align:center;"><div style="color:var(--text-muted); font-size:0.8em; margin-bottom:5px;">Efor Trendi</div><div style="font-size:1.8em; font-weight:bold; color:${trend>=0?'var(--success)':'var(--danger)'};">${trend}% ${trendIcon}</div></div>
        </div>

        <div class="card hover-scale" style="margin-bottom:20px; border-left:4px solid var(--accent); background: linear-gradient(145deg, rgba(88,166,255,0.05) 0%, var(--bg-card) 100%);">
            <h3 style="color:var(--accent); margin-bottom:15px; border-bottom: 1px solid rgba(88,166,255,0.2); padding-bottom:10px;">📊 DENEME ANALİZLERİ (Tüm Zamanlar)</h3>
            <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
                <div style="display:flex; flex-direction:column; align-items:center;"><h4 style="color:var(--text-muted); margin-bottom:15px;">Ortalama GY / GK Dağılımı</h4>${gyGkPieData.length ? this.getSVGPie(gyGkPieData, 120) : '<span style="color:var(--text-muted);">Veri yok</span>'}${gyGkPieData.length ? `<div style="margin-top:15px; text-align:center;"><span style="color:#3498DB; font-weight:bold;">GY Net: ${avgGY.toFixed(1)}</span> | <span style="color:#E67E22; font-weight:bold;">GK Net: ${avgGK.toFixed(1)}</span></div>` : ''}</div>
                <div style="display:flex; flex-direction:column; align-items:center;"><h4 style="color:var(--text-muted); margin-bottom:15px;">Ders Bazlı Ortalama Netler</h4><div style="display:flex; align-items:flex-end; gap:10px; width:100%; max-width:400px; justify-content:center;">${canvasHTML}</div></div>
                <div style="display:flex; flex-direction:column; align-items:center;"><h4 style="color:var(--text-muted); margin-bottom:15px;">Toplam Net Gelişimi (Son 10)</h4><div style="width:100%; display:flex; justify-content:center;">${mockLineChart}</div></div>
            </div>
        </div>

        <div class="card hover-scale" style="margin-bottom:20px;">
            <h3 style="color:var(--success); text-align:center;">📖 GENEL KONU BİTİRME DURUMU</h3>
            <div style="display:flex; justify-content:center; margin-top:15px;">${topicPieData.length ? this.getSVGPie(topicPieData, 120) : '<span style="color:var(--text-muted);">Konu yok</span>'}</div>
            <div style="text-align:center; margin-top:10px; font-weight:bold;">%${totalTopics ? Math.round((compTopics/totalTopics)*100) : 0} Tamamlandı</div>
        </div>

        <div class="card hover-scale" style="margin-bottom:20px;">
            <h3 style="display:flex; align-items:center; gap:5px;">🗺️ ÇALIŞMA ISI HARİTASI (${pDays} GÜN)</h3>
            <div class="heatmap-grid" style="grid-template-columns: repeat(auto-fill, minmax(12px, 1fr)); gap:6px; margin-top:15px;">${heatHtml}</div>
            <div style="display:flex; justify-content:flex-end; gap:5px; margin-top:10px; font-size:0.7em; color:var(--text-muted); align-items:center;">Az <div class="heat-box heat-l1" style="width:10px;height:10px;"></div><div class="heat-box heat-l2" style="width:10px;height:10px;"></div><div class="heat-box heat-l3" style="width:10px;height:10px;"></div><div class="heat-box heat-l4" style="width:10px;height:10px;"></div> Çok</div>
        </div>

        <div class="card hover-scale" style="margin-bottom:20px; border-left:4px solid var(--accent); background: linear-gradient(to right, rgba(88,166,255,0.05), transparent);">
            <h3 style="margin:0 0 10px 0; color:var(--accent);">🕰️ ESKİ ANALİZLERE DÖN (ZAMAN MAKİNESİ):</h3>
            <div style="display:flex; gap:20px; align-items:center; flex-wrap:wrap;">
                <div style="display:flex; align-items:center; gap:8px;"><span style="color:var(--text-muted)">Hafta Seç:</span><input type="week" class="fancy-input" id="aWeek" value="${State.globalWeek}" onchange="State.globalWeek=this.value; UI.renderMain();"></div>
                <div style="display:flex; align-items:center; gap:8px;"><span style="color:var(--text-muted)">Ay Seç:</span><input type="month" class="fancy-input" id="aMonth" value="${State.globalMonth}" onchange="State.globalMonth=this.value; UI.renderMain();"></div>
            </div>
        </div>

        <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
            <div class="card hover-scale"><h3 style="color:var(--study);">HAFTALIK MANUEL ÇALIŞMA (DAKİKA)</h3><div style="display:flex; align-items:flex-end; gap:10px; margin-top:20px;">${sBarsHTML}</div></div>
            <div class="card hover-scale"><h3 style="color:var(--accent);">HAFTALIK İZLENEN VİDEO SAYISI</h3><div style="display:flex; align-items:flex-end; gap:10px; margin-top:20px;">${barsHTML}</div></div>
            <div class="card hover-scale"><h3 style="color:var(--warning);">HAFTALIK ÇÖZÜLEN SORU SAYISI</h3><div style="display:flex; align-items:flex-end; gap:10px; margin-top:20px;">${tBarsHTML}</div></div>
        </div>

        <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); margin-top:15px;">
            <div class="card hover-scale" style="display:flex; flex-direction:column;"><h3 style="color:var(--study);">🍰 SEÇİLİ AY: ÇALIŞMA DAĞILIMI</h3><div style="display:flex; gap:30px; align-items:center; margin-top:20px; flex-wrap:wrap; justify-content:center;"><div>${this.getSVGPie(sPieData, 140)}</div><div style="flex:1; min-width:180px;">${sL}</div></div><div style="border-top:1px dashed var(--border); padding-top:10px; margin-top:15px; display:flex; justify-content:space-between;"><span>Aylık Toplam:</span><strong>${totalStudyMins} dk</strong></div></div>
            <div class="card hover-scale" style="display:flex; flex-direction:column;"><h3 style="color:var(--accent);">🍰 SEÇİLİ AY: VİDEO DAĞILIMI</h3><div style="display:flex; gap:30px; align-items:center; margin-top:20px; flex-wrap:wrap; justify-content:center;"><div>${this.getSVGPie(wPieData, 140)}</div><div style="flex:1; min-width:180px;">${wL}</div></div><div style="border-top:1px dashed var(--border); padding-top:10px; margin-top:15px; display:flex; justify-content:space-between;"><span>Aylık Toplam:</span><strong>${mVid} Video (${Utils.formatTime(mStats.wSec)})</strong></div></div>
            <div class="card hover-scale" style="display:flex; flex-direction:column;"><h3 style="color:var(--warning);">🍰 SEÇİLİ AY: TEST DAĞILIMI</h3><div style="display:flex; gap:30px; align-items:center; margin-top:20px; flex-wrap:wrap; justify-content:center;"><div>${this.getSVGPie(tPieData, 140)}</div><div style="flex:1; min-width:180px;">${tL}</div></div><div style="border-top:1px dashed var(--border); padding-top:10px; margin-top:15px; display:flex; justify-content:space-between;"><span>Aylık Toplam:</span><strong>${mTestQCount} Soru (${mTestNet.toFixed(2)} Net)</strong></div></div>
        </div>
    `;
};

export const renderTopics = function(c) {
    const subjects = ["Türkçe", "Matematik", "Tarih", "Coğrafya", "Vatandaşlık", "Geometri"];
    let pillsHTML = subjects.map(s => `<div class="topic-pill ${this.activeTopicSubject === s ? 'active' : ''}" onclick="UI.activeTopicSubject='${s}'; UI.renderTopics(document.getElementById('mainContent'));">${s}</div>`).join('');
    const filtered = State.topics.filter(t => t.ders === this.activeTopicSubject);
    const completed = filtered.filter(t => t.tamamlandi).length; const total = filtered.length; const pct = total ? Math.round((completed/total)*100) : 0;
    let listHTML = filtered.map(t => `<div class="list-item hover-scale" style="grid-template-columns: 30px 1fr; border-left: 3px solid ${t.tamamlandi ? 'var(--success)' : 'transparent'};"><input type="checkbox" style="width:18px;height:18px;accent-color:var(--success);cursor:pointer;" ${t.tamamlandi ? 'checked' : ''} onchange="App.toggleTopic(${t.id}, this.checked)"><div style="font-weight:500; ${t.tamamlandi ? 'text-decoration:line-through; color:var(--text-muted);' : ''}">${t.ad}</div></div>`).join('');
    c.innerHTML = `<div class="card" style="margin-bottom:20px; border-top: 4px solid var(--accent);"><h3 style="color:var(--accent);">📚 KONU TAKİBİ</h3><div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom: 20px;">${pillsHTML}</div><div style="display:flex; justify-content:space-between; align-items:end; margin-bottom:5px;"><span style="font-size:1.2em; font-weight:bold;">${this.activeTopicSubject} İlerlemesi</span><span>%${pct} (${completed}/${total})</span></div><div class="progress-bg" style="margin-bottom:15px;"><div class="progress-fill" style="width:${pct}%; background:var(--accent);"></div></div><div style="display:flex; gap:10px; margin-bottom:15px;"><button class="btn btn-sm" style="border-color:var(--success); color:var(--success);" onclick="App.markAllTopics('${this.activeTopicSubject}', true)">Tümünü İşaretle</button><button class="btn btn-sm" style="border-color:var(--danger); color:var(--danger);" onclick="App.markAllTopics('${this.activeTopicSubject}', false)">Sıfırla</button></div><div class="item-list">${listHTML || '<div style="padding:15px;text-align:center;">Konu bulunamadı.</div>'}</div></div>`;
};

export const renderMockExam = function(c) {
    window.calcMockForm = () => {
        const v = (id) => parseInt(document.getElementById(id).value) || 0;
        const limit = (id, max) => { let val = v(id); if(val>max) { document.getElementById(id).value = max; return max; } return val; };
        const netCalc = (d, y) => Math.max(0, d - y * 0.25);
        const tr_d = limit('m_tr_d', 30), tr_y = limit('m_tr_y', 30); const mat_d = limit('m_mat_d', 30), mat_y = limit('m_mat_y', 30);
        const tar_d = limit('m_tar_d', 27), tar_y = limit('m_tar_y', 27); const cog_d = limit('m_cog_d', 18), cog_y = limit('m_cog_y', 18);
        const vat_d = limit('m_vat_d', 9), vat_y = limit('m_vat_y', 9); const gun_d = limit('m_gun_d', 6), gun_y = limit('m_gun_y', 6);
        const gyNet = netCalc(tr_d, tr_y) + netCalc(mat_d, mat_y); const gkNet = netCalc(tar_d, tar_y) + netCalc(cog_d, cog_y) + netCalc(vat_d, vat_y) + netCalc(gun_d, gun_y);
        document.getElementById('m_gy_net').innerText = gyNet.toFixed(2); document.getElementById('m_gk_net').innerText = gkNet.toFixed(2);
    };
    window.saveMockExam = () => {
        const v = (id) => parseInt(document.getElementById(id).value) || 0;
        const netCalc = (d, y) => Math.max(0, d - y * 0.25);
        const t_tr_d = v('m_tr_d'), t_tr_y = v('m_tr_y'); const t_mat_d = v('m_mat_d'), t_mat_y = v('m_mat_y');
        const t_tar_d = v('m_tar_d'), t_tar_y = v('m_tar_y'); const t_cog_d = v('m_cog_d'), t_cog_y = v('m_cog_y');
        const t_vat_d = v('m_vat_d'), t_vat_y = v('m_vat_y'); const t_gun_d = v('m_gun_d'), t_gun_y = v('m_gun_y');
        const turkceNet = netCalc(t_tr_d, t_tr_y); const matematikNet = netCalc(t_mat_d, t_mat_y); const tarihNet = netCalc(t_tar_d, t_tar_y);
        const cografyaNet = netCalc(t_cog_d, t_cog_y); const vatandaslikNet = netCalc(t_vat_d, t_vat_y); const guncelNet = netCalc(t_gun_d, t_gun_y);
        const gyNet = turkceNet + matematikNet; const gkNet = tarihNet + cografyaNet + vatandaslikNet + guncelNet;
        if (gyNet === 0 && gkNet === 0) return window.UI.showToast("Lütfen net girin", "var(--danger)");
        const data = { date: State.today, turkce: { dogru: t_tr_d, yanlis: t_tr_y, net: turkceNet }, matematik: { dogru: t_mat_d, yanlis: t_mat_y, net: matematikNet }, tarih: { dogru: t_tar_d, yanlis: t_tar_y, net: tarihNet }, cografya: { dogru: t_cog_d, yanlis: t_cog_y, net: cografyaNet }, vatandaslik: { dogru: t_vat_d, yanlis: t_vat_y, net: vatandaslikNet }, guncel: { dogru: t_gun_d, yanlis: t_gun_y, net: guncelNet }, gyNet: gyNet, gkNet: gkNet };
        window.App.addMockExam(data);
    };

    let row = (id, ad, max) => `<div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding:8px 0;"><span style="width:90px; font-weight:bold;">${ad} <span style="font-size:0.7em; color:var(--text-muted);">(${max})</span></span><input type="number" id="m_${id}_d" class="fancy-input exam-grid-input" placeholder="D" min="0" max="${max}" oninput="calcMockForm()"><input type="number" id="m_${id}_y" class="fancy-input exam-grid-input" placeholder="Y" min="0" max="${max}" oninput="calcMockForm()"></div>`;
    let pastHTML = State.mockExams.slice().reverse().map((e, idx) => `<div class="list-item hover-scale" style="grid-template-columns: 80px 1fr 60px; padding:15px; margin-bottom:5px;"><div style="font-size:0.85em; color:var(--text-muted)">${e.date}</div><div><div style="font-size:1em;">GY Net: <strong style="color:var(--accent);">${(e.gyNet||0).toFixed(2)}</strong> | GK Net: <strong style="color:var(--warning);">${(e.gkNet||0).toFixed(2)}</strong></div></div><button class="btn btn-sm" style="border-color:var(--danger); color:var(--danger);" onclick="App.deleteMockExam(${e.id})">Sil</button></div>`).join('');

    c.innerHTML = `<div class="grid" style="grid-template-columns: 1fr 1fr;"><div class="card" style="border-top:4px solid var(--accent);"><h3 style="color:var(--accent);">➕ YENİ DENEME EKLE</h3><div style="display:flex; gap:15px; margin-bottom:15px;"><div style="flex:1;"><h4 style="color:var(--text-muted); margin-bottom:5px;">Genel Yetenek</h4>${row('tr', 'Türkçe', 30)}${row('mat', 'Matematik', 30)}</div><div style="flex:1;"><h4 style="color:var(--text-muted); margin-bottom:5px;">Genel Kültür</h4>${row('tar', 'Tarih', 27)}${row('cog', 'Coğrafya', 18)}${row('vat', 'Vat.', 9)}${row('gun', 'Güncel', 6)}</div></div><div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:8px; border:1px solid var(--border); margin-bottom:15px; display:flex; justify-content:space-around; text-align:center; flex-wrap: wrap; gap: 10px;"><div><div style="font-size:0.8em; color:var(--text-muted);">GY Net</div><div id="m_gy_net" style="font-weight:bold; font-size:1.4em; color:var(--accent);">0.00</div></div><div><div style="font-size:0.8em; color:var(--text-muted);">GK Net</div><div id="m_gk_net" style="font-weight:bold; font-size:1.4em; color:var(--warning);">0.00</div></div></div><button class="btn btn-primary hover-scale" style="width:100%; padding:10px;" onclick="saveMockExam()">💾 Denemeyi Kaydet (+XP)</button></div><div class="card" style="border-top:4px solid var(--study);"><h3 style="color:var(--study);">Geçmiş Denemeler</h3><div style="max-height: 400px; overflow-y:auto; padding-right:5px;">${pastHTML || '<div style="color:var(--text-muted); padding:15px; text-align:center;">Henüz deneme eklenmedi.</div>'}</div></div></div>`;
};

export const renderAIPlannerSimple = function(c) {
    let todayHTML = '<div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">'; let queueHTML = '<div class="item-list">'; let totalRecMins = 0; let totalRecVids = 0;
    State.courses.forEach(crs => {
        const goalTest = State.settings.courseTestGoals?.[crs.name] || 0; const tList = State.tests.filter(t => t.subject === crs.name && t.date === State.today); let todaySolved = 0; tList.forEach(t => todaySolved += (parseInt(t.correct)||0) + (parseInt(t.wrong)||0));
        if (crs.type === 'test') {
            if (goalTest === 0 && todaySolved === 0) return;
            todayHTML += `<div class="card hover-scale" style="border-top: 4px solid ${crs.color}"><h3 style="color:${crs.color};">${crs.name}</h3><div style="font-size:1.1em; font-weight:bold; margin-bottom:5px;">Sadece Test Dersi</div><div style="color:var(--text-muted); font-size:0.85em; margin-bottom:5px;">Test Hedefi: <strong>${goalTest} Soru</strong></div><div style="color:var(--warning); font-size:0.85em; margin-bottom:15px;">Gerçekleşen: <strong>${todaySolved} Soru</strong></div><button class="btn hover-scale" style="width:100%; border-color:${crs.color}; color:${crs.color};" data-target="${encodeURIComponent(crs.name)}" onclick="UI.switchTab(decodeURIComponent(this.dataset.target))">Derse Git</button></div>`;
            return;
        }
        const goal = State.settings.courseGoals[crs.name] || 3; const watchedTodayCount = (crs.videos || []).filter(v => v.watched && v.watchedDate === State.today).length; const remainingGoal = Math.max(0, goal - watchedTodayCount); const unwatched = (crs.videos || []).filter(v => !v.watched);
        if (remainingGoal === 0 && unwatched.length > 0 && goalTest === 0 && todaySolved === 0) {
            todayHTML += `<div class="card hover-scale" style="border-top: 4px solid ${crs.color}; background: linear-gradient(145deg, rgba(35,134,54,0.1) 0%, var(--bg-card) 100%);"><h3 style="color:${crs.color};">${crs.name}</h3><div style="font-size:1.1em; font-weight:bold; margin-bottom:5px; color:var(--success)">🎉 Bugünkü Hedef Tamamlandı!</div><div style="color:var(--text-muted); font-size:0.85em; margin-bottom:15px;">Yarın yeni hedefler eklenecek.</div><button class="btn hover-scale" style="width:100%; border-color:${crs.color}; color:${crs.color};" data-target="${encodeURIComponent(crs.name)}" onclick="UI.switchTab(decodeURIComponent(this.dataset.target))">Yine de Derse Git</button></div>`; return;
        }
        if (unwatched.length === 0 && goalTest === 0 && todaySolved === 0) return;
        let recommended = []; let recMins = 0;
        if (remainingGoal > 0 && unwatched.length > 0) { recommended = unwatched.slice(0, remainingGoal); recMins = Math.ceil(recommended.reduce((s, v) => s + (v.sec || 0), 0) / 60); totalRecMins += recMins; totalRecVids += recommended.length; }
        todayHTML += `<div class="card hover-scale" style="border-top: 4px solid ${crs.color}"><h3 style="color:${crs.color};">${crs.name}</h3>${remainingGoal > 0 && recommended.length > 0 ? `<div style="font-size:1.1em; font-weight:bold; margin-bottom:5px;">Video: ${recommended.length} öneri (~${recMins} dk)</div>` : `<div style="font-size:1.1em; font-weight:bold; margin-bottom:5px; color:var(--success)">Videolar Tamamlandı</div>`}<div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.85em;"><span style="color:var(--text-muted);">Test Hedefi: <strong>${goalTest} Soru</strong></span></div><div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:0.85em;"><span style="color:var(--warning);">Gerçekleşen: <strong>${todaySolved} Soru</strong></span></div><div style="display:flex; gap:10px;">${recommended.length > 0 ? `<button class="btn btn-primary hover-scale" style="flex:1; background:${crs.color}; border-color:${crs.color};" onclick="window.open('${recommended[0].url}', '_blank')">▶ İlkini Başlat</button>` : ''}<button class="btn hover-scale" style="flex:1; border-color:${crs.color}; color:${crs.color};" data-target="${encodeURIComponent(crs.name)}" onclick="UI.switchTab(decodeURIComponent(this.dataset.target))">Derse Git</button></div></div>`;
        recommended.forEach((v, index) => { queueHTML += `<div class="list-item" style="grid-template-columns: 30px 100px 1fr 60px 50px; border-left: 3px solid ${index === 0 ? crs.color : 'transparent'};"><input type="checkbox" style="width:18px;height:18px;cursor:pointer;accent-color:${crs.color}" onchange="App.toggleVid(this, '${encodeURIComponent(crs.name)}', '${v.id}')"><div style="font-weight:bold; font-size:0.85em; color:${crs.color};">${crs.name}</div><div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${v.title}">${v.title}</div><div style="color:var(--text-muted); font-family:monospace; font-size:0.85em;">${Utils.formatTime(v.sec)}</div><a href="${v.url}" target="_blank" class="btn btn-sm hover-scale" style="padding:2px 6px;">Aç</a></div>`; });
    });
    todayHTML += '</div>'; queueHTML += '</div>';
    if(totalRecVids === 0) { todayHTML = `${todayHTML} <div class="card hover-scale" style="border-color:var(--success); text-align:center; padding:30px; margin-top: 15px;"><h2 style="color:var(--success)">🎉 Bugünkü tüm video hedeflerini tamamladın! Harikasın!</h2><p style="color:var(--text-muted); font-size: 0.85em; margin-top: 10px;">Serbest çalışabilir, test çözebilir veya yarını bekleyebilirsin.</p></div>`; queueHTML = ''; }
    c.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:15px;"><div><h2 style="color:var(--ai-color); margin-bottom:5px;">🤖 AI ÖNERİLEN BUGÜN</h2><p style="color:var(--text-muted); font-size:0.85em;">Günlük Kilitli (Daily Lock): Seçtiğin hedef adedini doldurduğunda yeni videolar ertesi güne bırakılır.</p></div><div class="card" style="padding:10px 15px; display:inline-block; border-color:var(--ai-color);"><div style="font-size:0.85em; color:var(--text-muted);">Bugünkü Video Hedefleri</div><div style="font-size:1.2em; font-weight:bold; color:white;">${totalRecVids} Video Kalan <span style="color:var(--text-muted); font-size:0.7em; font-weight:normal;">(~${totalRecMins} dk)</span></div></div></div>${todayHTML}${queueHTML !== '</div>' && queueHTML !== '' ? `<h3 style="margin-top:30px; margin-bottom:15px; color:var(--text-main);">📋 Sıradaki Video Kuyruğu (Bugün İçin Kalanlar)</h3>${queueHTML}` : ''}`;
};

export const renderStudy = function(c) {
    let optHtml = '<option value="">-- Ders Seç --</option>'; State.courses.forEach(crs => { optHtml += `<option value="${crs.name}">${crs.name}</option>`; });
    let listHTML = ''; const todaySessions = State.studySessions.filter(s => s.date === State.today).reverse();
    todaySessions.forEach(s => { const crs = State.courses.find(x => x.name === s.subject); const cColor = crs ? crs.color : 'var(--text-main)'; listHTML += `<div class="list-item" style="grid-template-columns: 1fr 100px 80px 40px; border-left: 3px solid ${cColor};"><div style="font-weight:bold">${s.subject}</div><div style="color:var(--text-muted)">${s.minutes} Dakika</div><div style="color:var(--xp-color); font-weight:bold;">+${s.xp} XP</div><button class="btn btn-sm" style="background:rgba(218,54,51,0.1); border:1px solid var(--danger); color:var(--danger);" onclick="App.deleteStudySession(${s.id})" title="Sil">✕</button></div>`; });
    c.innerHTML = `<div class="card hover-scale" style="border-top:4px solid var(--study); text-align:center; max-width:600px; margin: 0 auto 20px;"><h3 style="color:var(--study); margin-bottom:5px;">SERBEST ÇALIŞMA (KRONOMETRE)</h3><p style="font-size:0.85em; color:var(--text-muted); margin-bottom:20px;">Kitap okuma, konu tekrarı veya not çıkarma sürelerini buradan kaydet.</p><select id="studySubject" class="fancy-input" style="width:100%; max-width:300px; padding:10px; font-size:1.1em; margin-bottom:20px;">${optHtml}</select><div class="stopwatch-display" id="stopwatchDisplay">00:00:00</div><div style="display:flex; justify-content:center; gap:10px; margin-bottom:20px;"><button class="btn btn-primary hover-scale" id="swStartBtn" onclick="App.Stopwatch.start()" style="padding:10px 20px; font-size:1em;">▶️ Başlat</button><button class="btn hover-scale" id="swPauseBtn" onclick="App.Stopwatch.pause()" style="padding:10px 20px; font-size:1em; display:none; border-color:var(--warning); color:var(--warning);">⏸️ Duraklat</button><button class="btn hover-scale" onclick="App.Stopwatch.reset()" style="padding:10px 20px; font-size:1em;">🔄 Sıfırla</button><button class="btn btn-primary hover-scale" onclick="App.Stopwatch.save()" style="padding:10px 20px; font-size:1em; background:var(--study); border-color:var(--study);">💾 Süreyi Kaydet</button></div><div style="border-top:1px dashed var(--border); padding-top:20px; margin-top:10px;"><div style="font-size:0.85em; color:var(--text-muted); margin-bottom:10px;">Kronometre kullanmak istemiyorsan süreyi manuel gir:</div><div style="display:flex; justify-content:center; gap:10px; align-items:center;"><input type="number" id="manualMinutes" class="fancy-input" placeholder="Dakika gir" style="width:100px;"><button class="btn hover-scale" style="border-color:var(--study); color:var(--study);" onclick="App.addStudySession(document.getElementById('studySubject').value, parseInt(document.getElementById('manualMinutes').value)); document.getElementById('manualMinutes').value='';">Hızlı Ekle</button></div></div></div><h3 style="margin-bottom:15px; color:var(--text-muted); text-align:center;">Bugünün Çalışma Kayıtları</h3><div class="item-list" style="max-width:600px; margin:0 auto;">${listHTML || '<div style="padding:20px; text-align:center;">Henüz kayıt yok.</div>'}</div>`;
    this.updateStopwatchDisplay();
};

export const renderTestCourse = function(c, crs) {
    const tList = State.tests.filter(t => t.subject === crs.name);
    let dailyQ = 0, weeklyQ = 0, monthlyQ = 0; const todayStr = State.today; const curMonth = todayStr.slice(0,7);
    let y=2026, w=1; try { [y, w] = State.globalWeek.split('-W'); } catch(e){} const wStart = new Date(); wStart.setDate(wStart.getDate() - 6);
    tList.forEach(t => { const q = (parseInt(t.correct)||0) + (parseInt(t.wrong)||0); if(t.date === todayStr) dailyQ += q; if(t.date.startsWith(curMonth)) monthlyQ += q; const td = new Date(t.date); if(td >= wStart) weeklyQ += q; });
    
    // YENİ: Animasyonlu silme efekti için onclick içine 'this' eklendi.
    let listHTML = ''; tList.slice().reverse().forEach(t => { listHTML += `<div class="list-item" style="grid-template-columns: 80px 1fr 50px 50px 60px 40px; padding:10px;"><div style="font-size:0.8em; color:var(--text-muted)">${t.date}</div><div style="font-weight:bold">${t.subject}</div><div style="color:var(--success)">${t.correct} D</div><div style="color:var(--danger)">${t.wrong} Y</div><div style="color:var(--accent); font-weight:bold">${t.net} N</div><button class="btn btn-sm" style="background:rgba(218,54,51,0.1); border:1px solid var(--danger); color:var(--danger); padding:4px;" onclick="App.deleteTest(${t.id}, this)" title="Sil">✕</button></div>`; });
    
    c.innerHTML = `<div class="course-header-stats" style="border-top: 4px solid ${crs.color};"><div class="c-stat-item"><div style="color:var(--text-muted)">Bugün Çözülen</div><div class="c-stat-val">${dailyQ}</div><div style="font-size:0.85em; color:var(--text-muted)">Soru</div></div><div class="c-stat-item"><div style="color:var(--text-muted)">Son 7 Gün Çözülen</div><div class="c-stat-val" style="color:${crs.color}">${weeklyQ}</div><div style="font-size:0.85em; color:var(--text-muted)">Soru</div></div><div class="c-stat-item"><div style="color:var(--text-muted)">Bu Ay Çözülen</div><div class="c-stat-val">${monthlyQ}</div><div style="font-size:0.85em; color:var(--text-muted)">Soru</div></div></div><div class="card hover-scale" style="margin-bottom:20px; display:flex; gap:10px; flex-wrap:wrap; align-items:center;"><input type="number" id="tCorr_${crs.name.replace(/\s+/g,'_')}" placeholder="Doğru (D)" class="fancy-input" style="width:80px" min="0"><input type="number" id="tWrng_${crs.name.replace(/\s+/g,'_')}" placeholder="Yanlış (Y)" class="fancy-input" style="width:80px" min="0"><button class="btn btn-primary hover-scale" onclick="App.addTest('${crs.name}', parseInt(document.getElementById('tCorr_${crs.name.replace(/\s+/g,'_')}').value)||0, parseInt(document.getElementById('tWrng_${crs.name.replace(/\s+/g,'_')}').value)||0)">Testi Kaydet (Net Kadar XP)</button></div><h3 style="margin-bottom:15px; color:var(--text-muted);">Bu Derse Ait Test Geçmişi</h3><div class="item-list">${listHTML || '<div style="padding:20px; text-align:center;">Henüz test çözülmedi.</div>'}</div>`;
};

export const renderSettingsExt = function(c) {
    let tasksHtml = '';
    State.settings.taskList.forEach(t => { tasksHtml += `<div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:15px; border-bottom:1px solid var(--border); margin-bottom:15px;"><span style="font-size:1.05em; display:flex; align-items:center; gap:8px;">${t.icon} ${t.title}:</span><div style="display:flex; align-items:center; gap:10px;"><input type="number" value="${t.target}" class="fancy-input" onchange="App.updateTaskTarget('${t.id}', this.value)" style="width:60px; text-align:center; font-weight:bold;"><button class="btn btn-sm hover-scale" style="background:rgba(218,54,51,0.1); color:var(--danger); border-color:var(--danger); padding:4px 8px;" onclick="App.deleteCustomTask('${t.id}')">✕</button></div></div>`; });

    c.innerHTML = `
        <div class="grid" style="grid-template-columns: 1fr 1fr;">
            <div class="card hover-scale" style="border-top:4px solid var(--accent);">
                <h3 style="color:var(--accent); font-size:1.1em;">⚙️ GÖREV VE SİSTEM AYARLARI</h3>
                <p style="font-size:0.85em; color:var(--text-muted); margin-bottom:20px;">Günlük hedefleri buradan güncelleyebilir veya kendine özel görev ekleyebilirsin.</p>
                <div style="display:flex; flex-direction:column;">${tasksHtml}</div>
                <div style="margin-top: 20px; background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px; border: 1px dashed var(--border);">
                    <h4 style="margin-bottom:10px; color:var(--text-muted);">➕ Yeni Özel Görev Ekle</h4>
                    <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                        <input type="text" id="newTaskIcon" class="fancy-input" placeholder="İkon (Örn: 📚)" style="width:80px; text-align:center;" autocomplete="off">
                        <input type="text" id="newTaskTitle" class="fancy-input" placeholder="Görev Adı" style="flex:1;" autocomplete="off">
                        <input type="number" id="newTaskTarget" class="fancy-input" placeholder="Hedef" style="width:60px;" autocomplete="off">
                        <button class="btn btn-primary hover-scale" onclick="App.addCustomTask()">Ekle</button>
                    </div>
                </div>
            </div>

            <div class="card hover-scale" style="border-top:4px solid var(--warning);">
                <h3 style="color:var(--warning); font-size:1.1em;">📱 GENEL ARAYÜZ (LOKAL AYARLAR)</h3>
                <p style="font-size:0.85em; color:var(--text-muted); margin-bottom:20px;">Bu ayarlar cihazına (tarayıcıya) özeldir.</p>
                <div style="display:flex; flex-direction:column; gap:15px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span>Açılış Sekmesi:</span>
                        <select id="setDefTab" class="fancy-input" onchange="ExtSettings.data.defaultTab=this.value; ExtSettings.save();">
                            <option value="dashboard" ${ExtSettings.data.defaultTab==='dashboard'?'selected':''}>Dashboard</option>
                            <option value="scheduler" ${ExtSettings.data.defaultTab==='scheduler'?'selected':''}>AI Planlayıcı</option>
                            <option value="last" ${ExtSettings.data.defaultTab==='last'?'selected':''}>Son Kaldığım Yer</option>
                        </select>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span>Varsayılan Analiz Periyodu:</span>
                        <select id="setAnaPer" class="fancy-input" onchange="ExtSettings.data.defaultAnalyticPeriod=parseInt(this.value); ExtSettings.save(); UI.analyticsPeriod = parseInt(this.value);">
                            <option value="7" ${ExtSettings.data.defaultAnalyticPeriod===7?'selected':''}>7 Gün</option>
                            <option value="30" ${ExtSettings.data.defaultAnalyticPeriod===30?'selected':''}>30 Gün</option>
                            <option value="90" ${ExtSettings.data.defaultAnalyticPeriod===90?'selected':''}>90 Gün</option>
                        </select>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:15px;">
                        <span>Genel Animasyonlar (Konfeti vb.):</span>
                        <input type="checkbox" style="width:20px; height:20px; cursor:pointer; accent-color:var(--accent);" ${ExtSettings.data.animations?'checked':''} onchange="ExtSettings.data.animations=this.checked; ExtSettings.save();">
                    </div>
                </div>
            </div>

            <div class="card hover-scale" style="border-top:4px solid var(--danger); margin-top:20px; grid-column: 1 / -1;">
                <h3 style="color:var(--danger); font-size:1.1em;">⚠️ TEHLİKELİ BÖLGE</h3>
                <p style="font-size:0.85em; color:var(--text-muted); margin-bottom:15px;">Bu işlem geri alınamaz. Bu hesaba ait tüm veriler (Dersler, testler, loglar, görevler) kalıcı olarak silinir.</p>
                <button class="btn hover-scale" style="background:rgba(218,54,51,0.1); color:var(--danger); border-color:var(--danger); width:100%; padding:10px;" onclick="App.resetAccount()">🗑️ Hesabımı ve Tüm Verilerimi Sil</button>
            </div>
        </div>
    `;
};

export const renderDashboard = function(c) {
    const stats = AI.getStats(); let earnedBadges = [];
    Object.keys(stats.cStats).forEach(k => { const p = stats.cStats[k].percent; if(p > 0) earnedBadges.push(Game.getBadges(p, k)); });
    const actMap = {}; State.courses.forEach(crs => { if(crs.type==='test') return; (crs.videos||[]).forEach(v => { if(v.watched && v.watchedDate) actMap[v.watchedDate] = (actMap[v.watchedDate]||0)+1; }); });
    let heatHtml = ''; for(let i=59; i>=0; i--){ const d = new Date(); d.setDate(d.getDate()-i); const ds = Utils.getLocalDateStr(d); const count = actMap[ds]||0; let cls = 'heat-box'; if(count>0)cls+=' heat-l1'; if(count>2)cls+=' heat-l2'; if(count>4)cls+=' heat-l3'; if(count>6)cls+=' heat-l4'; heatHtml += `<div class="${cls}" title="${ds}: ${count} video"></div>`; }
    const overallP = stats.totalVid ? Math.round((stats.wVid / stats.totalVid)*100) : 0; const todayLog = State.logs.find(l=>l.realDate===State.today); const todayVid = todayLog ? todayLog.videoCount : 0; const vidT = State.settings.taskList.find(x=>x.id==='vid')?.target || 3; const goalP = Math.min(100, Math.round((todayVid / vidT)*100));
    let cards = '';
    Object.keys(stats.cStats).forEach(k => {
        const crs = stats.cStats[k]; const courseObj = State.courses.find(x=>x.name===k); const unwatched = (courseObj.videos||[]).filter(v=>!v.watched); const goal = State.settings.courseGoals[k] || 3;
        const remDays = Math.ceil(unwatched.length / goal); let finishDate = "Bitti 🎉"; if(remDays > 0) { const d = new Date(); d.setDate(d.getDate() + remDays); finishDate = d.toLocaleDateString('tr-TR'); }
        const nextVids = unwatched.slice(0, goal); const nextTime = Utils.formatTime(nextVids.reduce((s,v)=>s+(v.sec||0),0)); const nextUrl = nextVids.length > 0 ? nextVids[0].url : '#';
        cards += `<div class="card hover-scale" style="border-top:4px solid ${crs.color}; cursor:pointer" data-target="${encodeURIComponent(k)}" onclick="UI.switchTab(decodeURIComponent(this.dataset.target))"><h3 style="color:${crs.color}">${k}</h3><div style="display:flex; justify-content:space-between; align-items:end; margin-bottom:5px;"><span style="font-size:1.4em; font-weight:bold;">%${crs.percent}</span><span style="font-size:0.85em; color:var(--text-muted)">${crs.watched}/${crs.count}</span></div><div class="progress-bg"><div class="progress-fill" style="width:${crs.percent}%; background:${crs.color};"></div></div><div style="margin-top:15px; font-size:0.85em; color:var(--text-muted); border-top:1px solid var(--border); padding-top:10px;"><div style="display:flex; justify-content:space-between; margin-bottom:6px; align-items:center;"><span>Hedef (Video/Gün):</span><input type="number" min="1" value="${goal}" class="fancy-input" style="width:45px; height:22px; font-size:0.8em; padding:0 4px; text-align:center;" onchange="App.updateCourseGoal('${k}', this.value)" onclick="event.stopPropagation()"></div><div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span>Tahmini Bitiş:</span><span style="color:var(--text-main); font-weight:bold;">${finishDate}</span></div><div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>Sıradaki ${Math.min(goal, unwatched.length)} Video:</span><span style="color:${crs.color}; font-weight:bold;">${nextTime}</span></div>${unwatched.length > 0 ? `<div style="text-align:center;"><button class="btn btn-sm hover-scale" style="width:100%; justify-content:center; background:rgba(255,255,255,0.05); border-color:${crs.color}; color:${crs.color}" onclick="event.stopPropagation(); window.open('${nextUrl}','_blank')">▶️ Hemen İzle</button></div>` : ''}</div></div>`;
    });
    let todayStudyMins = State.studySessions.filter(s => s.date === State.today).reduce((acc, s) => acc + (parseInt(s.minutes) || 0), 0);
    let todayTests = State.tests.filter(t => t.date === State.today).length;
    let dailyBadgesHtml = '';
    if (todayVid >= 3) dailyBadgesHtml += `<span class="tier-badge hover-scale" style="background:rgba(255,255,255,0.1); border-color:var(--accent)" title="Bugün en az 3 video tamamladın">🎬 3 Video</span>`;
    if (todayStudyMins >= 90) dailyBadgesHtml += `<span class="tier-badge hover-scale" style="background:rgba(255,255,255,0.1); border-color:var(--study)" title="Bugün en az 90 dk çalıştın">🧠 90 Dk Odak</span>`;
    if (todayTests >= 1) dailyBadgesHtml += `<span class="tier-badge hover-scale" style="background:rgba(255,255,255,0.1); border-color:var(--warning)" title="Bugün en az 1 test çözdün">📝 Test Çözücü</span>`;
    if(dailyBadgesHtml === '') dailyBadgesHtml = '<span style="color:var(--text-muted); font-size:0.85em;">Henüz bugünün rozetlerini kazanmadın. Çalışmaya başla!</span>';
    let ringShineClass = (ExtSettings.data.animations && ExtSettings.data.microAnimations && goalP >= 100) ? 'shine' : '';

    const dueSrsItems = (State.srs || []).filter(item => !item.isCompleted && item.nextReviewDate <= State.today);
    let srsHtml = '';
    if (dueSrsItems.length > 0) {
        dueSrsItems.forEach(item => {
            let stageText = item.stage === 0 ? "1 Gün" : item.stage === 1 ? "3 Gün" : item.stage === 2 ? "7 Gün" : "30 Gün";
            let icon = item.type === 'video' ? '▶️' : '📚';
            srsHtml += `<div class="list-item hover-scale" style="grid-template-columns: 30px 1fr 60px 120px; border-left: 3px solid var(--study); margin-bottom: 5px;"><div style="font-size:1.2em;">${icon}</div><div><div style="font-weight:bold; font-size:0.9em; color:var(--text-main);">${item.name}</div><div style="font-size:0.75em; color:var(--text-muted);">${item.courseName}</div></div><div style="color:var(--study); font-weight:bold; font-size:0.8em; text-align:center;" title="Aşama">${stageText}</div><button class="btn btn-sm hover-scale" style="background:var(--study); border-color:var(--study); color:white; font-size:0.8em;" onclick="App.SRS.review('${item.id}')">🔄 Tekrar Ettim</button></div>`;
        });
    } else {
        srsHtml = `<div style="text-align:center; padding: 15px; color:var(--text-muted); font-size:0.85em;">Bugün için tekrar görevi yok. Zihnin dinleniyor! ✨</div>`;
    }
    const srsWidgetHtml = `<div class="card hover-scale" style="margin-bottom:15px; border-top: 4px solid var(--study); background: linear-gradient(145deg, rgba(163, 113, 247, 0.05) 0%, var(--bg-card) 100%);"><h3 style="display:flex; align-items:center; justify-content:space-between;"><span style="display:flex; align-items:center; gap:8px; color:var(--study);"><span style="font-size:1.2em;">🧠</span> ARALIKLI TEKRAR (SRS)</span><span style="font-size:0.75em; background:rgba(0,0,0,0.3); padding:4px 10px; border-radius:12px; color:var(--text-muted);">Unutma Eğrisini Kır!</span></h3><p style="font-size:0.8em; color:var(--text-muted); margin-bottom:15px; margin-top:5px;">Bilimsel olarak belirlenmiş aralıklarla (1-3-7-30 gün) tamamladığın konuları kalıcı hafızaya atıyoruz.</p><div>${srsHtml}</div></div>`;

    c.innerHTML = `<div class="card hover-scale" style="margin-bottom:15px; border-top: 2px solid var(--ai-color);"><h3 style="display:flex; align-items:center; gap:8px;"><span style="font-size:1.1em;">🎖️</span> GÜNÜN ROZETLERİ (BUGÜN)</h3><div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:10px;">${dailyBadgesHtml}</div></div>${srsWidgetHtml}<div class="card hover-scale" style="margin-bottom:15px;"><h3 style="display:flex; align-items:center; gap:8px;"><span style="font-size:1.1em;">🏆</span> KAZANILAN GENEL ROZETLER</h3><div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:10px;">${earnedBadges.length > 0 ? earnedBadges.join('') : '<span style="color:var(--text-muted); font-size:0.85em;">Henüz rozet açılmadı. İlerlemene devam ederek kazan!</span>'}</div></div><div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));"><div class="card hover-scale"><h3>Genel İlerleme</h3><div style="font-size:1.5em; font-weight:bold;">%${overallP}</div><div class="progress-bg" style="margin:8px 0;"><div class="progress-fill" style="width:${overallP}%; background:var(--accent);"></div></div><div style="font-size:0.85em; color:var(--text-muted)">${stats.wVid} / ${stats.totalVid} Video</div></div><div class="card hover-scale" style="border-color:var(--warning)"><h3>Günlük Genel Hedef</h3><div style="display:flex; align-items:center; gap:8px;"><span style="font-size:1.5em; font-weight:bold;">${todayVid}</span> <span style="color:var(--text-muted)">/ ${vidT}</span></div><div class="progress-bg" style="margin:8px 0;"><div class="progress-fill ${ringShineClass}" style="width:${goalP}%; background:var(--warning);"></div></div><div style="font-size:0.85em; color:var(--text-muted)">Bugünkü Genel Performans</div></div><div class="card hover-scale"><h3>Kalan Süre (1x)</h3><div style="font-size:1.5em; font-weight:bold;">${Utils.formatTime(stats.totalSec - stats.wSec)}</div><div style="font-size:0.85em; color:var(--text-muted); margin-top:8px;">Müfredatı Bitirmek İçin</div></div></div><div class="card hover-scale" style="margin-bottom:20px;"><h3 style="margin-bottom:10px; display:flex; gap:8px;"><span style="font-size:1em;">🔥</span> Zinciri Kırma (Son 60 Gün)</h3><div class="heatmap-grid">${heatHtml}</div></div><h3 style="margin-bottom:15px; color:var(--text-muted);">Ders İlerlemeleri</h3><div class="grid">${cards || '<div style="color:var(--text-muted)">Henüz ders eklenmedi.</div>'}</div>`;
};

export const renderCourse = function(c=document.getElementById('mainContent')) {
    const crs = State.courses.find(x=>x.name===this.currentTab); if(!crs || !c) return;
    const cColor = crs.color || '#58a6ff'; const nextId = (crs.videos||[]).find(v=>!v.watched)?.id; 
    let q = document.getElementById('searchVid') ? document.getElementById('searchVid').value.toLowerCase() : '';
    const vids = (crs.videos||[]).filter(v=>v.title.toLowerCase().includes(q)); 
    const count = (crs.videos||[]).length, watched = (crs.videos||[]).filter(v=>v.watched).length; const p = count ? Math.round((watched/count)*100) : 0;
    let remSec = 0; (crs.videos||[]).forEach(v=>{if(!v.watched) remSec+=(v.sec||0);});
    let listHTML = '';
    vids.forEach(v => {
        const isNext = v.id === nextId; let timeHtml = `<div>${v.duration || Utils.formatTime(v.sec)}</div>`; if(State.speed !== 1) timeHtml += `<div style="color:var(--success); font-size:0.8em; margin-top:4px;">(${Utils.formatTime((v.sec||0)/State.speed)})</div>`;
        listHTML += `<div class="list-item ${v.watched?'watched':''} ${isNext?'next-up':''}" id="${v.id}" style="${isNext?'border-left-color:'+cColor:''}"><input type="checkbox" style="width:18px;height:18px;cursor:pointer;accent-color:${cColor}" ${v.watched?'checked':''} onchange="App.toggleVid(this, '${encodeURIComponent(crs.name)}', '${v.id}')"><div class="video-title" title="${v.title}">${v.title}</div><div style="text-align:right; font-family:monospace; color:var(--text-muted)">${timeHtml}</div><div style="display:flex; gap:5px; justify-content:flex-end;"><button class="btn btn-sm hover-scale" onclick="document.getElementById('n_${v.id}').classList.toggle('active')">📝</button><a href="${v.url}" target="_blank" class="btn btn-sm hover-scale">▶️</a></div><div class="note-container ${v.note?'active':''}" id="n_${v.id}"><textarea class="fancy-input" placeholder="Not al... (#zor #tekrar gibi etiketler kullanabilirsin)" style="text-align:left;" onchange="App.saveNote('${crs.name}','${v.id}',this.value)">${v.note||''}</textarea></div></div>`;
    });
    if(!State.settings.courseTestGoals) State.settings.courseTestGoals = {};
    const testGoal = State.settings.courseTestGoals[crs.name] || 0;
    const allTests = State.tests.filter(t => t.subject === crs.name); const tListToday = allTests.filter(t => t.date === State.today);
    let todaySolved = 0; tListToday.forEach(t => todaySolved += (parseInt(t.correct)||0) + (parseInt(t.wrong)||0));
    const testPct = testGoal > 0 ? Math.min(Math.round((todaySolved/testGoal)*100), 100) : 0; const safeName = crs.name.replace(/\s+/g,'_');
    let historyHTML = '';
    allTests.slice().reverse().forEach(t => {
        const qCount = (parseInt(t.correct)||0) + (parseInt(t.wrong)||0);
        historyHTML += `<div class="list-item" style="grid-template-columns: 80px 1fr 40px 40px 50px 30px; padding:8px; margin-top:4px; background:rgba(0,0,0,0.3); border:1px solid var(--border);"><div style="font-size:0.75em; color:var(--text-muted)">${t.date}</div><div style="font-weight:bold; font-size:0.85em;">${qCount} Soru</div><div style="color:var(--success); font-size:0.8em;">${t.correct} D</div><div style="color:var(--danger); font-size:0.8em;">${t.wrong} Y</div><div style="color:var(--accent); font-weight:bold; font-size:0.8em;">${t.net} N</div><button class="btn btn-sm hover-scale" style="background:rgba(218,54,51,0.1); border:1px solid var(--danger); color:var(--danger); padding:2px 5px;" onclick="App.deleteTest(${t.id})" title="Sil">✕</button></div>`;
    });
    const testPanelHTML = `<div class="card test-panel-card hover-scale" style="margin-bottom:20px;"><h3 style="color:var(--warning); display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom: 1px solid rgba(210,153,34,0.2); padding-bottom:10px;"><span style="display:flex; align-items:center; gap:8px;"><span style="font-size:1.2em;">📝</span> BUGÜN SORU ÇÖZME</span><div style="font-size:0.85em; color:var(--text-muted); font-weight:normal; display:flex; align-items:center; gap:5px; background:rgba(0,0,0,0.3); padding:4px 10px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">HEDEF: <input type="number" id="testGoal_${safeName}" value="${testGoal}" style="width:50px; padding:2px; text-align:center; background:transparent; border:none; color:white; font-weight:bold; outline:none;" onchange="App.updateCourseTestGoal('${crs.name}', this.value)"></div></h3><div style="display:flex; justify-content:space-between; align-items:end; margin-bottom:5px;"><span style="font-size:1.1em; font-weight:bold;">${todaySolved} Soru Çözüldü</span><span style="font-size:0.85em; color:var(--text-muted)">%${testPct}</span></div><div class="progress-bg" style="margin-bottom:15px;"><div class="progress-fill" style="width:${testPct}%; background:var(--warning);"></div></div><div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;"><input type="number" id="tTotalV_${safeName}" placeholder="Çözülen" class="fancy-input" style="width:80px; border-color:rgba(210,153,34,0.3);" min="0"><button class="btn btn-sm hover-scale" style="border-color:var(--warning); color:var(--warning);" onclick="document.getElementById('tTotalV_${safeName}').value = (parseInt(document.getElementById('tTotalV_${safeName}').value)||0) + 5;">+5 Soru</button><input type="number" id="tCorrV_${safeName}" placeholder="D(Ops)" class="fancy-input" style="width:60px" min="0"><input type="number" id="tWrngV_${safeName}" placeholder="Y(Ops)" class="fancy-input" style="width:60px" min="0"><button class="btn btn-primary hover-scale" style="flex:1; background:var(--warning); border-color:var(--warning);" onclick="App.addVideoCourseTest('${crs.name}')">Kaydet</button></div><div style="margin-top:15px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:10px;"><div style="font-size:0.85em; color:var(--text-muted); display:flex; justify-content:space-between; cursor:pointer; align-items:center;" onclick="const e = document.getElementById('hist_${safeName}'); e.style.display = e.style.display==='none'?'block':'none';"><span>Bu Derse Ait Test Geçmişi (Eklenenleri Gör/Sil)</span><span style="font-size:1.2em;">🔽</span></div><div id="hist_${safeName}" style="display:none; margin-top:10px; max-height:250px; overflow-y:auto; padding-right:5px;">${historyHTML || '<div style="text-align:center; padding:10px; color:var(--text-muted); font-size:0.85em;">Henüz soru çözülmemiş.</div>'}</div></div></div>`;
    c.innerHTML = `${testPanelHTML}<div class="course-header-stats hover-scale" style="border-top: 4px solid ${cColor};"><div class="c-stat-item"><div style="color:var(--text-muted)">İlerleme</div><div class="c-stat-val">%${p}</div><div style="font-size:0.85em; color:var(--text-muted)">${watched} / ${count} Video</div></div><div class="c-stat-item"><div style="color:var(--text-muted)">Kalan Süre (${State.speed}x)</div><div class="c-stat-val" style="color:${cColor}">${Utils.formatTime(remSec/State.speed)}</div><div style="font-size:0.85em; color:var(--text-muted)">Normal: ${Utils.formatTime(remSec)}</div></div><div class="c-stat-item"><div style="color:var(--text-muted); margin-bottom:10px; text-align:left;">Tamamlanma Durumu</div><div class="progress-bg"><div class="progress-fill" id="courseProgressFill" style="width:${p}%; background:${cColor};"></div></div><div style="font-size:0.85em; color:${cColor}; margin-top:5px; text-align:left;">%${p} Tamamlandı</div></div></div><div style="display:flex; justify-content:space-between; margin-bottom:15px; gap:10px; flex-wrap:wrap;"><input type="text" id="searchVid" class="fancy-input" placeholder="🔍 Video Ara..." value="${q}" onkeyup="UI.renderCourse()" style="flex:1; text-align:left;" autocomplete="off"><select id="speedSel" class="fancy-input" onchange="State.speed=parseFloat(this.value); UI.renderCourse();"><option value="1" ${State.speed===1?'selected':''}>1x Hız</option><option value="1.25" ${State.speed===1.25?'selected':''}>1.25x Hız</option><option value="1.5" ${State.speed===1.5?'selected':''}>1.5x Hız</option><option value="2" ${State.speed===2?'selected':''}>2x Hız</option></select></div><div class="item-list">${listHTML || '<div style="padding:20px; text-align:center;">Video bulunamadı.</div>'}</div>`;
    if(nextId && !q) setTimeout(()=>document.getElementById(nextId)?.scrollIntoView({behavior:'smooth',block:'center'}), 200);
};

export const renderForest = function(c) {
        const xp = State.settings.xp || 0;
        const treeCost = 500; 
        
        const fullTrees = Math.floor(xp / treeCost);
        const currentTreeXP = xp % treeCost;
        const progress = Math.round((currentTreeXP / treeCost) * 100);

        let stages = [
            { limit: 100, emoji: '🌱', name: 'Tohum' },
            { limit: 200, emoji: '🌿', name: 'Filiz' },
            { limit: 350, emoji: '🪴', name: 'Küçük Fidan' },
            { limit: 499, emoji: '🌲', name: 'Genç Ağaç' },
            { limit: 500, emoji: '🌳', name: 'Büyük Ağaç' }
        ];

        let currentStage = stages.find(s => currentTreeXP < s.limit) || stages[stages.length-1];

        let forestHtml = '';
        
        for(let i = 0; i < fullTrees; i++) {
            // Meyveler kaldırıldı. Sadece Çam ve Meşe var.
            const treeEmoji = Math.random() > 0.5 ? '🌳' : '🌲';
            
            // Doğal bir orman hissi için rastgele boyut ve dikey sapma
            const scale = 0.85 + (Math.random() * 0.4); // 0.85 ile 1.25 arası boyut
            const yOffset = (Math.random() * 20) - 10; // -10px ile +10px arası yukarı/aşağı
            
            // Her 5 ağaçtan biri "Efsanevi/Altın Ağaç" olsun (Meyve yerine geçen ödül)
            const isLegendary = (i + 1) % 5 === 0;
            
            let filterStyle = 'drop-shadow(0 5px 5px rgba(0,0,0,0.5))';
            if (isLegendary) {
                // Efsanevi ağaç için parlayan, altın sarısı CSS filtresi
                filterStyle = 'drop-shadow(0 0 15px rgba(241, 196, 15, 0.9)) brightness(1.2) sepia(0.5) hue-rotate(-30deg)';
            }

            forestHtml += `
                <div style="font-size:3.5rem; margin:0 -8px; transform: translateY(${yOffset}px) scale(${scale}); filter: ${filterStyle}; transition: transform 0.3s; cursor:default; z-index:${Math.floor(scale*10)};" 
                     onmouseover="this.style.transform='translateY(${yOffset - 10}px) scale(${scale * 1.1})'" 
                     onmouseout="this.style.transform='translateY(${yOffset}px) scale(${scale})'" 
                     title="${isLegendary ? '⭐ Efsanevi Ağaç!' : 'Yetişkin Ağaç'}">
                    ${treeEmoji}
                </div>`;
        }
        
        forestHtml += `
            <div style="font-size:3.5rem; margin:10px 15px; position:relative; animation: pulseBar 2s infinite; z-index:100;">
                ${currentStage.emoji}
                <div style="position:absolute; bottom:-15px; left:50%; transform:translateX(-50%); font-size:0.6rem; background:var(--bg-card); padding:2px 6px; border-radius:10px; border:1px solid var(--success); white-space:nowrap; font-weight:bold; color:var(--success); box-shadow: 0 4px 6px rgba(0,0,0,0.5);">%${progress}</div>
            </div>
        `;

        c.innerHTML = `
            <div class="card" style="text-align:center; border-top:4px solid var(--success); overflow:hidden; position:relative; padding-bottom:0;">
                <h2 style="color:var(--success); margin-bottom:5px; display:flex; justify-content:center; align-items:center; gap:10px;">
                    <span>🌲</span> Odak Ormanı
                </h2>
                <p style="color:var(--text-muted); font-size:0.9em; margin-bottom:20px;">Kazandığın her <strong>${treeCost} XP</strong> ormanına yeni bir ağaç ekler. Her 5 ağaçta bir <strong>⭐ Efsanevi Ağaç</strong> kazanırsın.</p>
                
                <div class="grid" style="grid-template-columns: 1fr; max-width:600px; margin:0 auto 30px;">
                    <div style="display:flex; justify-content:center; align-items:center; gap:25px; padding:20px; background:rgba(0,0,0,0.2); border-radius:12px; border:1px solid rgba(46, 204, 113, 0.2);">
                        <div style="font-size:5rem; filter: drop-shadow(0 0 20px rgba(46, 204, 113, 0.4));">${currentStage.emoji}</div>
                        <div style="text-align:left; flex:1;">
                            <div style="font-weight:bold; font-size:1.3rem; color:var(--text-main); margin-bottom:5px;">Sıradaki Ağaç: ${currentStage.name}</div>
                            <div style="display:flex; justify-content:space-between; font-size:0.85em; color:var(--text-muted); margin-bottom:8px;">
                                <span>Büyüme Durumu</span>
                                <span>${currentTreeXP} / ${treeCost} XP</span>
                            </div>
                            <div class="progress-bg" style="height:14px;"><div class="progress-fill" style="width:${progress}%; background:var(--success);"></div></div>
                        </div>
                    </div>
                </div>

                <div style="text-align:left; font-weight:bold; color:var(--text-muted); margin-bottom:10px; font-size:0.9em; padding: 0 20px;">Dikilen Toplam Ağaç: <span style="color:var(--success); font-size:1.2em;">${fullTrees}</span></div>
                
                <div style="background: linear-gradient(180deg, rgba(13,17,23,0) 0%, rgba(9, 30, 20, 0.8) 100%); padding:60px 20px 20px; display:flex; flex-wrap:wrap; justify-content:center; align-items:flex-end; min-height:200px; border-top:1px dashed rgba(255,255,255,0.05); margin: 0 -15px; box-shadow: inset 0 -30px 50px rgba(0,0,0,0.8);">
                    ${fullTrees === 0 && currentTreeXP === 0 ? '<div style="color:var(--text-muted); font-size:0.9em; align-self:center;">Ormanın şu an boş. Hemen bir video izle veya test çöz!</div>' : forestHtml}
                </div>
            </div>
            `;
    };