/* ==========================================================
   store.js — Firestore + Realtime DB + Auth (ES modul)
   ========================================================== */

import { FIREBASE_CONFIG } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc,
  getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getDatabase, ref as rtdbRef, get as rtdbGet, set as rtdbSet,
  push as rtdbPush, onValue, off, serverTimestamp as rtdbTs, query as rtdbQuery, orderByChild
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let app = null, db = null, rtdb = null, auth = null;
let _rejim = "demo";

function qurilmaId() {
  let id = localStorage.getItem("qurilma_id");
  if (!id) { id = "q_" + Math.random().toString(36).slice(2, 11); localStorage.setItem("qurilma_id", id); }
  return id;
}

function init() {
  const sozlangan = FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.startsWith("BU_YERGA");
  if (sozlangan) {
    try {
      app = initializeApp(FIREBASE_CONFIG);
      db = getFirestore(app);
      rtdb = getDatabase(app);
      auth = getAuth(app);
      _rejim = "firebase";
    } catch (e) {
      console.warn("Firebase ulanmadi:", e.message);
      _rejim = "demo";
    }
  }
  if (_rejim === "demo") urugTashla();
  return _rejim;
}

const rejim = () => _rejim;

/* ================= DEMO OMBORI ================= */
const KALIT = "anor_mahsulotlar", KALIT_IZOH = "anor_izohlar",
      KALIT_FOYDA = "anor_foyda", KALIT_CHAT = "anor_chat";

const demoOqi = (k, s) => { try { return JSON.parse(localStorage.getItem(k)) ?? s; } catch { return s; } };
const demoYoz = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const yangiId = () => "id_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function urugTashla() {
  if (localStorage.getItem(KALIT)) return;
  const hozir = Date.now(), soat = 3600000;
  demoYoz(KALIT, [
    { id: "m1", nom: "Simsiz quloqchin Aura Pro", narx: 690000, kategoriya: "Elektronika",
      tavsif: "Faol shovqin bostirish, 32 soat batareya, tez quvvatlash.",
      rasm: "", zaxira: 12, sotuvchiId: "demo_sotuvchi", sotuvchiIsmi: "Demo Doʻkon", createdAt: hozir - soat * 2 },
    { id: "m2", nom: "Choʻyan qozon 8 litr", narx: 480000, kategoriya: "Uy-roʻzgʻor",
      tavsif: "Qalin devorli choʻyan qozon. Osh va shoʻrva uchun.",
      rasm: "", zaxira: 5, sotuvchiId: "demo_sotuvchi", sotuvchiIsmi: "Demo Doʻkon", createdAt: hozir - soat * 26 },
    { id: "m3", nom: "Adras koʻylak, qoʻlbola", narx: 350000, kategoriya: "Kiyim-kechak",
      tavsif: "Margʻilon adrasidan tikilgan koʻylak. S–XL.",
      rasm: "", zaxira: 20, sotuvchiId: "demo_sotuvchi", sotuvchiIsmi: "Demo Doʻkon", createdAt: hozir - soat * 50 }
  ]);
  demoYoz(KALIT_IZOH, [
    { id: "i1", mahsulotId: "m1", muallif: "Diyor", baho: 5, matn: "Tovushi zoʻr!", createdAt: hozir - soat }
  ]);
}

const hujjatniOchir = d => {
  const data = d.data();
  let v = data.createdAt;
  if (v && typeof v.toMillis === "function") v = v.toMillis();
  return { id: d.id, ...data, createdAt: v || Date.now() };
};

/* ================= MAHSULOTLAR (CRUD) ================= */

async function mahsulotlar() {
  if (_rejim === "firebase") {
    const snap = await getDocs(query(collection(db, "mahsulotlar"), orderBy("createdAt", "desc")));
    return snap.docs.map(hujjatniOchir);
  }
  return demoOqi(KALIT, []).sort((a, b) => b.createdAt - a.createdAt);
}

async function mahsulot(id) {
  if (_rejim === "firebase") {
    const d = await getDoc(doc(db, "mahsulotlar", id));
    return d.exists() ? hujjatniOchir(d) : null;
  }
  return demoOqi(KALIT, []).find(m => m.id === id) || null;
}

async function mahsulotlarim(uid) {
  if (_rejim === "firebase") {
    const snap = await getDocs(query(collection(db, "mahsulotlar"), where("sotuvchiId", "==", uid)));
    const ro = snap.docs.map(hujjatniOchir);
    return ro.sort((a, b) => b.createdAt - a.createdAt);
  }
  return demoOqi(KALIT, []).filter(m => m.sotuvchiId === uid).sort((a, b) => b.createdAt - a.createdAt);
}

async function qoshish(data) {
  if (_rejim === "firebase") {
    const ref = await addDoc(collection(db, "mahsulotlar"), { ...data, createdAt: serverTimestamp() });
    return ref.id;
  }
  const ro = demoOqi(KALIT, []);
  const id = yangiId();
  ro.push({ id, ...data, createdAt: Date.now() });
  demoYoz(KALIT, ro);
  return id;
}

async function yangilash(id, data) {
  if (_rejim === "firebase") {
    await updateDoc(doc(db, "mahsulotlar", id), { ...data, updatedAt: serverTimestamp() });
    return;
  }
  demoYoz(KALIT, demoOqi(KALIT, []).map(m => m.id === id ? { ...m, ...data } : m));
}

async function ochirish(id) {
  if (_rejim === "firebase") {
    await deleteDoc(doc(db, "mahsulotlar", id));
    return;
  }
  demoYoz(KALIT, demoOqi(KALIT, []).filter(m => m.id !== id));
  demoYoz(KALIT_IZOH, demoOqi(KALIT_IZOH, []).filter(i => i.mahsulotId !== id));
}

/* ================= IZOHLAR ================= */

async function izohlar(mahsulotId) {
  if (_rejim === "firebase") {
    const snap = await getDocs(query(
      collection(db, "mahsulotlar", mahsulotId, "izohlar"), orderBy("createdAt", "desc")));
    return snap.docs.map(hujjatniOchir);
  }
  return demoOqi(KALIT_IZOH, []).filter(i => i.mahsulotId === mahsulotId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

async function izohQoshish(mahsulotId, muallif, matn, baho = 5) {
  if (_rejim === "firebase") {
    await addDoc(collection(db, "mahsulotlar", mahsulotId, "izohlar"), {
      muallif, matn, baho: Number(baho), createdAt: serverTimestamp()
    });
    return;
  }
  const ro = demoOqi(KALIT_IZOH, []);
  ro.push({ id: yangiId(), mahsulotId, muallif, matn, baho: Number(baho), createdAt: Date.now() });
  demoYoz(KALIT_IZOH, ro);
}

/* ================= XABARLAR (aloqa formasi) ================= */

async function xabarYubor(xabar) {
  if (_rejim === "firebase") {
    await addDoc(collection(db, "xabarlar"), { ...xabar, createdAt: serverTimestamp() });
    return;
  }
  const ro = demoOqi("anor_xabarlar", []);
  ro.push({ ...xabar, createdAt: Date.now() });
  demoYoz("anor_xabarlar", ro);
}

/* ================= SAQLANGANLAR ================= */

const saqlanganlar = () => demoOqi("anor_saqlangan", []);

async function saqlashniOzgartir(mahsulotId) {
  const ro = saqlanganlar();
  const bor = ro.includes(mahsulotId);
  demoYoz("anor_saqlangan", bor ? ro.filter(x => x !== mahsulotId) : [...ro, mahsulotId]);
  return !bor;
}

const saqlanganmi = id => saqlanganlar().includes(id);

/* ================= AUTHENTICATION ================= */

async function royxatdan(email, parol, ism, telefon) {
  if (_rejim !== "firebase") throw new Error("Roʻyxatdan oʻtish uchun Firebase kerak");
  const cred = await createUserWithEmailAndPassword(auth, email, parol);
  await updateProfile(cred.user, { displayName: ism });
  await rtdbSet(rtdbRef(rtdb, `foydalanuvchilar/${cred.user.uid}`), {
    ism, email, telefon, createdAt: rtdbTs()
  });
  return cred.user;
}

async function kirish(email, parol) {
  if (_rejim !== "firebase") throw new Error("Kirish uchun Firebase kerak");
  const cred = await signInWithEmailAndPassword(auth, email, parol);
  return cred.user;
}

async function chiqish() {
  if (_rejim === "firebase") await signOut(auth);
  sessionStorage.removeItem("admin_ok");
}

function joriyFoydalanuvchi() {
  return auth?.currentUser || null;
}

function foydalanuvchiKuzatuv(callback) {
  if (_rejim !== "firebase") { callback(null); return () => {}; }
  return onAuthStateChanged(auth, callback);
}

async function foydalanuvchiMalumot(uid) {
  if (_rejim !== "firebase") return null;
  const snap = await rtdbGet(rtdbRef(rtdb, `foydalanuvchilar/${uid}`));
  return snap.exists() ? snap.val() : null;
}

/* ================= ADMIN PAROL (Realtime DB) ================= */

async function adminParolniTekshir(parol) {
  if (_rejim !== "firebase") {
    return parol === "admin123";           // demo
  }
  const snap = await rtdbGet(rtdbRef(rtdb, "sozlamalar/admin_parol"));
  if (!snap.exists()) throw new Error("Realtime DB da 'sozlamalar/admin_parol' yoʻq");
  return snap.val() === parol;
}

/* ================= YOZISHMALAR (Realtime DB, chatlar) ================= */
/* Chat ID = ikkala UID ni saralab bir-biriga qoʻshish */
const chatId = (uidA, uidB) => [uidA, uidB].sort().join("__");

async function chatBoshla(sotuvchiUid, xaridorUid, mahsulotId, mahsulotNomi) {
  if (_rejim !== "firebase") return chatId(sotuvchiUid, xaridorUid);
  const cid = chatId(sotuvchiUid, xaridorUid);
  await rtdbSet(rtdbRef(rtdb, `chatlar/${cid}/malumot`), {
    ishtirokchilar: { [sotuvchiUid]: true, [xaridorUid]: true },
    mahsulotId, mahsulotNomi,
    yangilangan: rtdbTs()
  });
  return cid;
}

async function xabarYuborChat(cid, yozuvchiUid, yozuvchiIsmi, matn) {
  if (_rejim !== "firebase") {
    const ro = demoOqi(KALIT_CHAT, {});
    ro[cid] = ro[cid] || [];
    ro[cid].push({ yozuvchiUid, yozuvchiIsmi, matn, createdAt: Date.now() });
    demoYoz(KALIT_CHAT, ro);
    return;
  }
  await rtdbPush(rtdbRef(rtdb, `chatlar/${cid}/xabarlar`), {
    yozuvchiUid, yozuvchiIsmi, matn, createdAt: rtdbTs()
  });
  await rtdbSet(rtdbRef(rtdb, `chatlar/${cid}/malumot/yangilangan`), rtdbTs());
}

/* Real vaqtda chat xabarlarini kuzatish. Qaytaradi: unsubscribe funksiyasi */
function chatKuzat(cid, callback) {
  if (_rejim !== "firebase") {
    const ro = demoOqi(KALIT_CHAT, {})[cid] || [];
    callback(ro.sort((a, b) => a.createdAt - b.createdAt));
    return () => {};
  }
  const r = rtdbQuery(rtdbRef(rtdb, `chatlar/${cid}/xabarlar`), orderByChild("createdAt"));
  const uzatuv = onValue(r, snap => {
    const ro = [];
    snap.forEach(x => ro.push({ id: x.key, ...x.val() }));
    callback(ro);
  });
  return () => off(r, "value", uzatuv);
}

/* Foydalanuvchining barcha chatlari */
async function chatlarim(uid) {
  if (_rejim !== "firebase") return [];
  const snap = await rtdbGet(rtdbRef(rtdb, "chatlar"));
  if (!snap.exists()) return [];
  const hammasi = snap.val();
  const ro = [];
  for (const [cid, chat] of Object.entries(hammasi)) {
    if (chat?.malumot?.ishtirokchilar?.[uid]) {
      const ishtirokchi = Object.keys(chat.malumot.ishtirokchilar).find(u => u !== uid);
      const ishtirokchiMalumot = await foydalanuvchiMalumot(ishtirokchi);
      const xabarlar = chat.xabarlar ? Object.values(chat.xabarlar) : [];
      const oxirgi = xabarlar.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];
      ro.push({
        cid,
        boshqaUid: ishtirokchi,
        boshqaIsmi: ishtirokchiMalumot?.ism || "Foydalanuvchi",
        mahsulotNomi: chat.malumot.mahsulotNomi,
        mahsulotId: chat.malumot.mahsulotId,
        yangilangan: chat.malumot.yangilangan || 0,
        oxirgiXabar: oxirgi?.matn || "",
        oxirgiYozuvchi: oxirgi?.yozuvchiIsmi || ""
      });
    }
  }
  return ro.sort((a, b) => b.yangilangan - a.yangilangan);
}

export const Store = {
  init, rejim, qurilmaId,
  mahsulotlar, mahsulot, mahsulotlarim, qoshish, yangilash, ochirish,
  izohlar, izohQoshish, xabarYubor,
  saqlanganlar, saqlashniOzgartir, saqlanganmi,
  royxatdan, kirish, chiqish, joriyFoydalanuvchi, foydalanuvchiKuzatuv, foydalanuvchiMalumot,
  adminParolniTekshir,
  chatId, chatBoshla, xabarYuborChat, chatKuzat, chatlarim
};
