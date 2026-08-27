import { Store } from "./store.js";
import { UI } from "./ui.js";

/* ==========================================================
   saved.js — saqlangan mahsulotlar sahifasi
   ========================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  const tor = document.getElementById("saqlangan-tor");
  if (!tor) return;

  async function chiz() {
    const idlar = Store.saqlanganlar();
    const hammasi = await Store.mahsulotlar();
    const ro = hammasi.filter(m => idlar.includes(m.id));

    document.getElementById("saqlangan-holat").textContent =
      ro.length ? `${ro.length} ta mahsulot saqlangan` : "Roʻyxat boʻsh";

    if (!ro.length) {
      tor.innerHTML = `
        <div class="empty" style="grid-column:1/-1">
          <div class="big">♡</div>
          <p>Yoqqan mahsulotni ♡ tugmasi bilan shu yerga qoʻshib qoʻyasiz.</p>
          <a class="btn btn-primary btn-sm" href="mahsulotlar.html">Mahsulotlarni koʻrish</a>
        </div>`;
      return;
    }

    tor.innerHTML = ro.map((m, i) => `
      <article class="card reveal" style="--d:${i * 60}ms">
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
            <button class="btn-save is-saved" data-id="${m.id}" title="Olib tashlash">
              <span class="heart">♥</span>
            </button>
          </div>
        </div>
      </article>`).join("");
    UI.ochilish(tor);
  }

  tor.addEventListener("click", async e => {
    const t = e.target.closest(".btn-save");
    if (!t) return;
    e.preventDefault();
    e.stopPropagation();
    await Store.saqlashniOzgartir(t.dataset.id);
    UI.saqlanganSoniYangila();
    UI.tost("Saqlanganlardan olib tashlandi");
    chiz();
  });

  chiz();
});
