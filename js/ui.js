/* ==========================================================
   ui.js — umumiy qism (ES modul): header, footer, animatsiya,
   foydalanuvchi holati
   ========================================================== */

import { Store } from "./store.js";
import { SAYT } from "./config.js";

let _foyda = null;

/* ---------- Formatlash ---------- */
const pul = n => (Number(n) || 0).toLocaleString("uz-UZ").replace(/,/g, " ") + " soʻm";
const harf = s => (s || "?").trim().charAt(0).toUpperCase();

function sana(ms) {
  const d = new Date(ms);
  const oy = ["yanvar","fevral","mart","aprel","may","iyun","iyul","avgust","sentabr","oktabr","noyabr","dekabr"];
  const i = n => String(n).padStart(2, "0");
  return `${d.getDate()}-${oy[d.getMonth()]} ${d.getFullYear()}, ${i(d.getHours())}:${i(d.getMinutes())}`;
}

function vaqt(ms) {
  const f = Math.floor((Date.now() - ms) / 1000);
  if (f < 60) return "hozirgina";
  if (f < 3600) return `${Math.floor(f / 60)} daqiqa oldin`;
  if (f < 86400) return `${Math.floor(f / 3600)} soat oldin`;
  if (f < 172800) return "kecha";
  if (f < 604800) return `${Math.floor(f / 86400)} kun oldin`;
  return sana(ms).split(",")[0];
}

const xavfsiz = s => String(s ?? "").replace(/[&<>"']/g,
  c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

const media = m => m.rasm
  ? `<img src="${xavfsiz(m.rasm)}" alt="${xavfsiz(m.nom)}" loading="lazy"
         onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ph',textContent:'${harf(m.nom)}'}))">`
  : `<div class="ph">${harf(m.nom)}</div>`;

/* ---------- Yon header ---------- */
function headerQur() {
  const kirgan = !!_foyda;
  const joriy = location.pathname.split("/").pop() || "index.html";
  const soni = Store.saqlanganlar().length;

  const havolalar = [
    { url: "index.html",        ico: "◈", nom: "Bosh sahifa", herkes: true },
    { url: "mahsulotlar.html",  ico: "▦", nom: "Mahsulotlar", herkes: true },
    { url: "saqlanganlar.html", ico: "♥", nom: "Saqlanganlar", herkes: true, badge: soni },
    { url: "menikilar.html",    ico: "⊞", nom: "Mening mahsulotlarim", faqat: "kirgan" },
    { url: "xabarlar.html",     ico: "✎", nom: "Yozishmalar", faqat: "kirgan" },
    { url: "aloqa.html",        ico: "✉", nom: "Aloqa", herkes: true },
    { url: "admin.html",        ico: "⚙", nom: "Admin", herkes: true }
  ].filter(h => h.herkes || (h.faqat === "kirgan" && kirgan));

  const nav = havolalar.map((s, i) => `
    <a class="reveal-x nav-link ${s.url === joriy ? "is-active" : ""}" href="${s.url}" style="--d:${180 + i * 45}ms">
      <span class="nav-ico" aria-hidden="true">${s.ico}</span>
      <span>${s.nom}</span>
      ${s.badge ? `<span class="nav-badge" id="saqlangan-soni">${s.badge}</span>` : ""}
    </a>`).join("");

  const foydaBlok = kirgan
    ? `<div class="side-user reveal-x" style="--d:480ms">
         <div class="avatar">${harf(_foyda.displayName || _foyda.email)}</div>
         <div style="min-width:0;flex:1">
           <div style="font-weight:700;font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
             ${xavfsiz(_foyda.displayName || "Foydalanuvchi")}
           </div>
           <button class="mono muted" id="chiqish-btn"
             style="background:none;border:0;padding:0;font-size:.7rem;cursor:pointer;text-decoration:underline">
             Chiqish
           </button>
         </div>
       </div>`
    : `<div class="reveal-x" style="--d:480ms;display:grid;gap:8px">
         <a class="btn btn-primary btn-sm" href="kirish.html">Kirish</a>
         <a class="btn btn-ghost btn-sm" href="royxat.html">Roʻyxatdan oʻtish</a>
       </div>`;

  const el = document.getElementById("yon-header");
  if (!el) return;
  el.className = "side-header";
  el.innerHTML = `
    <a class="brand reveal-x" href="index.html" style="--d:60ms">
      <span class="brand-mark">A</span>
      <span>
        <span class="brand-name">${SAYT.nom}</span><br>
        <span class="brand-sub">${SAYT.shior}</span>
      </span>
    </a>
    <nav class="side-nav">${nav}</nav>
    ${foydaBlok}
    <div class="side-foot reveal-x" style="--d:560ms">
      <div class="db-state" id="db-holat"><span class="dot-demo"></span> ulanmoqda…</div>
    </div>`;

  document.getElementById("chiqish-btn")?.addEventListener("click", async () => {
    await Store.chiqish();
    location.href = "index.html";
  });

  /* Mobil tugma */
  if (!document.querySelector(".nav-toggle")) {
    const t = document.createElement("button");
    t.className = "nav-toggle";
    t.setAttribute("aria-label", "Menyu");
    t.innerHTML = "☰";
    const p = document.createElement("div");
    p.className = "nav-scrim";
    t.onclick = () => document.body.classList.toggle("nav-open");
    p.onclick = () => document.body.classList.remove("nav-open");
    document.body.append(t, p);
  }
}

/* ---------- Footer ---------- */
function footerQur() {
  const el = document.getElementById("sayt-footer");
  if (!el) return;
  el.className = "site-footer";
  el.innerHTML = `
    <div class="footer-inner">
      <div class="footer-col reveal">
        <h4>Biz haqimizda</h4>
        <p class="muted" style="font-size:.92rem">
          ${SAYT.nom} — mahalliy sotuvchilar va xaridorlar uchun onlayn bozor.
          Ro'yxatdan o'ting va o'z mahsulotingizni qo'ying.
        </p>
        <div style="display:flex;gap:10px;margin-top:14px">
          <a class="tag tag-glaze" href="${SAYT.telegram}" target="_blank" rel="noopener">Telegram</a>
          <a class="tag tag-glaze" href="${SAYT.instagram}" target="_blank" rel="noopener">Instagram</a>
        </div>
      </div>
      <div class="footer-col reveal" style="--d:120ms">
        <h4>Aloqa</h4>
        <ul>
          <li class="contact-line"><span class="ico">☎</span><a href="tel:${SAYT.telefon.replace(/\s/g,"")}">${SAYT.telefon}</a></li>
          <li class="contact-line"><span class="ico">☎</span><a href="tel:${SAYT.telefon2.replace(/\s/g,"")}">${SAYT.telefon2}</a></li>
          <li class="contact-line"><span class="ico">✉</span><a href="mailto:${SAYT.email}">${SAYT.email}</a></li>
          <li class="contact-line"><span class="ico">⌖</span><span>${SAYT.manzil}</span></li>
          <li class="contact-line"><span class="ico">◷</span><span>${SAYT.ish_vaqti}</span></li>
        </ul>
      </div>
      <div class="footer-col reveal" style="--d:220ms">
        <h4>Sahifalar</h4>
        <ul>
          <li><a href="index.html">Bosh sahifa</a></li>
          <li><a href="mahsulotlar.html">Mahsulotlar</a></li>
          <li><a href="saqlanganlar.html">Saqlanganlar</a></li>
          <li><a href="royxat.html">Roʻyxatdan oʻtish</a></li>
          <li><a href="admin.html">Admin panel</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} ${SAYT.nom}. Barcha huquqlar himoyalangan.</span>
      <span>Qarshi, Oʻzbekiston</span>
    </div>`;
}

/* ---------- Ochilish animatsiyasi ---------- */
function ochilish(ildiz = document) {
  const els = ildiz.querySelectorAll(".reveal:not(.is-open), .reveal-x:not(.is-open)");
  const io = new IntersectionObserver((y, k) => {
    let n = 0;
    y.forEach(v => {
      if (!v.isIntersecting) return;
      if (!v.target.style.getPropertyValue("--d")) {
        v.target.style.setProperty("--d", `${n * 70}ms`); n++;
      }
      v.target.classList.add("is-open");
      k.unobserve(v.target);
    });
  }, { threshold: .08, rootMargin: "0px 0px -40px 0px" });
  els.forEach(el => io.observe(el));

  document.querySelectorAll(".timeline").forEach(t => {
    new IntersectionObserver((y, k) => {
      if (y[0].isIntersecting) { t.classList.add("is-open"); k.disconnect(); }
    }, { threshold: .05 }).observe(t);
  });
}

/* ---------- Tost ---------- */
function tost(matn, tur = "ok") {
  let s = document.querySelector(".toast-stack");
  if (!s) { s = document.createElement("div"); s.className = "toast-stack"; document.body.appendChild(s); }
  const t = document.createElement("div");
  t.className = "toast" + (tur === "err" ? " err" : "");
  t.textContent = matn;
  s.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

function saqlanganSoniYangila() {
  const b = document.getElementById("saqlangan-soni");
  const n = Store.saqlanganlar().length;
  if (b) { b.textContent = n; b.style.display = n ? "" : "none"; }
}

/* ---------- Sahifani ishga tushirish ---------- */
function boshla() {
  const r = Store.init();

  /* Foydalanuvchi holati oʻzgarsa — headerni qayta chizamiz */
  Store.foydalanuvchiKuzatuv(f => {
    _foyda = f;
    headerQur();
    /* Qayta chizilgan headerni darhol koʻrsatamiz (yon animatsiyani kutmaymiz) */
    document.querySelectorAll("#yon-header .reveal-x, #yon-header .reveal")
      .forEach(el => el.classList.add("is-open"));

    /* Kirish/roʻyxatdan oʻtishni talab qiladigan sahifalarda tekshiruv */
    const oz = document.body.dataset.talab;
    if (oz === "kirgan" && !f) location.href = "kirish.html";
    if (oz === "mehmon" && f) location.href = "index.html";

    const h = document.getElementById("db-holat");
    if (h) {
      h.innerHTML = r === "firebase"
        ? `<span class="dot-live"></span> Firebase ulangan`
        : `<span class="dot-demo"></span> Demo rejim`;
    }
  });

  headerQur();
  footerQur();

  setTimeout(() => ochilish(), 320);
  setTimeout(() => document.querySelector(".shutter")?.remove(), 1100);
}

export const UI = {
  boshla, ochilish, tost, pul, sana, vaqt, harf, media, xavfsiz, saqlanganSoniYangila,
  foyda: () => _foyda
};

document.addEventListener("DOMContentLoaded", boshla);
