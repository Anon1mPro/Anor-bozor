/* ==========================================================
   admin.js — admin panel: parol Realtime Database dan olinadi
   ========================================================== */

import { Store } from "./store.js";
import { UI } from "./ui.js";
import { KATEGORIYALAR } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const kirish = document.getElementById("kirish");
  const panel = document.getElementById("panel");
  if (!kirish) return;

  if (sessionStorage.getItem("admin_ok") === "ha") ochil();

  document.getElementById("kirish-forma").addEventListener("submit", async e => {
    e.preventDefault();
    const parol = document.getElementById("parol").value;
    const xato = document.getElementById("kirish-xato");
    xato.textContent = "";

    const btn = e.target.querySelector("button");
    btn.disabled = true; btn.textContent = "Tekshirilmoqda…";

    try {
      const togri = await Store.adminParolniTekshir(parol);
      if (togri) {
        sessionStorage.setItem("admin_ok", "ha");
        ochil();
        UI.tost("Xush kelibsiz, admin");
      } else {
        xato.textContent = "Parol notoʻgʻri.";
      }
    } catch (err) {
      xato.textContent = "Parolni olishda xato: " + err.message +
        " — Realtime DB da sozlamalar/admin_parol ni yarating.";
    } finally {
      btn.disabled = false; btn.textContent = "Kirish";
    }
  });

  function ochil() {
    kirish.style.display = "none";
    panel.style.display = "block";
    UI.ochilish(panel);
    yukla();
  }

  document.getElementById("chiqish")?.addEventListener("click", () => {
    sessionStorage.removeItem("admin_ok");
    location.reload();
  });

  /* ---------- Forma (admin ham mahsulot qoʻsha oladi) ---------- */
  const forma = document.getElementById("mahsulot-forma");
  const kategoriya = document.getElementById("f-kategoriya");
  KATEGORIYALAR.forEach(k => kategoriya.add(new Option(k, k)));

  let tahrirId = null;
  let ro = [];

  function formaniTozala() {
    forma.reset();
    tahrirId = null;
    document.getElementById("forma-sarlavha").textContent = "Yangi mahsulot qoʻshish";
    document.getElementById("saqlash-tugma").textContent = "Mahsulotni qoʻshish";
    document.getElementById("bekor").style.display = "none";
  }
  document.getElementById("bekor").addEventListener("click", formaniTozala);

  forma.addEventListener("submit", async e => {
    e.preventDefault();
    const data = {
      nom: document.getElementById("f-nom").value.trim(),
      narx: Number(document.getElementById("f-narx").value),
      kategoriya: kategoriya.value,
      zaxira: Number(document.getElementById("f-zaxira").value) || 0,
      rasm: document.getElementById("f-rasm").value.trim(),
      tavsif: document.getElementById("f-tavsif").value.trim(),
      sotuvchiId: "admin",
      sotuvchiIsmi: "Admin"
    };
    if (!data.nom || !data.narx) { UI.tost("Nom va narx toʻldirilishi kerak", "err"); return; }

    const btn = document.getElementById("saqlash-tugma");
    btn.disabled = true;
    try {
      if (tahrirId) { await Store.yangilash(tahrirId, data); UI.tost("Yangilandi"); }
      else { await Store.qoshish(data); UI.tost("Qoʻshildi"); }
      formaniTozala();
      yukla();
    } catch (err) {
      UI.tost("Saqlab boʻlmadi.", "err");
    } finally { btn.disabled = false; }
  });

  /* ---------- Roʻyxat (butun bozor) ---------- */
  const tana = document.getElementById("jadval-tana");

  async function yukla() {
    tana.innerHTML = `<tr><td colspan="7" class="muted" style="padding:22px">Yuklanmoqda…</td></tr>`;
    try { ro = await Store.mahsulotlar(); }
    catch { tana.innerHTML = `<tr><td colspan="7">Yuklanmadi</td></tr>`; return; }

    document.getElementById("a-soni").textContent = ro.length;
    document.getElementById("a-qiymat").textContent =
      UI.pul(ro.reduce((s, m) => s + (Number(m.narx) || 0) * (Number(m.zaxira) || 0), 0));
    document.getElementById("a-oxirgi").textContent = ro.length ? UI.vaqt(ro[0].createdAt) : "—";

    if (!ro.length) {
      tana.innerHTML = `<tr><td colspan="7" class="muted" style="padding:26px">Mahsulot yoʻq</td></tr>`;
      return;
    }

    tana.innerHTML = ro.map(m => `
      <tr>
        <td>${m.rasm
          ? `<img class="thumb" src="${UI.xavfsiz(m.rasm)}" alt="">`
          : `<div class="thumb" style="display:grid;place-items:center;color:var(--glaze)">${UI.harf(m.nom)}</div>`}</td>
        <td><b>${UI.xavfsiz(m.nom)}</b></td>
        <td>${UI.xavfsiz(m.sotuvchiIsmi || "—")}</td>
        <td><span class="tag">${UI.xavfsiz(m.kategoriya || "Boshqa")}</span></td>
        <td class="mono">${UI.pul(m.narx)}</td>
        <td class="mono muted">${UI.sana(m.createdAt)}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-ghost btn-sm" data-tahrir="${m.id}">Tahrir</button>
            <button class="btn btn-danger btn-sm" data-ochir="${m.id}">Oʻchirish</button>
          </div>
        </td>
      </tr>`).join("");
  }

  tana.addEventListener("click", async e => {
    const t = e.target.closest("[data-tahrir]");
    const o = e.target.closest("[data-ochir]");
    if (t) {
      const m = ro.find(x => x.id === t.dataset.tahrir);
      if (!m) return;
      tahrirId = m.id;
      document.getElementById("f-nom").value = m.nom || "";
      document.getElementById("f-narx").value = m.narx || "";
      document.getElementById("f-zaxira").value = m.zaxira || 0;
      document.getElementById("f-rasm").value = m.rasm || "";
      document.getElementById("f-tavsif").value = m.tavsif || "";
      kategoriya.value = m.kategoriya || KATEGORIYALAR[0];
      document.getElementById("forma-sarlavha").textContent = "Mahsulotni tahrirlash (admin)";
      document.getElementById("saqlash-tugma").textContent = "Saqlash";
      document.getElementById("bekor").style.display = "inline-flex";
      forma.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (o) {
      const m = ro.find(x => x.id === o.dataset.ochir);
      if (!confirm(`"${m?.nom}" oʻchirilsinmi? (admin sifatida)`)) return;
      try { await Store.ochirish(o.dataset.ochir); UI.tost("Oʻchirildi"); yukla(); }
      catch { UI.tost("Oʻchirib boʻlmadi", "err"); }
    }
  });
});
