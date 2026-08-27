import { Store } from "./store.js";
import { UI } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  const forma = document.getElementById("royxat-forma");
  const xato = document.getElementById("xato");

  forma.addEventListener("submit", async e => {
    e.preventDefault();
    xato.textContent = "";
    const ism     = document.getElementById("ism").value.trim();
    const telefon = document.getElementById("telefon").value.trim();
    const email   = document.getElementById("email").value.trim();
    const parol   = document.getElementById("parol").value;

    if (parol.length < 6) { xato.textContent = "Parol kamida 6 ta belgi boʻlishi kerak"; return; }

    const btn = forma.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Roʻyxatga olinmoqda…";

    try {
      await Store.royxatdan(email, parol, ism, telefon);
      UI.tost("Roʻyxatdan oʻtdingiz!");
      location.href = "index.html";
    } catch (err) {
      const xatolar = {
        "auth/email-already-in-use": "Bu email allaqachon ishlatilgan",
        "auth/invalid-email":        "Email formati notoʻgʻri",
        "auth/weak-password":        "Parol juda oddiy — boshqasini tanlang",
        "auth/operation-not-allowed":"Firebase konsolida Email/Password yoqilmagan"
      };
      xato.textContent = xatolar[err.code] || err.message;
      btn.disabled = false;
      btn.textContent = "Roʻyxatdan oʻtish";
    }
  });
});
