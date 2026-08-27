/* ==========================================================
   menikilar.js — foydalanuvchining oʻz mahsulotlari
   ========================================================== */

import { Store } from "./store.js";
import { UI } from "./ui.js";
import { KATEGORIYALAR } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const forma = document.getElementById("mahsulot-forma");
  const kategoriya = document.getElementById("f-kategoriya");
  const tana = document.getElementById("jadval-tana");

  KATEGORIYALAR.forEach(k => kategoriya.add(new Option(k, k)));

  let tahrirId = null;
  let ro = [];

  /* Foydalanuvchi tayyor boʻlgunicha kutamiz (auth async) */
  Store.foydalanuvchiKuzatuv(async foyda => {
    if (!foyda) return;                    // ui.js oʻzi kirish sahifasiga yoʻnaltiradi
    await yukla(foyda);
  });

  function formaniTozala() {
    forma.reset();
    document.getElementById("f-zaxira").value = 1;
    tahrirId = null;
    document.getElementById("forma-sarlavha").textContent = "Yangi mahsulot qoʻshish";
    document.getElementById("saqlash-tugma").textContent = "Mahsulotni qoʻshish";
    document.getElementById("bekor").style.display = "none";
  }

  document.getElementById("bekor").addEventListener("click", formaniTozala);

  forma.addEventListener("submit", async e => {
    e.preventDefault();
    const foyda = Store.joriyFoydalanuvchi();
    if (!foyda) { UI.tost("Avval kiring", "err"); return; }

    const data = {
      nom: document.getElementById("f-nom").value.trim(),
      narx: Number(document.getElementById("f-narx").value),
      kategoriya: kategoriya.value,
      zaxira: Number(document.getElementById("f-zaxira").value) || 0,
      rasm: document.getElementById("f-rasm").value.trim(),
      tavsif: document.getElementById("f-tavsif").value.trim(),
      sotuvchiId: foyda.uid,
      sotuvchiIsmi: foyda.displayName || foyda.email
    };
    if (!data.nom || !data.narx) { UI.tost("Nom va narx toʻldirilishi kerak", "err"); return; }

    const btn = document.getElementById("saqlash-tugma");
    btn.disabled = true;
    const eski = btn.textContent;
    btn.textContent = "Saqlanmoqda…";

    try {
      if (tahrirId) {
        await Store.yangilash(tahrirId, data);
        UI.tost("Mahsulot yangilandi");
      } else {
        await Store.qoshish(data);
        UI.tost("Mahsulot qoʻshildi");
      }
      formaniTozala();
      await yukla(foyda);
    } catch (err) {
      console.error(err);
      UI.tost("Saqlab boʻlmadi.", "err");
      btn.textContent = eski;
    } finally {
      btn.disabled = false;
    }
  });

  async function yukla(foyda) {
    tana.innerHTML = `<tr><td colspan="6" class="muted" style="padding:22px">Yuklanmoqda…</td></tr>`;
    ro = await Store.mahsulotlarim(foyda.uid);
    document.getElementById("soni").textContent = `${ro.length} ta mahsulot`;

    if (!ro.length) {
      tana.innerHTML = `<tr><td colspan="6" class="muted" style="padding:26px">
        Hozircha mahsulotingiz yoʻq. Formaga toʻldirib birinchisini qoʻshing.</td></tr>`;
      return;
    }

    tana.innerHTML = ro.map(m => `
      <tr>
        <td>${m.rasm
          ? `<img class="thumb" src="${UI.xavfsiz(m.rasm)}" alt="">`
          : `<div class="thumb" style="display:grid;place-items:center;color:var(--glaze)">${UI.harf(m.nom)}</div>`}</td>
        <td>
          <a href="mahsulot.html?id=${m.id}" style="color:inherit"><b>${UI.xavfsiz(m.nom)}</b></a><br>
          <span class="mono muted" style="font-size:.72rem">${UI.xavfsiz(m.id)}</span>
        </td>
        <td><span class="tag">${UI.xavfsiz(m.kategoriya || "Boshqa")}</span></td>
        <td class="mono">${UI.pul(m.narx)}</td>
        <td class="mono muted">${UI.sana(m.createdAt)}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-ghost btn-sm" data-tahrir="${m.id}">Tahrirlash</button>
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
      document.getElementById("forma-sarlavha").textContent = "Mahsulotni tahrirlash";
      document.getElementById("saqlash-tugma").textContent = "Oʻzgarishlarni saqlash";
      document.getElementById("bekor").style.display = "inline-flex";
      forma.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (o) {
      const m = ro.find(x => x.id === o.dataset.ochir);
      if (!confirm(`"${m?.nom}" oʻchirilsinmi?`)) return;
      try {
        await Store.ochirish(o.dataset.ochir);
        UI.tost("Mahsulot oʻchirildi");
        await yukla(Store.joriyFoydalanuvchi());
      } catch { UI.tost("Oʻchirib boʻlmadi", "err"); }
    }
  });
});
