// js/auth/Auth.js
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from '../db/firebase-config.js';
import { State } from '../state/State.js';
import { DB } from '../db/DB.js';

export const Auth = {
    async login(email, password, remember) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const u = userCredential.user;
            State.currentUser = { id: u.uid, username: u.email, displayName: u.displayName || u.email.split('@')[0] };
            return true;
        } catch (error) {
            let msg = "Giriş başarısız.";
            if(error.code === 'auth/invalid-credential') msg = "E-posta veya şifre hatalı!";
            else if(error.code === 'auth/too-many-requests') msg = "Çok fazla deneme yaptınız. Biraz bekleyin.";
            throw new Error(msg);
        }
    },

    async register(displayName, email, password, confirmPassword) {
        if (password !== confirmPassword) throw new Error("Şifreler eşleşmiyor!");
        if (password.length < 6) throw new Error("Şifre en az 6 karakter olmalıdır!");
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const u = userCredential.user;
            await updateProfile(u, { displayName: displayName });
            
            State.currentUser = { id: u.uid, username: u.email, displayName: displayName || u.email.split('@')[0] };
            await DB.put('users', { id: u.uid, username: u.email, displayName });
            return true;
        } catch (error) {
            let msg = "Kayıt başarısız.";
            if(error.code === 'auth/email-already-in-use') msg = "Bu e-posta adresi zaten kullanımda!";
            else if(error.code === 'auth/invalid-email') msg = "Geçersiz e-posta adresi!";
            throw new Error(msg);
        }
    },

    async restoreSession() {
        return new Promise((resolve) => {
            // Firebase sayfa yenilendiğinde kullanıcının oturumunun açık kalıp kalmadığını kontrol eder
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    State.currentUser = { id: user.uid, username: user.email, displayName: user.displayName || user.email.split('@')[0] };
                    resolve(true);
                } else {
                    State.currentUser = null;
                    resolve(false);
                }
            });
        });
    },

    async logout() {
        await signOut(auth);
        State.currentUser = null;
        window.location.reload();
    }
};
