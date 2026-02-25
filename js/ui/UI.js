import { ExtSettings, State } from '../state/State.js';
import { Utils, PALETTE } from '../utils/Utils.js';

import * as Modals from './UI.Modals.js';
import * as XP from './UI.XP.js';
import * as Render from './UI.Render.js';

export const UI = {
    currentTab: 'dashboard', 
    analyticsPeriod: null, 
    activeTopicSubject: 'Türkçe',
    
    // Alt modüllerdeki fonksiyonları UI objesine entegre ediyoruz
    ...Modals,
    ...XP,
    ...Render,

    init() {
        this.analyticsPeriod = ExtSettings.data.defaultAnalyticPeriod || 30;
        const pal = document.getElementById('colorPalette');
        if(pal) {
            pal.innerHTML = '';
            PALETTE.forEach(c => { 
                const d = document.createElement('div'); 
                d.className = 'color-chip'; 
                d.style.background = c; 
                d.onclick = () => { 
                    document.querySelectorAll('.color-chip').forEach(el=>el.classList.remove('selected')); 
                    d.classList.add('selected'); 
                    State.selectedColor = c; 
                }; 
                pal.appendChild(d); 
            });
            if(pal.firstChild) pal.firstChild.classList.add('selected');
        }
        let initialTab = ExtSettings.data.defaultTab === 'last' ? (localStorage.getItem('bys_last_tab') || 'dashboard') : ExtSettings.data.defaultTab;
        this.switchTab(initialTab); 
        this.updateXPFooter();
        
        const tabsEl = document.getElementById('tabs');
        if (tabsEl) {
            tabsEl.addEventListener('wheel', (e) => {
                if (e.deltaY !== 0) { e.preventDefault(); tabsEl.scrollLeft += e.deltaY; }
            });
        }
    },
    
    switchTab(tab) {
        this.currentTab = tab; 
        if(ExtSettings.data.defaultTab === 'last') localStorage.setItem('bys_last_tab', tab);
        this.renderTabs(); 
        this.renderMain(); 
        
        setTimeout(() => {
            const activeTab = document.querySelector('.tab.active');
            if (activeTab) activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }, 50);
    },
    
    updateStopwatchDisplay() {
        const el = document.getElementById('stopwatchDisplay'); if(!el) return;
        const s = window.App.Stopwatch.sec; 
        const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60; 
        el.innerText = `${Utils.pad(h)}:${Utils.pad(m)}:${Utils.pad(sec)}`;
    },

    onTabDragStart(e, name) { 
        e.dataTransfer.setData('text/plain', name); 
        e.target.style.opacity = '0.5'; 
    },
    
    onTabDragOver(e) { 
        e.preventDefault(); 
    },
    
    onTabDrop(e, targetName, type) {
        e.preventDefault(); 
        const draggedName = e.dataTransfer.getData('text/plain'); 
        if(draggedName && draggedName !== targetName) {
            const dCrs = State.courses.find(c=>c.name===draggedName); 
            const tCrs = State.courses.find(c=>c.name===targetName);
            if(dCrs && tCrs && dCrs.type === tCrs.type) {
                let order = []; 
                try { order = JSON.parse(localStorage.getItem('bys_tab_order')) || []; } catch(err){}
                State.courses.forEach(c => { if(!order.includes(c.name)) order.push(c.name); });
                const fromIdx = order.indexOf(draggedName); 
                const toIdx = order.indexOf(targetName);
                if(fromIdx !== -1 && toIdx !== -1) { 
                    order.splice(fromIdx, 1); 
                    order.splice(toIdx, 0, draggedName); 
                    localStorage.setItem('bys_tab_order', JSON.stringify(order)); 
                    this.renderTabs(); 
                }
            }
        }
    }
};