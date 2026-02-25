export const openModal = function(id) { 
    const m = document.getElementById(id); 
    if(m){ 
        m.style.display = 'flex'; 
        this.toggleModalTab('csv'); // this = UI objesi
    } 
};

export const closeModal = function(id) { 
    const m = document.getElementById(id); 
    if(m) m.style.display = 'none'; 
};

export const toggleModalTab = function(id) { 
    ['CSV','YT','Test'].forEach(x => { 
        const tab = document.getElementById(`tab${x}`); 
        const view = document.getElementById(`view${x}`); 
        if(tab && view) { 
            tab.style.borderColor = 'transparent'; 
            view.style.display = 'none'; 
        } 
    }); 
    const aT = document.getElementById(`tab${id==="csv"?"CSV":id==="yt"?"YT":"Test"}`); 
    const aV = document.getElementById(`view${id==="csv"?"CSV":id==="yt"?"YT":"Test"}`); 
    if(aT) aT.style.borderColor = 'var(--accent)'; 
    if(aV) aV.style.display = 'flex'; 
};