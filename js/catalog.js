import { Store } from "./store.js";
import { UI } from "./ui.js";
import { KATEGORIYALAR } from "./config.js";

/* ==========================================================
   catalog.js — mahsulotlar sahifasi: qidiruv, filtr, saralash
   ========================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  const tor = document.getElementById("tor");
  if (!tor) return;

  const qidiruv = document.getElementById("qidiruv");
  const kategoriya = document.getElementById("kategoriya");
  const saralash = document.getElementById("saralash");
  const soni = document.getElementById("natija-soni");

  let hammasi = [];

  /* Kategoriya roʻyxatini toʻldirish */
  KATEGORIYALAR.forEach(k => {
    const o = document.createElement("option");
    o.value = k; o.textContent = k;
    kategoriya.appendChild(o);
  });

  function kartochka(m, i) {
    const saqlangan = Store.saqlanganmi(m.id);
    return `
      <article class="card reveal" style="--d:${Math.min(i, 8) * 60}ms">
        <a class="card-media" href="mahsulot.html?id=${m.id}" aria-label="${UI.xavfsiz(m.nom)}">
          ${UI.media(m)}
        </a>
        <div class="card-body">
          <span class="tag tag-glaze">${UI.xavfsiz(m.kategoriya || "Boshqa")}</span>
          <a class="card-title-link" href="mahsulot.html?id=${m.id}">
            <h3 class="card-title">${UI.xavfsiz(m.nom)}</h3>
          </a>
          <span class="card-price">${UI.pul(m.narx)}</span>
          <div class="card-foot">
            <span>${UI.vaqt(m.createdAt)}</span>
            <button class="btn-save ${saqlangan ? "is-saved" : ""}" data-id="${m.id}"
                    title="Saqlab qoʻyish" aria-label="Saqlab qoʻyish">
              <span class="heart">${saqlangan ? "♥" : "♡"}</span>
            </button>
          </div>
        </div>
      </article>`;
  }

  function chiz() {
    const q = (qidiruv.value || "").trim().toLowerCase();
    const k = kategoriya.value;
    let ro = hammasi.filter(m =>
      (!k || m.kategoriya === k) &&
      (!q || (m.nom + " " + (m.tavsif || "")).toLowerCase().includes(q))
    );

    if (saralash.value === "arzon") ro.sort((a, b) => a.narx - b.narx);
    else if (saralash.value === "qimmat") ro.sort((a, b) => b.narx - a.narx);
    else if (saralash.value === "eski") ro.sort((a, b) => a.createdAt - b.createdAt);
    else ro.sort((a, b) => b.createdAt - a.createdAt);

    soni.textContent = `${ro.length} ta mahsulot`;
    tor.innerHTML = ro.length
      ? ro.map(kartochka).join("")
      : `<div class="empty" style="grid-column:1/-1">
           <div class="big">◌</div><p>Bu soʻrov boʻyicha mahsulot topilmadi. Boshqa soʻz bilan qidirib koʻring.</p>
         </div>`;
    UI.ochilish(tor);
  }

  /* Saqlash tugmasi (kartochka ichida — havolani ochmasin) */
  tor.addEventListener("click", async e => {
    const t = e.target.closest(".btn-save");
    if (!t) return;
    e.preventDefault();
    e.stopPropagation();
    const saqlandi = await Store.saqlashniOzgartir(t.dataset.id);
    t.classList.toggle("is-saved", saqlandi);
    t.querySelector(".heart").textContent = saqlandi ? "♥" : "♡";
    UI.saqlanganSoniYangila();
    UI.tost(saqlandi ? "Mahsulot saqlandi" : "Saqlanganlardan olib tashlandi");
  });

  [qidiruv, kategoriya, saralash].forEach(el =>
    el.addEventListener("input", chiz));

  tor.innerHTML = `<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>`;
  hammasi = await Store.mahsulotlar();
  chiz();
});
