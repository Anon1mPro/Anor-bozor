/* ==========================================================
   config.js — sozlamalar (ES modul)
   ========================================================== */

export const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyCgv7UQp2zLXtn2CojCIV8cmSo0SuoKZPA",
  authDomain:        "keylogger-25e57.firebaseapp.com",
  databaseURL:       "https://keylogger-25e57-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "keylogger-25e57",
  storageBucket:     "keylogger-25e57.firebasestorage.app",
  messagingSenderId: "329624532890",
  appId:             "1:329624532890:web:f37c20cce29f305763ac23",
  measurementId:     "G-NP6W16FY8V"
};

/* Admin paneliga kirish paroli — faqat oddiy toʻsiq.
   Haqiqiy himoya uchun Firebase Authentication + Firestore Rules. */
/* Admin parol Realtime Database dan olinadi: sozlamalar/admin_parol */

/* Sayt maʼlumotlari — header va footer shu yerdan oladi */
export const SAYT = {
  nom: "ANOR BOZOR",
  shior: "Onlayn bozor",
  telefon: "+998 90 123 45 67",
  telefon2: "+998 75 221 00 11",
  email: "salom@anorbozor.uz",
  manzil: "Qarshi sh., Mustaqillik koʻchasi 12",
  ish_vaqti: "Dushanba–Shanba, 09:00–19:00",
  telegram: "https://t.me/anorbozor",
  instagram: "https://instagram.com/anorbozor"
};

export const KATEGORIYALAR = [
  "Elektronika", "Kiyim-kechak", "Uy-roʻzgʻor",
  "Oziq-ovqat", "Sport", "Kitoblar", "Boshqa"
];
