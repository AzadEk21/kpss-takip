export const DB = {
    db: null,
    async init() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open('KPSS_Master_DB', 7); // Versiyon 7
            req.onupgradeneeded = e => {
                const db = e.target.result;
                if(!db.objectStoreNames.contains('users')) {
                    const store = db.createObjectStore('users', { keyPath: 'username' });
                    store.createIndex('id', 'id', { unique: true });
                }
                if(!db.objectStoreNames.contains('auth')) db.createObjectStore('auth', { keyPath: 'id' });
                
                if(!db.objectStoreNames.contains('courses')) db.createObjectStore('courses', { keyPath: 'name' });
                if(!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'id' });
                if(!db.objectStoreNames.contains('logs')) db.createObjectStore('logs', { keyPath: 'date' });
                if(!db.objectStoreNames.contains('tests')) db.createObjectStore('tests', { keyPath: 'id', autoIncrement: true });
                if(!db.objectStoreNames.contains('studySessions')) db.createObjectStore('studySessions', { keyPath: 'id', autoIncrement: true });
                if(!db.objectStoreNames.contains('mockExams')) db.createObjectStore('mockExams', { keyPath: 'id', autoIncrement: true });
                if(!db.objectStoreNames.contains('topics')) db.createObjectStore('topics', { keyPath: 'id', autoIncrement: true });
                if(!db.objectStoreNames.contains('srs')) db.createObjectStore('srs', { keyPath: 'id' }); // YENİ SRS TABLOSU
            };
            req.onsuccess = async e => { this.db = e.target.result; resolve(); };
            req.onerror = e => { console.error("DB Init Error", e); reject(e); };
        });
    },
    async get(store, key) { return new Promise((resolve, reject) => { try { const req = this.db.transaction(store, 'readonly').objectStore(store).get(key); req.onsuccess = () => resolve(req.result); req.onerror = (e) => reject(e); } catch(e){ reject(e); } }); },
    async put(store, data) { return new Promise((resolve, reject) => { try { const tx = this.db.transaction(store, 'readwrite'); const req = tx.objectStore(store).put(data); tx.oncomplete = () => resolve(req.result); tx.onerror = (e) => reject(e); } catch(e){ reject(e); } }); },
    async delete(store, key) { return new Promise((resolve, reject) => { try { const tx = this.db.transaction(store, 'readwrite'); tx.objectStore(store).delete(key); tx.oncomplete = () => resolve(); tx.onerror = (e) => reject(e); } catch(e){ reject(e); } }); },
    async getAll(store) { return new Promise((resolve, reject) => { try { const req = this.db.transaction(store, 'readonly').objectStore(store).getAll(); req.onsuccess = () => resolve(req.result); req.onerror = (e) => reject(e); } catch(e){ reject(e); } }); },
    
    async clearUserData(userId) {
        if(!userId) return;
        const stores = ['courses', 'logs', 'tests', 'studySessions', 'mockExams', 'topics', 'srs']; // srs eklendi
        for(let s of stores) {
            const items = await this.getAll(s);
            for(let item of items) {
                if(item.userId === userId || !item.userId) {
                    const key = item.id || item.name || item.date;
                    await this.delete(s, key);
                }
            }
        }
        await this.delete('settings', 'main_' + userId);
    }
};