// js/db/DB.js
import { db, collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where } from './firebase-config.js';
import { State } from '../state/State.js';

export const DB = {
    async init() {
        return Promise.resolve(); // Firebase otomatik başlar, bekleme yapmasına gerek yok
    },
    
    // Her tablonun anahtar (ID) ismini belirliyoruz
    getKeyPath(store) {
        const keys = { courses: 'name', settings: 'id', logs: 'date', tests: 'id', studySessions: 'id', mockExams: 'id', topics: 'id', srs: 'id', users: 'id' };
        return keys[store] || 'id';
    },

    async get(store, key) {
        try {
            const docRef = doc(db, store, String(key));
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? docSnap.data() : null;
        } catch(e) { console.error("Get Error:", e); return null; }
    },

    async put(store, data) {
        try {
            const keyPath = this.getKeyPath(store);
            // Eğer ID yoksa otomatik bir ID üret
            if (!data[keyPath]) data[keyPath] = store + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            
            // Tüm verilere (Kullanıcı profili hariç) oturum açan kişinin ID'sini mühürle
            if(store !== 'users' && store !== 'settings' && State.currentUser && !data.userId) {
                data.userId = State.currentUser.id;
            }

            const docRef = doc(db, store, String(data[keyPath]));
            await setDoc(docRef, data, { merge: true }); // Merge: Var olan veriyi ezmeden üstüne yazar
            return data[keyPath];
        } catch(e) { console.error("Put Error:", e); throw e; }
    },

    async delete(store, key) {
        try {
            await deleteDoc(doc(db, store, String(key)));
        } catch(e) { console.error("Delete Error:", e); throw e; }
    },

    async getAll(store) {
        try {
            if(!State.currentUser && store !== 'users') return []; // Güvenlik: Giriş yapılmadıysa veri çekme
            let q;
            if(store === 'users') {
                q = collection(db, store);
            } else {
                // Sadece o anki kullanıcıya ait (userId) verileri buluttan getir
                q = query(collection(db, store), where("userId", "==", State.currentUser.id));
            }
            const querySnapshot = await getDocs(q);
            const results = [];
            querySnapshot.forEach((doc) => results.push(doc.data()));
            return results;
        } catch(e) { console.error("GetAll Error:", e); return []; }
    },

    async clearUserData(userId) {
        if(!userId) return;
        const stores = ['courses', 'logs', 'tests', 'studySessions', 'mockExams', 'topics', 'srs'];
        for(let s of stores) {
            const items = await this.getAll(s);
            for(let item of items) {
                const keyPath = this.getKeyPath(s);
                await this.delete(s, item[keyPath]);
            }
        }
        await this.delete('settings', 'main_' + userId);
    }
};
