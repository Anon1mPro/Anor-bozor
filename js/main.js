import { Store } from "./store.js";
import { UI } from "./ui.js";

/* ==========================================================
   main.js — bosh sahifa: statistika + mahsulotlar lentasi
   ========================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  const lenta = document.getElementById("lenta");
  if (!lenta) return;

  try {
    const ro = await Store.mahsulotlar();

    /* Statistika */
    const narxlar = ro.map(m => Number(m.narx) || 0);
    document.getElementById("st-mahsulot").textContent = ro.length;
    document.getElementById("st-kategoriya").textContent =
      new Set(ro.map(m => m.kategoriya)).size;
    document.getElementById("st-arzon").textContent =
      narxlar.length ? UI.pul(Math.min(...narxlar)) : "—";

    if (!ro.length) {
      lenta.innerHTML = `
        <div class="empty">
          <div class="big">▦</div>
          <p>Bozor hozircha boʻsh.</p>
          <a class="btn btn-primary btn-sm" href="admin.html">Birinchi mahsulotni qoʻshish</a>
        </div>`;
      return;
    }

    /* Lentaga faqat oxirgi 6 ta mahsulot */
    lenta.innerHTML = ro.slice(0, 6).map((m, i) => `
      <article class="tl-item reveal" style="--d:${i * 90}ms">
        <span class="tl-dot"></span>
        <time class="tl-time">${UI.vaqt(m.createdAt)} · ${UI.sana(m.createdAt)}</time>
        <div class="card card-row">
          <a class="card-link card-row" href="mahsulot.html?id=${m.id}">
            <div class="card-media">${UI.media(m)}</div>
            <div class="card-body">
              <span class="tag tag-glaze">${UI.xavfsiz(m.kategoriya || "Boshqa")}</span>
              <h3 class="card-title">${UI.xavfsiz(m.nom)}</h3>
              <p class="muted" style="font-size:.9rem;margin:0">
                ${UI.xavfsiz((m.tavsif || "").slice(0, 110))}${(m.tavsif || "").length > 110 ? "…" : ""}
              </p>
              <div class="card-foot">
                <span class="card-price">${UI.pul(m.narx)}</span>
                <span>Batafsil →</span>
              </div>
            </div>
          </a>
        </div>
      </article>`).join("");

    UI.ochilish(lenta);
  } catch (e) {
    console.error(e);
    lenta.innerHTML = `<div class="empty"><p>Maʼlumotlarni yuklab boʻlmadi. Internetni va Firebase sozlamalarini tekshiring.</p></div>`;
  }
});
