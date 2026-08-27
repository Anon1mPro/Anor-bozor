/* ==========================================================
   contact.js — aloqa sahifasi (ES modul)
   ========================================================== */

import { Store } from "./store.js";
import { UI } from "./ui.js";
import { SAYT } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const royxat = document.getElementById("aloqa-royxat");
  if (!royxat) return;

  royxat.innerHTML = `
    <li class="contact-line">☎ <a href="tel:${SAYT.telefon.replace(/\s/g, "")}">${SAYT.telefon}</a></li>
    <li class="contact-line">☎ <a href="tel:${SAYT.telefon2.replace(/\s/g, "")}">${SAYT.telefon2}</a></li>
    <li class="contact-line">✉ <a href="mailto:${SAYT.email}">${SAYT.email}</a></li>
    <li class="contact-line">⌖ <span class="muted">${SAYT.manzil}</span></li>
    <li class="contact-line">◷ <span class="muted">${SAYT.ish_vaqti}</span></li>
    <li style="margin-top:8px">
      <a class="btn btn-ghost btn-sm" href="${SAYT.telegram}" target="_blank" rel="noopener">Telegramda yozish</a>
    </li>`;

  document.getElementById("aloqa-forma").addEventListener("submit", async e => {
    e.preventDefault();
    const xabar = {
      ism: document.getElementById("a-ism").value.trim(),
      aloqa: document.getElementById("a-tel").value.trim(),
      matn: document.getElementById("a-matn").value.trim()
    };

    const tugma = e.target.querySelector("button");
    tugma.disabled = true;
    tugma.textContent = "Yuborilmoqda…";
    try {
      await Store.xabarYubor(xabar);
      e.target.reset();
      UI.tost("Xabar yuborildi. Tez orada bogʻlanamiz.");
    } catch (err) {
      UI.tost("Xabar yuborilmadi. Qayta urinib koʻring.", "err");
    } finally {
      tugma.disabled = false;
      tugma.textContent = "Xabarni yuborish";
    }
  });
});
