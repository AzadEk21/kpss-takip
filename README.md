📚 KPSS Takip Sistemi

Modern, mobil uyumlu, Firebase tabanlı, e-posta ile giriş destekli kapsamlı bir KPSS çalışma ve performans yönetim platformu.

Bu proje, klasik video takip uygulamalarının ötesine geçerek:

🔐 Güvenli kullanıcı girişi (Firebase Auth)

☁️ Bulut veri senkronizasyonu (Firestore)

📱 Mobil uyumlu responsive tasarım

📊 Gerçek zamanlı analiz

🏆 Gamification (XP sistemi)

🧠 AI planlayıcı altyapısı

özelliklerini bir araya getirir.

🚀 Projenin Amacı

KPSS hazırlık sürecini:

Merkezi

Senkronize

Analitik

Motive edici

Ölçeklenebilir

bir dijital sisteme dönüştürmek.

Artık tüm veriler kullanıcı hesabına bağlıdır ve cihazlar arası senkronize edilir.

🔐 Kimlik Doğrulama

Firebase Authentication kullanılır.

Desteklenen giriş yöntemi:

📧 E-posta / Şifre ile giriş

Özellikler:

Kullanıcı bazlı veri izolasyonu

Güvenli oturum yönetimi

Şifre sıfırlama desteği

Persistent login (oturum hatırlama)

☁️ Veri Altyapısı

Veri saklama sistemi:

Firebase Firestore (NoSQL)

Gerçek zamanlı senkronizasyon

Kullanıcı bazlı koleksiyon yapısı

Güvenlik kuralları ile izole veri erişimi

Veri Yapısı (Örnek)
users/{userId}/
   ├── videos
   ├── studySessions
   ├── xpLogs
   ├── plannerTasks
   └── analytics
🏗️ Teknik Mimari
💻 Kullanılan Teknolojiler

Vanilla JavaScript (ES6 Modules)

HTML5

CSS3 (Responsive)

Firebase Auth

Firebase Firestore

Canvas API (Grafikler)

🧱 Mimari Yaklaşım

Feature-based modüler yapı

Merkezi state yönetimi

Action tabanlı event sistemi

UI → Action → State → Firestore akışı

Responsive tasarım (mobil öncelikli)

📱 Mobil Uyumluluk

Responsive layout

Dokunmatik uyumlu etkileşimler

Dinamik sekme sistemi

Mobil dashboard optimizasyonu

Küçük ekranlarda sadeleştirilmiş grafik görünümü

✨ Özellikler
🎥 Video Takip

CSV import

Video tamamlanma takibi

Süre hesaplama (h/m/s destekli)

Ders bazlı ilerleme analizi

⏱️ Çalışma Süresi Takibi

Günlük süre girişi

Haftalık toplam hesaplama

XP dönüşümü (dk × katsayı)

🏆 Gamification Sistemi

XP kazanımı

Günlük görev sistemi

Başarı görselleştirmeleri

İlerleme animasyonları

📊 Analitik Dashboard

Günlük / haftalık performans

Ders bazlı dağılım

XP gelişim grafiği

Çalışma yoğunluk analizi

🧠 AI Planlayıcı (Altyapı)

Günlük hedef önerileri

Video + test görev planlaması

Senkronize görev sistemi

🔄 Gerçek Zamanlı Senkronizasyon

Veriler cihazdan bağımsızdır

Kullanıcı farklı cihazlardan giriş yapabilir

Tüm ilerleme bulutta saklanır

Veri kaybı riski minimize edilmiştir


🛠️ Kurulum
1️⃣ Repo'yu klonla
git clone https://github.com/AzadEk21/kpss-takip.git
2️⃣ Firebase yapılandırması

Firebase Console'dan:

Yeni proje oluştur

Authentication → Email/Password aktif et

Firestore Database oluştur

Ardından firebaseConfig bilgilerini projeye ekle:

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
3️⃣ Uygulamayı başlat

Basit bir local server ile çalıştır:

npx serve .

veya

live-server
🔒 Güvenlik

Firestore Security Rules ile kullanıcı bazlı veri izolasyonu

Auth olmadan veri erişimi yok

Client-side state manipülasyonuna karşı kontrol

🎯 Hedef Kullanıcı

KPSS adayları

Planlı ve ölçülebilir çalışmak isteyen öğrenciler

Dijital performans takibi isteyen kullanıcılar

📌 Projenin Güçlü Yönleri

Framework bağımlılığı yok

Hafif mimari

Ölçeklenebilir Firebase altyapısı

Mobil uyumlu tasarım

Gamification destekli sistem

👤 Geliştirici

Azad Ekinci
Software Engineering Graduate
Gamified Productivity & Study Systems Architect
