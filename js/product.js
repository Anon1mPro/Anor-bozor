/* ==========================================================
   product.js — bitta mahsulot: sotib olish + izohlar
   ========================================================== */

import { Store } from "./store.js";
import { UI } from "./ui.js";
import { SAYT } from "./config.js";

document.addEventListener("DOMContentLoaded", async () => {
  const idish = document.getElementById("mahsulot");
  if (!idish) return;

  const id = new URLSearchParams(location.search).get("id");
  const xato = matn => `<div class="empty"><div class="big">◌</div><p>${matn}</p>
    <a class="btn btn-ghost btn-sm" href="mahsulotlar.html">Mahsulotlarga qaytish</a></div>`;

  if (!id) { idish.innerHTML = xato("Mahsulot tanlanmagan."); return; }
  const m = await Store.mahsulot(id);
  if (!m) { idish.innerHTML = xato("Bunday mahsulot topilmadi."); return; }

  document.title = `${m.nom} — ${SAYT.nom}`;
  const saqlangan = Store.saqlanganmi(m.id);

  idish.innerHTML = `
    <div class="product-top">
      <div class="product-media reveal">${UI.media(m)}</div>

      <div class="reveal" style="--d:120ms">
        <span class="tag tag-glaze">${UI.xavfsiz(m.kategoriya || "Boshqa")}</span>
        <h1 style="font-size:clamp(1.6rem,3.4vw,2.4rem);margin:12px 0 10px">${UI.xavfsiz(m.nom)}</h1>
        <div class="price-big">${UI.pul(m.narx)}</div>

        <div class="meta-list">
          <div class="meta-row"><span>Sotuvchi</span><b>${UI.xavfsiz(m.sotuvchiIsmi || "—")}</b></div>
          <div class="meta-row"><span>Bozorga qoʻyilgan</span><b>${UI.sana(m.createdAt)}</b></div>
          <div class="meta-row"><span>Omborda</span><b>${m.zaxira ?? "—"} dona</b></div>
        </div>

        <p class="muted">${UI.xavfsiz(m.tavsif || "Tavsif kiritilmagan.")}</p>

        <div class="hero-actions">
          <button class="btn btn-primary" id="sotib-ol">🛒 Sotib olish</button>
          <button class="btn-save ${saqlangan ? "is-saved" : ""}" id="saqla">
            <span class="heart">${saqlangan ? "♥" : "♡"}</span>
            <span id="saqla-matn">${saqlangan ? "Saqlangan" : "Saqlab qoʻyish"}</span>
          </button>
        </div>

        <p id="sotib-eslatma" class="muted" style="font-size:.82rem;margin-top:14px"></p>
      </div>
    </div>

    <section class="section">
      <div class="section-head reveal">
        <div>
          <p class="eyebrow">Izohlar</p>
          <h2>Xaridorlar nima deydi</h2>
        </div>
        <span class="mono muted" id="izoh-soni"></span>
      </div>

      <div class="panel reveal" style="--d:80ms" id="izoh-panel">
        <div id="izoh-notice"></div>
      </div>

      <div class="timeline reveal" id="izohlar" style="margin-top:26px"></div>
    </section>`;

  UI.ochilish(idish);

  /* ===== Saqlash ===== */
  const saqlaBtn = document.getElementById("saqla");
  saqlaBtn.addEventListener("click", async () => {
    const s = await Store.saqlashniOzgartir(m.id);
    saqlaBtn.classList.toggle("is-saved", s);
    saqlaBtn.querySelector(".heart").textContent = s ? "♥" : "♡";
    document.getElementById("saqla-matn").textContent = s ? "Saqlangan" : "Saqlab qoʻyish";
    UI.saqlanganSoniYangila();
    UI.tost(s ? "Saqlanganlarga qoʻshildi" : "Saqlanganlardan olib tashlandi");
  });

  /* ===== Sotib olish ===== */
  const sotibBtn = document.getElementById("sotib-ol");
  const eslatma = document.getElementById("sotib-eslatma");

  sotibBtn.addEventListener("click", async () => {
    const foyda = Store.joriyFoydalanuvchi();

    if (!foyda) {
      /* Roʻyxatdan oʻtishni soʻraymiz */
      eslatma.innerHTML = `
        <span style="color:var(--saffron)">Sotib olish uchun avval hisobingizga kiring yoki roʻyxatdan oʻting.</span><br>
        <a class="btn btn-primary btn-sm" href="kirish.html?qaytish=${encodeURIComponent(location.pathname + location.search)}" style="margin-top:8px">Kirish</a>
        <a class="btn btn-ghost btn-sm" href="royxat.html" style="margin-top:8px">Roʻyxatdan oʻtish</a>`;
      return;
    }

    if (foyda.uid === m.sotuvchiId) {
      UI.tost("Bu sizning oʻz mahsulotingiz", "err");
      return;
    }

    sotibBtn.disabled = true;
    sotibBtn.textContent = "Ochilmoqda…";
    try {
      const cid = await Store.chatBoshla(m.sotuvchiId, foyda.uid, m.id, m.nom);
      await Store.xabarYuborChat(cid, foyda.uid, foyda.displayName || foyda.email,
        `Assalomu alaykum! "${m.nom}" mahsuloti bilan qiziqyapman.`);
      location.href = `xabarlar.html?cid=${cid}`;
    } catch (err) {
      console.error(err);
      UI.tost("Yozishmani boshlab boʻlmadi", "err");
      sotibBtn.disabled = false;
      sotibBtn.textContent = "🛒 Sotib olish";
    }
  });

  /* ===== Izohlar ===== */
  const izohPanel = document.getElementById("izoh-panel");
  const izohRoyxat = document.getElementById("izohlar");

  function izohFormasiChiz() {
    const foyda = Store.joriyFoydalanuvchi();
    if (!foyda) {
      izohPanel.innerHTML = `<div class="notice">
        <span>💬</span>
        <span>Izoh qoldirish uchun avval hisobingizga kiring.</span>
        <a class="btn btn-primary btn-sm" href="kirish.html?qaytish=${encodeURIComponent(location.pathname + location.search)}">Kirish</a>
      </div>`;
      return;
    }
    izohPanel.innerHTML = `
      <form id="izoh-forma">
        <div class="form-row">
          <div class="field">
            <label>Ismingiz</label>
            <input class="input" id="muallif" value="${UI.xavfsiz(foyda.displayName || foyda.email)}" readonly>
          </div>
          <div class="field">
            <label for="baho">Bahoyingiz</label>
            <select class="select" id="baho">
              <option value="5">★★★★★ Aʼlo</option>
              <option value="4">★★★★☆ Yaxshi</option>
              <option value="3">★★★☆☆ Oʻrtacha</option>
              <option value="2">★★☆☆☆ Yomon emas</option>
              <option value="1">★☆☆☆☆ Yoqmadi</option>
            </select>
          </div>
        </div>
        <div class="field">
          <label for="matn">Izohingiz</label>
          <textarea class="textarea" id="matn" maxlength="600" required
                    placeholder="Mahsulot haqidagi fikringizni yozing"></textarea>
        </div>
        <button class="btn btn-primary" type="submit">Izohni yuborish</button>
      </form>`;

    document.getElementById("izoh-forma").addEventListener("submit", async e => {
      e.preventDefault();
      const matn = document.getElementById("matn").value.trim();
      const baho = document.getElementById("baho").value;
      if (!matn) return;
      const btn = e.target.querySelector("button");
      btn.disabled = true; btn.textContent = "Yuborilmoqda…";
      try {
        await Store.izohQoshish(m.id, foyda.displayName || foyda.email, matn, baho);
        document.getElementById("matn").value = "";
        await izohlarniChiz();
        UI.tost("Izoh joylandi");
      } catch { UI.tost("Yuborib boʻlmadi", "err"); }
      finally { btn.disabled = false; btn.textContent = "Izohni yuborish"; }
    });
  }

  async function izohlarniChiz() {
    const ro = await Store.izohlar(m.id);
    document.getElementById("izoh-soni").textContent = `${ro.length} ta izoh`;
    if (!ro.length) {
      izohRoyxat.classList.remove("timeline");
      izohRoyxat.innerHTML = `<div class="empty"><p>Hali izoh yoʻq. Birinchi boʻlib fikringizni yozing.</p></div>`;
      return;
    }
    izohRoyxat.classList.add("timeline", "is-open");
    izohRoyxat.innerHTML = ro.map(i => `
      <div class="tl-item fade-in">
        <span class="tl-dot"></span>
        <time class="tl-time">${UI.vaqt(i.createdAt)}</time>
        <div class="comment">
          <div class="avatar">${UI.harf(i.muallif)}</div>
          <div>
            <div class="comment-head">
              <span class="comment-author">${UI.xavfsiz(i.muallif)}</span>
              <span class="comment-time">${UI.sana(i.createdAt)}</span>
              ${i.baho ? `<span class="tag">${"★".repeat(Number(i.baho))}</span>` : ""}
            </div>
            <p class="comment-text">${UI.xavfsiz(i.matn)}</p>
          </div>
        </div>
      </div>`).join("");
  }

  /* Auth holati oʻzgarsa izoh formasi qayta chiziladi */
  Store.foydalanuvchiKuzatuv(() => izohFormasiChiz());
  izohFormasiChiz();
  izohlarniChiz();
});
