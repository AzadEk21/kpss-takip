// js/db/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, enableIndexedDbPersistence, collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// BURAYI KENDİ FIREBASE BİLGİLERİNİZLE DEĞİŞTİRİN
const firebaseConfig = {
  apiKey: "AIzaSyBwVPRq0oN3wqhbZsAl1jbtA6OHp1jiZW4",
  authDomain: "kpss-takip-21.firebaseapp.com",
  projectId: "kpss-takip-21",
  storageBucket: "kpss-takip-21.firebasestorage.app",
  messagingSenderId: "378980641960",
  appId: "1:378980641960:web:2ae2858bf06574b3d2269d",
  measurementId: "G-LNE39JJHP2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// İnternet yokken bile çalışması için Çevrimdışı Belleği (Offline Persistence) aktif ediyoruz.
enableIndexedDbPersistence(db).catch((err) => {
    console.error("Çevrimdışı mod başlatılamadı:", err.message);
});

export { db, auth, collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile };
