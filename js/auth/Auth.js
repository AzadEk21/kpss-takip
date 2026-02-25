import { DB } from '../db/DB.js';
import { State } from '../state/State.js';
import { UI } from '../ui/UI.js';

export const Auth = {
    async hashPasswordPBKDF2(password, saltBase64 = null) {
        let salt;
        if (saltBase64) {
            const binaryString = atob(saltBase64);
            salt = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) salt[i] = binaryString.charCodeAt(i);
        } else {
            salt = crypto.getRandomValues(new Uint8Array(16));
        }

        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]);
        const hashBuffer = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: salt, iterations: 210000, hash: "SHA-256" }, keyMaterial, 256);
        
        return { 
            hash: btoa(String.fromCharCode.apply(null, new Uint8Array(hashBuffer))), 
            salt: btoa(String.fromCharCode.apply(null, salt)) 
        };
    },

    async register(displayName, username, password, confirmPassword) {
        if (!username || !password) throw new Error("Kullanıcı adı ve şifre zorunludur.");
        if (password !== confirmPassword) throw new Error("Şifreler eşleşmiyor.");
        if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) throw new Error("Şifre en az 8 karakter, 1 harf ve 1 sayı içermelidir.");
        
        const safeUsername = username.trim().toLowerCase();
        const existing = await DB.get('users', safeUsername);
        if (existing) throw new Error("Bu kullanıcı adı zaten alınmış.");

        const { hash, salt } = await this.hashPasswordPBKDF2(password);
        
        const user = {
            id: 'user_' + Date.now(),
            username: safeUsername,
            displayName: displayName || safeUsername,
            createdAt: new Date().toISOString(),
            salt: salt,
            hash: hash,
            failedAttempts: 0,
            lockUntil: null
        };

        await DB.put('users', user);
        return await this.login(safeUsername, password, true);
    },

    async login(username, password, rememberMe) {
        const safeUsername = username.trim().toLowerCase();
        const user = await DB.get('users', safeUsername);
        
        if (!user) throw new Error("Kullanıcı bulunamadı.");
        if (user.lockUntil && user.lockUntil > Date.now()) {
            throw new Error(`Hesap kilitli. Lütfen ${new Date(user.lockUntil).toLocaleTimeString()} sonrasında tekrar deneyin.`);
        }

        const { hash } = await this.hashPasswordPBKDF2(password, user.salt);

        if (hash !== user.hash) {
            user.failedAttempts = (user.failedAttempts || 0) + 1;
            if (user.failedAttempts >= 5) {
                user.lockUntil = Date.now() + 5 * 60 * 1000; // 5 dakika kilit
                await DB.put('users', user);
                throw new Error("5 hatalı deneme! Hesabınız güvenlik amacıyla 5 dakika kilitlendi.");
            }
            await DB.put('users', user);
            throw new Error("Hatalı şifre.");
        }

        user.failedAttempts = 0;
        user.lockUntil = null;
        await DB.put('users', user);

        const session = {
            id: 'session',
            userId: user.id,
            username: user.username,
            displayName: user.displayName,
            createdAt: Date.now(),
            expiresAt: Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
        };

        await DB.put('auth', session);
        State.currentUser = user;
        return true;
    },

    async restoreSession() {
        const session = await DB.get('auth', 'session');
        if (!session) return false;
        
        if (Date.now() > session.expiresAt) {
            await DB.delete('auth', 'session');
            return false;
        }

        const user = await DB.get('users', session.username);
        if(!user) return false;

        State.currentUser = user;
        return true;
    },

    async logout() {
        await DB.delete('auth', 'session');
        State.currentUser = null;
        location.reload(); // Uygulamayı sıfırla ve login ekranına at
    }
};