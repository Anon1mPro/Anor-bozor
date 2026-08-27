import { Store } from "./store.js";
import { UI } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  const forma = document.getElementById("kirish-forma");
  const xato = document.getElementById("xato");

  forma.addEventListener("submit", async e => {
    e.preventDefault();
    xato.textContent = "";
    const email = document.getElementById("email").value.trim();
    const parol = document.getElementById("parol").value;

    const btn = forma.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Kirilmoqda…";

    try {
      await Store.kirish(email, parol);
      UI.tost("Xush kelibsiz!");
      /* Qayerdan kelgan boʻlsa oʻsha yerga qaytaramiz */
      const qaytish = new URLSearchParams(location.search).get("qaytish");
      location.href = qaytish || "index.html";
    } catch (err) {
      const xatolar = {
        "auth/invalid-credential": "Email yoki parol notoʻgʻri",
        "auth/user-not-found":     "Bunday foydalanuvchi topilmadi",
        "auth/wrong-password":     "Parol notoʻgʻri",
        "auth/invalid-email":      "Email formati notoʻgʻri",
        "auth/too-many-requests":  "Juda koʻp urinish. Bir oz kutib qayta urining"
      };
      xato.textContent = xatolar[err.code] || err.message;
      btn.disabled = false;
      btn.textContent = "Kirish";
    }
  });
});
