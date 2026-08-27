/* ==========================================================
   xabarlar.js — chat sahifasi (real vaqtda RTDB)
   ========================================================== */

import { Store } from "./store.js";
import { UI } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  const royxatEl = document.getElementById("chat-royxat");
  const boshEl = document.getElementById("chat-head");
  const xabarlarEl = document.getElementById("chat-xabarlar");
  const emptyEl = document.getElementById("chat-empty");
  const formaEl = document.getElementById("chat-forma");
  const matnEl = document.getElementById("chat-matn");
  const ismEl = document.getElementById("chat-ism");
  const mahsulotEl = document.getElementById("chat-mahsulot");
  const mahsulotLink = document.getElementById("chat-mahsulot-link");

  let foyda = null;
  let joriyChat = null;
  let uzatuv = null;                     /* onValue tomirini uzish uchun */
  let chatlar = [];

  Store.foydalanuvchiKuzatuv(async f => {
    if (!f) return;
    foyda = f;
    await royxatniYukla();

    /* URL'da ?cid=... boʻlsa oʻshani ochamiz; yoki ?bilan=UID va ?mahsulot=ID → yangi chat */
    const p = new URLSearchParams(location.search);
    if (p.get("cid")) tanla(p.get("cid"));
    else if (p.get("bilan")) {
      const cid = await Store.chatBoshla(
        p.get("bilan"), foyda.uid, p.get("mahsulot") || "", p.get("nomi") || "");
      await royxatniYukla();
      tanla(cid);
    }
  });

  async function royxatniYukla() {
    chatlar = await Store.chatlarim(foyda.uid);
    if (!chatlar.length) {
      royxatEl.innerHTML = `<div class="chat-empty">
        <div><div style="font-size:1.5rem">✎</div><p style="font-size:.9rem">
        Yozishmalar hozircha yoʻq. Mahsulot sahifasidan sotuvchiga yozing.</p></div></div>`;
      return;
    }
    royxatEl.innerHTML = chatlar.map(c => `
      <div class="chat-list-item ${c.cid === joriyChat ? "is-active" : ""}" data-cid="${c.cid}">
        <div class="cli-name">${UI.xavfsiz(c.boshqaIsmi)}</div>
        <div class="cli-mahsulot">${UI.xavfsiz(c.mahsulotNomi || "—")}</div>
        <div class="cli-oxirgi">
          ${c.oxirgiYozuvchi ? `<b>${UI.xavfsiz(c.oxirgiYozuvchi)}:</b> ` : ""}
          ${UI.xavfsiz(c.oxirgiXabar || "(hali xabar yoʻq)")}
        </div>
      </div>`).join("");
  }

  royxatEl.addEventListener("click", e => {
    const el = e.target.closest("[data-cid]");
    if (el) tanla(el.dataset.cid);
  });

  function tanla(cid) {
    if (uzatuv) uzatuv();                /* eski kuzatuvni uzamiz */
    joriyChat = cid;
    const c = chatlar.find(x => x.cid === cid);

    document.querySelectorAll(".chat-list-item")
      .forEach(el => el.classList.toggle("is-active", el.dataset.cid === cid));

    boshEl.style.display = "flex";
    formaEl.style.display = "flex";
    emptyEl.style.display = "none";
    ismEl.textContent = c?.boshqaIsmi || "Foydalanuvchi";
    mahsulotEl.textContent = c?.mahsulotNomi || "";
    if (c?.mahsulotId) {
      mahsulotLink.href = `mahsulot.html?id=${c.mahsulotId}`;
      mahsulotLink.style.display = "";
    } else mahsulotLink.style.display = "none";

    xabarlarEl.innerHTML = `<div class="muted" style="text-align:center">Yuklanmoqda…</div>`;

    uzatuv = Store.chatKuzat(cid, xabarlar => {
      if (!xabarlar.length) {
        xabarlarEl.innerHTML = `<div class="chat-empty">
          <p>Hali xabar yoʻq. Birinchi boʻlib salomlashing 👋</p></div>`;
        return;
      }
      xabarlarEl.innerHTML = xabarlar.map(x => `
        <div class="msg ${x.yozuvchiUid === foyda.uid ? "me" : "them"}">
          ${UI.xavfsiz(x.matn)}
          <span class="msg-time">${UI.vaqt(x.createdAt)}</span>
        </div>`).join("");
      xabarlarEl.scrollTop = xabarlarEl.scrollHeight;
    });
  }

  formaEl.addEventListener("submit", async e => {
    e.preventDefault();
    const matn = matnEl.value.trim();
    if (!matn || !joriyChat) return;
    matnEl.value = "";
    try {
      await Store.xabarYuborChat(joriyChat, foyda.uid, foyda.displayName || foyda.email, matn);
    } catch (err) {
      UI.tost("Xabar yuborilmadi", "err");
    }
  });

  /* Sahifadan chiqishda kuzatuvni uzamiz */
  window.addEventListener("beforeunload", () => uzatuv && uzatuv());
});
