/* =========================================================
   Victoria Ferrarini — componentes compartilhados (protótipo)
   Header, menu, busca, carrinho (localStorage), cards, footer
   ========================================================= */

/* Sempre abrir a página no topo (F5, voltar/avançar, reabrir o site).
   Exceção: links para uma seção específica (#ancora) continuam indo até ela. */
(() => {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const toTop = () => { if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" }); };
  // se a pessoa já começou a rolar, não puxa de volta para o topo
  let userMoved = false;
  const moved = () => { userMoved = true; };
  ["wheel", "touchmove", "keydown", "mousedown"].forEach(ev => addEventListener(ev, moved, { once: true, passive: true }));
  // com #ancora: vai até a seção (mesmo que ela seja criada depois pelo script da página)
  const toHash = () => {
    let el = null; try { el = location.hash && document.querySelector(decodeURIComponent(location.hash)); } catch (e) {}
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  };
  const toTopIfIdle = () => { if (userMoved) return; location.hash ? toHash() : toTop(); };
  toTop();
  document.addEventListener("DOMContentLoaded", () => setTimeout(toTopIfIdle, 0));
  addEventListener("load", toTopIfIdle);
  // página restaurada do cache do navegador (botão voltar/avançar)
  addEventListener("pageshow", e => { if (e.persisted) toTop(); });
  // alguns navegadores guardam a posição ao sair; zera antes de sair
  addEventListener("pagehide", toTop);
})();

const VF = (() => {
  const SITE = "https://victoriaferrarini.com";
  const FILES = SITE + "/cdn/shop/files/";
  const WA_NUM = "5551980334044";
  const WA = (msg = "Olá! Vim pelo site e gostaria de ajuda.") => `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
  const LOGO = FILES + "Sem_nome_1048_x_682_px_1048_x_482_px_848_x_482_px.png?width=370";
  const img = (path, w = 600) => FILES + path + "?width=" + w;
  const brl = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const inst = v => `ou 6x de ${brl(v / 6)} sem juros`;
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => [...el.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);

  /* ---------- Catalog ---------- */
  const BY = Object.fromEntries(PRODUCTS.map(p => [p.h, p]));
  const COLS = {
    "lancamentos":            { n: "Lançamentos", d: "As novidades que acabaram de chegar. À prova d'água, calor e suor.", b: "ChatGPT_Image_Sep_28_2026_10_12_39_AM.png" },
    "mais-vendidos":          { n: "Mais vendidos", d: "As peças favoritas das nossas clientes — escolhidas por quem já usa.", b: "ChatGPT_Image_Aug_13_2026_08_26_49_PM_Easy-Resize.com.jpg" },
    "em-promocao":            { n: "Em promoção", d: "Peças selecionadas com preços especiais por tempo limitado.", b: "B5B8AA89-69AC-4BE1-818D-99C64E907E12.png" },
    "aneis":                  { n: "Anéis", d: "Solitários, ajustáveis e statement — para usar sozinhos ou em mix.", b: "ChatGPT_Image_Aug_10_2026_02_38_40_PM_Easy-Resize.com.jpg", cat: 1, ic: "anel_com_detalhe_em_zirconia_cristal_luxo_485_1_e3e45c8e803a2d7f6bcb91828b2dcec8.png" },
    "brincos":                { n: "Brincos", d: "Argolas, pontos de luz e ear cuffs para todos os estilos.", b: "IMG-5503.webp", cat: 1, ic: "brinco_argola_bold_c_1_20260701095214_f290639a4403.png" },
    "colares":                { n: "Colares", d: "Correntes, pingentes e camadas que valorizam qualquer decote.", b: "6AD3935B-E717-4939-9BB9-564A1D83101F.jpg", cat: 1, ic: "colar_em_elos_modernos_luxo_497_1_103d4f2b8825ba0e2e7ba625b121b586_871c6534-edf0-473d-87cc-3179fb9f1d8e.png" },
    "pulseiras-e-braceletes": { n: "Pulseiras e Braceletes", d: "Elos, riviera e braceletes para compor o seu mix de pulso.", b: "3C03EFEF-7D48-4FF4-8CF4-F561FFF96E91.png", cat: 1, ic: "pulseira_em_elos_modernos_luxo_499_1_60f5a94c8d11c4d29e3ddf5bc4bed205.png" },
    "joias-pedras-naturais":  { n: "Pedras e Pérolas", d: "Pedras e pérolas de águas naturais. Celebre o extraordinário.", b: "0CB354CB-CC36-426B-A939-C7DBC57B40D1.png", cat: 1, ic: "colar_de_prolas_naturais_valentina_1_20260619074518_3d88f3a2006e_319d4c20-a138-4e35-b159-403b16634127.png" },
    "tornozeleiras":          { n: "Tornozeleiras", d: "O toque final para os looks de verão.", b: "405D5E1B-397F-46CB-9980-E0AB7F39130E.png", cat: 1, ic: "405D5E1B-397F-46CB-9980-E0AB7F39130E.png" },
    "monte-se-mix":           { n: "Monte seu mix", d: "Peças pensadas para combinar entre si. Misture, sobreponha, crie o seu.", b: "DF2ED408-4CDD-4670-937D-A18CC41E7E5F.png" }
  };
  const TYPE2COL = { "Anéis": "aneis", "Brincos": "brincos", "Colares": "colares", "Pulseiras e Braceletes": "pulseiras-e-braceletes", "Tornozeleira": "tornozeleiras" };
  const col = h => (h === "todos" ? PRODUCTS.map(p => p.h) : (COLLECTIONS[h] || [])).map(x => BY[x]).filter(Boolean);
  const isNew = p => (COLLECTIONS.lancamentos || []).slice(0, 16).includes(p.h);
  const off = p => p.o ? Math.round((1 - p.p / p.o) * 100) : 0;
  const url = {
    p: h => `produto.html?p=${encodeURIComponent(h)}`,
    c: h => `colecao.html?c=${encodeURIComponent(h)}`
  };

  /* ---------- Icons ---------- */
  const I = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    bagPlus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M12 12v5M9.5 14.5h5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    left: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg>',
    right: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>',
    chev: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 9l6 6 6-6"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    drop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2.5S5 10 5 14.5a7 7 0 0 0 14 0C19 10 12 2.5 12 2.5z"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
    card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 19C5 10 11 4 20 4c0 9-6 15-15 15z"/><path d="M5 19l8-8"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 12h18M12 8v13M12 8S10 3 7.5 4.5 9 8 12 8zm0 0s2-5 4.5-3.5S15 8 12 8z"/></svg>',
    coin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4h16v12H5.2L4 17.2z"/><path d="M8 9h8M8 12h5"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    tt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.3 2.2 1.6 3.6 3.9 3.8v3c-1.4.1-2.7-.3-3.9-1v6.6c0 3.6-2.8 5.6-5.6 5.6-3 0-5.4-2.3-5.4-5.4 0-3.5 3.2-5.9 6.6-5.2v3.2c-1.6-.5-3.4.4-3.4 2.1 0 1.2 1 2.2 2.2 2.2 1.4 0 2.4-.9 2.4-2.6V3z"/></svg>'
  };

  /* ---------- Benefits (reused) ---------- */
  const BENEFITS = [
    [I.drop, "100% à prova d'água", "Pode molhar: mar, piscina e academia"],
    [I.shield, "Garantia vitalícia", "Contra escurecimento e oxidação"],
    [I.leaf, "Hipoalergênicas", "Aço 316L, livre de níquel e chumbo"],
    [I.truck, "Frete grátis", "Para todo o Brasil acima de R$ 199"]
  ];
  const benefitsHTML = (light) => `<section class="benefits${light ? " light" : ""}"><div class="wrap">${BENEFITS.map(b => `<div class="benefit"><div class="ic">${b[0]}</div><div><b>${b[1]}</b><span>${b[2]}</span></div></div>`).join("")}</div></section>`;

  /* ---------- Cart ---------- */
  const KEY = "vf_cart_v1";
  const FREE_SHIP = 199;
  const TIERS = [[30, 50], [20, 40], [15, 30]];
  let cart = JSON.parse(localStorage.getItem(KEY) || "[]").filter(l => BY[l.h]);
  const save = () => { localStorage.setItem(KEY, JSON.stringify(cart)); renderCart(); document.dispatchEvent(new CustomEvent("cart:change")); };
  const lineKey = (h, v) => h + "::" + (v || "");
  const linePrice = l => { const p = BY[l.h]; if (l.v && p.v) { const x = p.v.find(v => v[0] === l.v); if (x) return x[1]; } return p.p; };
  function add(h, v = "", q = 1) {
    const k = lineKey(h, v), ex = cart.find(l => lineKey(l.h, l.v) === k);
    ex ? ex.q += q : cart.push({ h, v, q });
    save(); bump();
  }
  const setQty = (i, q) => { if (q <= 0) cart.splice(i, 1); else cart[i].q = q; save(); };
  function totals() {
    const count = cart.reduce((s, l) => s + l.q, 0);
    const sub = cart.reduce((s, l) => s + l.q * linePrice(l), 0);
    const tier = (TIERS.find(t => count >= t[0]) || [0, 0])[1];
    const disc = sub * tier / 100;
    const total = sub - disc;
    const next = [...TIERS].reverse().find(t => count < t[0]);
    return { count, sub, tier, disc, total, next, ship: total >= FREE_SHIP || count === 0 ? 0 : null, cashback: total * .10 };
  }
  function meters(t) {
    const shipPct = Math.min(t.total / FREE_SHIP * 100, 100);
    const ship = t.total >= FREE_SHIP
      ? `<p class="ok">✓ Você ganhou frete grátis!</p>`
      : `<p>Faltam <b>${brl(FREE_SHIP - t.total)}</b> para o <b>frete grátis</b></p>`;
    const wh = t.next
      ? `<p>${t.tier ? `<span class="ok">${t.tier}% OFF atacado aplicado.</span> ` : ""}Faltam <b>${t.next[0] - t.count} peça${t.next[0] - t.count > 1 ? "s" : ""}</b> para <b>${t.next[1]}% OFF</b> no atacado</p>`
      : `<p class="ok">✦ Desconto máximo de atacado (50% OFF) aplicado!</p>`;
    const mk = [15, 20, 30].map(v => `<i class="mk${t.count >= v ? " on" : ""}" style="left:${v / 30 * 100}%"></i>`).join("");
    return `<div class="meter">${ship}<div class="bar"><div class="fill" style="width:${shipPct}%"></div></div></div>
      <div class="meter">${wh}<div class="bar"><div class="fill" style="width:${Math.min(t.count / 30 * 100, 100)}%"></div>${mk}</div>
      <div class="mk-labels"><span style="left:50%">15 · 30%</span><span style="left:66.6%">20 · 40%</span><span style="left:93%">30 · 50%</span></div></div>`;
  }
  const lineHTML = (l, i) => {
    const p = BY[l.h];
    return `<div class="line">
      <a class="ph" href="${url.p(p.h)}"><img src="${img(p.i[0], 200)}" alt=""></a>
      <div><h4><a href="${url.p(p.h)}">${p.t}</a></h4>${l.v ? `<div class="var">${p.on || "Opção"}: ${l.v}</div>` : ""}
        <div class="qty"><button data-q="${i}" data-d="-1" aria-label="Diminuir">−</button><span>${l.q}</span><button data-q="${i}" data-d="1" aria-label="Aumentar">+</button></div></div>
      <div><div class="pr">${brl(linePrice(l) * l.q)}</div><button class="rm" data-rm="${i}">Remover</button></div>
    </div>`;
  };
  function renderCart() {
    const t = totals();
    qsa(".cart-count").forEach(c => { c.textContent = t.count; c.classList.toggle("on", t.count > 0); });
    const body = qs("#cartBody"), foot = qs("#cartFoot");
    if (!body) return;
    qs("#cartTitle").innerHTML = `Sacola <span class="muted" style="font-family:var(--sans);font-size:15px">(${t.count})</span>`;
    if (!t.count) {
      body.innerHTML = `<div class="empty">${I.bag}<p style="font-size:17px;color:var(--ink);font-weight:600;margin-bottom:6px">Sua sacola está vazia</p><p>Que tal começar pelos mais vendidos?</p><a class="btn btn-dark" style="margin-top:22px" href="${url.c("mais-vendidos")}">Ver mais vendidos</a></div>`;
      foot.innerHTML = ""; return;
    }
    body.innerHTML = meters(t) + cart.map(lineHTML).join("");
    foot.innerHTML = `
      <div class="sumrow"><span>Subtotal</span><span>${brl(t.sub)}</span></div>
      ${t.tier ? `<div class="sumrow"><span>Desconto atacado (${t.tier}%)</span><span class="disc">− ${brl(t.disc)}</span></div>` : ""}
      <div class="sumrow"><span>Frete</span><span>${t.ship === 0 ? '<span class="disc">Grátis</span>' : "Calculado no checkout"}</span></div>
      <div class="sumrow total"><span>Total</span><span>${brl(t.total)}</span></div>
      <p class="inst" style="text-align:right;margin-bottom:14px">${inst(t.total)} · ganhe ${brl(t.cashback)} de cashback</p>
      <a class="btn btn-dark btn-block" href="carrinho.html">Finalizar compra</a>
      <button class="btn btn-block" style="padding:12px;font-size:14px;color:var(--ink-2)" data-close>Continuar comprando</button>`;
  }
  let bumpT;
  function bump() { qsa(".cart-count").forEach(c => { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); }); }

  /* ---------- Toast ---------- */
  let toastT;
  function toast(html) {
    const t = qs("#toast"); t.innerHTML = html; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2800);
  }

  /* ---------- Product card ---------- */
  function cardHTML(p) {
    const d = off(p), out = !p.a;
    const badges = [out ? '<span class="badge out">Esgotado</span>' : "", !out && d ? `<span class="badge">-${d}%</span>` : "", !out && isNew(p) ? '<span class="badge new">Novo</span>' : ""].join("");
    const varies = p.v && new Set(p.v.map(v => v[1])).size > 1;
    return `<article class="card${out ? " soldout" : ""}" data-card="${p.h}">
      <a class="ph" href="${url.p(p.h)}">
        <img loading="lazy" src="${img(p.i[0], 500)}" alt="${p.t}">
        ${p.i[1] ? `<img class="alt" loading="lazy" src="${img(p.i[1], 500)}" alt="">` : ""}
        <span class="badges">${badges}</span>
      </a>
      <h4><a href="${url.p(p.h)}">${p.t}</a></h4>
      ${out ? '<div class="price"><span class="muted">Indisponível</span></div>' : `<div class="price">${p.o ? `<span class="old">${brl(p.o)}</span>` : ""}<span class="now">${varies ? "a partir de " : ""}${brl(p.p)}</span></div><div class="inst">${inst(p.p)}</div>
      <div class="qa">${qaHTML(p)}</div>`}
    </article>`;
  }
  function qaHTML(p) {
    if (!p.v) return `<button class="qa-add" data-add="${p.h}">${I.bagPlus} Adicionar à sacola</button>`;
    const on = (p.on || "Opção").toLowerCase();
    return `<button class="qa-add" data-fab="${p.h}" aria-haspopup="dialog" aria-expanded="false">${I.bagPlus} <span><span class="lg">Escolher </span>${on}</span> <span class="chev">${I.chev}</span></button>`;
  }
  const sizePickHTML = p => `<div class="tip-h"><span>Escolha o ${(p.on || "tamanho").toLowerCase()}</span><a href="${url.p(p.h)}">Ver detalhes</a></div>
    <div class="qa-opts">${p.v.map((v, i) => `<button style="--i:${i}" data-qv="${v[0]}" data-add="${p.h}" ${v[2] ? "" : "disabled"} aria-label="${p.on} ${v[0]}${v[2] ? "" : " (esgotado)"}">${v[0]}</button>`).join("")}</div>
    ${p.v.some(v => !v[2]) ? '<p class="tip-note">Riscado = esgotado</p>' : ""}`;
  function addedFeedback(card, p, label) {
    if (!card) return;
    const qa = card.querySelector(".qa");
    card.classList.add("added");
    qa.innerHTML = `<div class="qa-ok">✓ ${label ? label + " · " : ""}na sacola</div>`;
    clearTimeout(card._t);
    card._t = setTimeout(() => { card.classList.remove("added"); qa.innerHTML = qaHTML(p); }, 1400);
  }

  /* ---------- Tooltip (popover) reutilizável ----------
     Abre flutuando junto ao botão, com seta, sem empurrar o layout.
     Abre para baixo; vira para cima se faltar espaço; não sai da tela. */
  const tip = (() => {
    let el, anchor = null, opts = {};
    function ensure() {
      if (el) return el;
      el = document.createElement("div");
      el.className = "tip"; el.setAttribute("role", "dialog");
      el.innerHTML = '<i class="tip-arrow"></i><div class="tip-body"></div>';
      document.body.appendChild(el);
      return el;
    }
    function place() {
      if (!anchor) return;
      const r = anchor.getBoundingClientRect(), vw = document.documentElement.clientWidth;
      const w = Math.min(Math.max(r.width, opts.minWidth || 240), vw - 16);
      el.style.width = w + "px";
      const h = el.offsetHeight, gap = 10;
      const below = r.bottom + gap + h <= innerHeight - 8 || r.top < h + gap + 90;
      let left = r.left + r.width / 2 - w / 2;
      left = Math.max(8, Math.min(left, vw - w - 8));
      el.style.left = left + scrollX + "px";
      el.style.top = (below ? r.bottom + gap : r.top - gap - h) + scrollY + "px";
      el.classList.toggle("up", !below);
      const ax = Math.round(Math.max(18, Math.min(r.left + r.width / 2 - left, w - 18)));
      el.style.setProperty("--ax", ax + "px");
      // a animação "nasce" da ponta da seta
      el.style.transformOrigin = `${ax}px ${below ? "0" : "100%"}`;
    }
    let hideT;
    function open(a, html, o = {}) {
      const switching = !!anchor;
      close(true, switching); ensure(); anchor = a; opts = o;
      clearTimeout(hideT);
      el.querySelector(".tip-body").innerHTML = html;
      a.setAttribute("aria-expanded", "true"); a.classList.add("tip-on");
      el.classList.remove("show", "leaving"); el.style.visibility = "hidden"; el.style.display = "block";
      place(); el.style.visibility = "";
      void el.offsetWidth; // força o estado inicial antes de animar
      el.classList.add("show");
    }
    function close(silent, instant) {
      if (!anchor) return;
      anchor.setAttribute("aria-expanded", "false"); anchor.classList.remove("tip-on");
      const o = opts; anchor = null; opts = {};
      el.classList.remove("show");
      if (instant) { el.style.display = "none"; }
      else {
        el.classList.add("leaving");
        clearTimeout(hideT);
        hideT = setTimeout(() => { if (!anchor) { el.style.display = "none"; el.classList.remove("leaving"); } }, 160);
      }
      if (!silent && o.onClose) o.onClose();
    }
    addEventListener("resize", () => anchor && place());
    addEventListener("scroll", () => anchor && place(), { passive: true });
    document.addEventListener("scroll", e => { if (anchor && e.target !== document && e.target.contains?.(anchor)) close(); }, true);
    return { open, close, get anchor() { return anchor; }, get ctx() { return opts; }, contains: n => el && el.contains(n) };
  })();
  function railHTML(id, list) {
    return `<div class="rail" id="${id}">${list.map(cardHTML).join("")}</div>`;
  }
  function bindRail(id) {
    const r = qs("#" + id); if (!r) return;
    qsa(`[data-rail="${id}"]`).forEach(b => b.addEventListener("click", () => r.scrollBy({ left: (b.dataset.dir === "1" ? 1 : -1) * r.clientWidth * .8, behavior: "smooth" })));
  }

  /* ---------- Layout: header / footer ---------- */
  const PROMOS = [
    "<b>LEVE 1, GANHE 1</b> · Leve 2 ganhe 2, leve 3 ganhe 3",
    "<b>Frete grátis</b> para todo o Brasil em pedidos a partir de R$ 199",
    "Parcele em até <b>6x sem juros</b> · <b>10% de cashback</b> na próxima compra",
    "Revenda? <a href='atacado.html' style='text-decoration:underline'><b>Compre no atacado com até 50% OFF</b></a>"
  ];
  const catCols = Object.entries(COLS).filter(([, c]) => c.cat);
  function header(active) {
    const a = k => active === k ? ' class="active"' : "";
    return `
    <div class="topbar intro" role="region" aria-label="Promoções" aria-live="polite">
      <button class="tb-nav prev" data-tb="-1" aria-label="Mensagem anterior">${I.left}</button>
      <div class="topbar-track">${PROMOS.map((p, i) => `<div class="topbar-msg${i ? "" : " on"}">${p}</div>`).join("")}</div>
      <button class="tb-nav next" data-tb="1" aria-label="Próxima mensagem">${I.right}</button>
      <i class="topbar-bar"></i>
    </div>
    <header class="site-header">
      <div class="wrap nav">
        <button class="icon-btn burger" data-open="menuDrawer" aria-label="Menu">${I.menu}</button>
        <a href="index.html" class="logo"><img src="${LOGO}" alt="Victoria Ferrarini Joias"></a>
        <nav class="menu">
          <div class="has-mega"><a href="colecoes.html"${a("colecoes")}>Coleções ${I.chev}</a>
            <div class="mega"><div class="wrap mega-in">
              ${catCols.map(([h, c]) => `<a class="mcat" href="${url.c(h)}"><div class="ph"><img loading="lazy" src="${img(c.ic, 300)}" alt=""></div>${c.n}</a>`).join("")}
              <a class="mpromo" href="${url.c("monte-se-mix")}"><img loading="lazy" src="${img(COLS["monte-se-mix"].b, 500)}" alt=""><span>Monte seu mix →</span></a>
            </div></div>
          </div>
          <a href="${url.c("lancamentos")}"${a("lancamentos")}>Lançamentos</a>
          <a href="${url.c("mais-vendidos")}"${a("mais-vendidos")}>Mais vendidos</a>
          <a href="${url.c("em-promocao")}"${a("em-promocao")}>Promoções</a>
          <a href="garantia.html"${a("garantia")}>Garantia</a>
          <a href="atacado.html" class="pill-link${active === "atacado" ? " active" : ""}">Atacado</a>
        </nav>
        <div class="icons">
          <button class="icon-btn" data-open="search" aria-label="Buscar">${I.search}</button>
          <a class="icon-btn hide-sm" href="conta.html" aria-label="Minha conta">${I.user}</a>
          <button class="icon-btn" data-open="cartDrawer" aria-label="Sacola">${I.bag}<span class="cart-count">0</span></button>
        </div>
      </div>
    </header>
    <div class="search" id="search"><div class="search-box"><div class="wrap">
      <div class="search-input">${I.search}<input id="searchInput" type="search" placeholder="O que você procura? Ex.: argola, pérola, colar…" autocomplete="off"><button class="icon-btn" data-close aria-label="Fechar">${I.close}</button></div>
      <div class="search-tags">${["Argola", "Ponto de luz", "Pérolas", "Elos", "Esmeralda", "Coração", "Ajustável", "Bracelete"].map(t => `<button data-term="${t}">${t}</button>`).join("")}</div>
      <div id="searchRes" class="search-res"></div>
    </div></div></div>
    <div class="overlay" id="overlay"></div>
    <aside class="drawer" id="cartDrawer" aria-label="Sacola">
      <div class="drawer-head"><h3 id="cartTitle">Sacola</h3><button class="icon-btn" data-close aria-label="Fechar">${I.close}</button></div>
      <div class="drawer-body" id="cartBody"></div><div class="drawer-foot" id="cartFoot"></div>
    </aside>
    <aside class="drawer left" id="menuDrawer" aria-label="Menu">
      <div class="drawer-head"><img src="${LOGO}" alt="" style="height:44px;width:170px;object-fit:cover"><button class="icon-btn" data-close aria-label="Fechar">${I.close}</button></div>
      <div class="drawer-body mnav">
        <a href="index.html">Início</a>
        <a href="colecoes.html">Todas as coleções ${I.right}</a>
        <div class="sub">${catCols.map(([h, c]) => `<a href="${url.c(h)}">${c.n}</a>`).join("")}</div>
        <a href="${url.c("lancamentos")}">Lançamentos</a>
        <a href="${url.c("mais-vendidos")}">Mais vendidos</a>
        <a href="${url.c("em-promocao")}">Promoções</a>
        <a href="${url.c("monte-se-mix")}">Monte seu mix</a>
        <a href="atacado.html" class="hl">Compre no atacado · até 50% OFF</a>
        <a href="garantia.html">Garantia vitalícia</a>
        <a href="quem-somos.html">Quem somos</a>
        <a href="faq.html">Dúvidas frequentes</a>
        <a href="contato.html">Fale conosco</a>
        <a href="conta.html">Minha conta</a>
      </div>
      <div class="drawer-foot"><a class="btn btn-wa btn-block" href="${WA()}" target="_blank" rel="noopener">${I.wa} Atendimento no WhatsApp</a></div>
    </aside>`;
  }
  function footer() {
    return `
    <footer class="site-footer"><div class="wrap">
      <div class="foot">
        <div><img class="flogo" src="${LOGO}" alt="Victoria Ferrarini">
          <p>Joias em aço inoxidável 316L com banho de ouro PVD. À prova d'água, hipoalergênicas e com garantia vitalícia.</p>
          <div class="socials"><a href="https://www.instagram.com/victoriaferrarinijoias/" target="_blank" rel="noopener" aria-label="Instagram">${I.ig}</a><a href="${WA()}" target="_blank" aria-label="WhatsApp">${I.wa}</a></div>
        </div>
        <div><h5>Comprar</h5>${catCols.map(([h, c]) => `<a href="${url.c(h)}">${c.n}</a>`).join("")}</div>
        <div><h5>Destaques</h5><a href="${url.c("lancamentos")}">Lançamentos</a><a href="${url.c("mais-vendidos")}">Mais vendidos</a><a href="${url.c("em-promocao")}">Promoções</a><a href="${url.c("monte-se-mix")}">Monte seu mix</a><a href="atacado.html">Atacado</a></div>
        <div><h5>Ajuda</h5><a href="faq.html">Dúvidas frequentes</a><a href="garantia.html">Garantia vitalícia</a><a href="politicas.html#trocas">Trocas e devoluções</a><a href="politicas.html#envio">Política de envio</a><a href="politicas.html#privacidade">Privacidade</a></div>
        <div><h5>Atendimento</h5><a href="${WA()}" target="_blank">WhatsApp (51) 98033-4044</a><a href="mailto:suporte@victoriaferrarini.com">suporte@victoriaferrarini.com</a><p style="margin-top:8px">Seg a sex, 8h às 18h<br>Sábados, 10h às 18h</p><a href="contato.html" style="color:var(--gold-soft);font-weight:600;margin-top:6px">Fale conosco →</a>
          <div class="pay">${["Pix", "Visa", "Master", "Elo", "Amex", "Boleto"].map(x => `<span>${x}</span>`).join("")}</div></div>
      </div>
      <div class="copy"><span>© Victoria Ferrarini Joias · CNPJ 57.488.863/0001-77 · Rua Felix da Cunha, 836, sala 202 · Moinhos de Vento · Porto Alegre/RS</span><span>Proposta de layout</span></div>
    </div></footer>
    <a class="wa-float" href="${WA()}" target="_blank" rel="noopener" aria-label="WhatsApp">${I.wa}</a>
    <div class="toast" id="toast"></div>
    <div class="proto-tag">Protótipo de layout · Victoria Ferrarini</div>`;
  }

  /* ---------- Overlays ---------- */
  let openEl = null;
  function open(id) {
    close(); openEl = qs("#" + id); if (!openEl) return;
    openEl.classList.add("open"); document.body.classList.add("lock");
    if (id !== "search") qs("#overlay").classList.add("open");
    if (id === "search") setTimeout(() => qs("#searchInput").focus(), 50);
  }
  function close() {
    if (openEl) openEl.classList.remove("open");
    qs("#overlay")?.classList.remove("open"); document.body.classList.remove("lock"); openEl = null;
  }
  const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  function search(term) {
    const r = qs("#searchRes"); const t = norm(term.trim());
    if (t.length < 2) { r.innerHTML = ""; return; }
    const res = PRODUCTS.filter(p => norm(p.t + " " + p.c).includes(t)).slice(0, 12);
    r.innerHTML = res.length ? res.map(p => `<a href="${url.p(p.h)}"><div class="ph"><img src="${img(p.i[0], 300)}" alt=""></div>${p.t}<br><b>${brl(p.p)}</b></a>`).join("")
      : `<p class="muted" style="grid-column:1/-1">Nenhum resultado para “${term}”. Tente “argola” ou “colar”.</p>`;
  }

  /* ---------- Init ---------- */
  function init() {
    const active = document.body.dataset.page || "";
    const h = qs("#site-header"); if (h) h.outerHTML = header(active);
    const f = qs("#site-footer"); if (f) f.outerHTML = footer();
    qsa("[data-benefits]").forEach(el => el.outerHTML = benefitsHTML(el.dataset.benefits === "light"));

    // Barra de promoções: mensagem sai subindo/desfocando e a próxima entra de baixo.
    // A linha dourada mostra o tempo até a próxima; passar o mouse pausa.
    (() => {
      const msgs = qsa(".topbar-msg"), bar = qs(".topbar-bar"), tb = qs(".topbar");
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      let i = 0, iv;
      const go = n => {
        const prev = msgs[i]; i = (n + msgs.length) % msgs.length;
        if (prev === msgs[i]) return;
        prev.classList.remove("on"); prev.classList.add("out");
        setTimeout(() => prev.classList.remove("out"), 700);
        msgs[i].classList.remove("out"); msgs[i].classList.add("on");
        bar.classList.remove("run"); void bar.offsetWidth; bar.classList.add("run");
      };
      qsa("[data-tb]").forEach(b => b.addEventListener("click", () => { go(i + +b.dataset.tb); if (reduce) { clearInterval(iv); iv = setInterval(() => go(i + 1), 5000); } }));
      if (reduce) { iv = setInterval(() => !tb.matches(":hover") && go(i + 1), 5000); return; }
      bar.addEventListener("animationend", () => go(i + 1));
      // espera a barra abrir e a 1ª mensagem aparecer antes de começar a contar
      tb.classList.add("intro");
      setTimeout(() => bar.classList.add("run"), 1100);
      setTimeout(() => tb.classList.remove("intro"), 1500);
    })();

    document.addEventListener("click", e => {
      const o = e.target.closest("[data-open]"); if (o) { e.preventDefault(); open(o.dataset.open); return; }
      if (e.target.closest("[data-close]") || e.target.id === "overlay" || e.target.id === "search") { close(); return; }
      const fab = e.target.closest("[data-fab]");
      if (fab) {
        e.preventDefault();
        if (tip.anchor === fab) { tip.close(); return; }
        const p = BY[fab.dataset.fab];
        tip.open(fab, sizePickHTML(p), { card: fab.closest(".card") }); return;
      }
      const ad = e.target.closest("[data-add]");
      if (ad) {
        e.preventDefault(); const p = BY[ad.dataset.add], v = ad.dataset.qv || "";
        if (p.v && !v) { location.href = url.p(p.h); return; }
        const card = ad.closest(".card") || (tip.contains(ad) && tip.ctx.card);
        if (tip.contains(ad)) tip.close();
        add(p.h, v);
        addedFeedback(card, p, v && `${p.on || "Opção"} ${v}`);
        const t = totals();
        toast(`✓ ${p.t.length > 28 ? p.t.slice(0, 28) + "…" : p.t} na sacola · <a href="#" data-open="cartDrawer">ver sacola (${t.count})</a>`);
        return;
      }
      if (tip.anchor && !tip.contains(e.target)) tip.close();
      const q = e.target.closest("[data-q]"); if (q) { const i = +q.dataset.q; setQty(i, cart[i].q + +q.dataset.d); return; }
      const rm = e.target.closest("[data-rm]"); if (rm) { setQty(+rm.dataset.rm, 0); return; }
      const term = e.target.closest("[data-term]"); if (term) { qs("#searchInput").value = term.dataset.term; search(term.dataset.term); }
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") { if (tip.anchor) { const a = tip.anchor; tip.close(); a.focus(); } else close(); } });
    qs("#searchInput").addEventListener("input", e => search(e.target.value));
    renderCart();
  }
  document.addEventListener("DOMContentLoaded", init);

  /* ---------- Movimento (reutilizável) ----------
     reveal(alvos, { type, stagger, delay })  → aparece ao entrar na tela
     countUp(el)                              → número sobe de 0 até o valor
     parallax(alvos, força)                   → foto se move mais devagar que a página
     Respeita "reduzir movimento" e nunca deixa conteúdo escondido. */
  const motion = (() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) document.documentElement.classList.add("motion");
    let fired = false;
    const io = "IntersectionObserver" in window && !reduce ? new IntersectionObserver(es => {
      fired = true;
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); e.target._onIn?.(); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .12 }) : null;
    const showAll = () => qsa("[data-reveal]:not(.in)").forEach(el => { el.classList.add("in"); el._onIn?.(); });
    // rede de segurança 1: se o navegador não reportar a rolagem, mostra tudo
    setTimeout(() => { if (!fired) showAll(); }, 1600);
    // rede de segurança 2: confere pela posição real na tela, ao rolar e de tempos em tempos
    let chkT = 0;
    const check = () => {
      chkT = 0;
      qsa("[data-reveal]:not(.in)").forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight * .95 && r.bottom > 0) { el.classList.add("in"); el._onIn?.(); io?.unobserve(el); }
      });
    };
    addEventListener("scroll", () => { if (!chkT) chkT = setTimeout(check, 200); }, { passive: true });
    setInterval(check, 1500);
    const list = t => typeof t === "string" ? qsa(t) : t instanceof Element ? [t] : [...t];
    function reveal(t, { type = "up", stagger = 0, delay = 0, onIn } = {}) {
      list(t).forEach((el, i) => {
        el.dataset.reveal = type; el.style.setProperty("--d", delay + i * stagger + "ms");
        if (onIn) el._onIn = onIn.bind(null, el);
        io ? io.observe(el) : (el.classList.add("in"), el._onIn?.());
      });
    }
    function countUp(el, dur = 1200) {
      const m = el.textContent.match(/(\d+)(.*)/); if (!m || reduce) return;
      const to = +m[1], suf = m[2]; const t0 = performance.now();
      el.textContent = "0" + suf;
      const step = now => { const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e) + suf; if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
      setTimeout(() => el.textContent = to + suf, dur + 200); // garante o valor final
    }
    const px = [];
    function parallax(t, strength = 40) {
      if (reduce) return;
      list(t).forEach(el => { el.dataset.parallax = ""; px.push([el, strength]); });
      tick();
    }
    let raf = 0;
    function tick() {
      raf = 0;
      px.forEach(([el, s]) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > innerHeight + 100) return;
        const p = (r.top + r.height / 2 - innerHeight / 2) / (innerHeight / 2 + r.height / 2); // -1..1
        el.style.setProperty("--py", (-p * s).toFixed(1) + "px");
      });
    }
    addEventListener("scroll", () => { if (px.length && !raf) raf = requestAnimationFrame(tick); }, { passive: true });
    addEventListener("resize", () => px.length && tick());
    return { reveal, countUp, parallax, reduce };
  })();

  return { motion, tip, SITE, FILES, WA, img, brl, inst, qs, qsa, params, BY, COLS, TYPE2COL, col, off, isNew, url, I, cardHTML, railHTML, bindRail, benefitsHTML, add, totals, meters, cart: () => cart, setQty, linePrice, lineHTML, toast, open, close };
})();
