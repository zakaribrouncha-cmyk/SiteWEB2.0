const CFG = window.SHOP_CONFIG || {
  whatsappNumber: '33617518970',
  shippingFeeCents: 0,
  currency: 'EUR',
  brand: 'ShopSTE',
  adminPin: '7542',
};

function migrateBrandStorageKeys() {
  const prevBrand = 'ShopTaSap';
  const nextBrand = String(CFG.brand || '');
  if (!nextBrand || nextBrand === prevBrand) return;

  const pairs = [
    [`${prevBrand}:products:v1`, `${nextBrand}:products:v1`],
    [`${prevBrand}:cart:v1`, `${nextBrand}:cart:v1`],
  ];

  for (const [from, to] of pairs) {
    try {
      if (localStorage.getItem(to) == null) {
        const v = localStorage.getItem(from);
        if (v != null) localStorage.setItem(to, v);
      }
    } catch {
      // ignore
    }
  }

  try {
    const from = `${prevBrand}:admin:unlocked:v1`;
    const to = `${nextBrand}:admin:unlocked:v1`;
    if (sessionStorage.getItem(to) == null) {
      const v = sessionStorage.getItem(from);
      if (v != null) sessionStorage.setItem(to, v);
    }
  } catch {
    // ignore
  }
}

function isValidEmail(input) {
  const s = String(input || '').trim();
  if (!s) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

window.isValidEmail = isValidEmail;

async function sendOrderEmailBestEffort(payload) {
  const url = String(CFG.emailOrderEndpoint || '').trim();
  if (!url) return false;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return true;
  } catch {
    return false;
  }
}

migrateBrandStorageKeys();

const els = {
  home: document.getElementById('view-home'),
  shop: document.getElementById('view-shop'),
  new: document.getElementById('view-new'),
  contact: document.getElementById('view-contact'),
  homeGrid: document.getElementById('homeGrid'),
  shopGrid: document.getElementById('shopGrid'),
  newGrid: document.getElementById('newGrid'),
  q: document.getElementById('q'),
  category: document.getElementById('category'),
  sort: document.getElementById('sort'),
  openAdmin: document.getElementById('openAdmin'),
  openCart: document.getElementById('openCart'),
  closeCart: document.getElementById('closeCart'),
  cart: document.getElementById('cart'),
  cartItems: document.getElementById('cartItems'),
  cartCount: document.getElementById('cartCount'),
  cartSubtitle: document.getElementById('cartSubtitle'),
  subtotal: document.getElementById('subtotal'),
  shipping: document.getElementById('shipping'),
  total: document.getElementById('total'),
  checkoutBtn: document.getElementById('checkoutBtn'),
  clearCart: document.getElementById('clearCart'),
  modal: document.getElementById('productModal'),
  productContent: document.getElementById('productContent'),
  onboardModal: document.getElementById('onboardModal'),
  onboardForm: document.getElementById('onboardForm'),
  custFirstName: document.getElementById('custFirstName'),
  custLastName: document.getElementById('custLastName'),
  custPhone: document.getElementById('custPhone'),
  custEmail: document.getElementById('custEmail'),
  adminModal: document.getElementById('adminModal'),
  adminNew: document.getElementById('adminNew'),
  adminExport: document.getElementById('adminExport'),
  adminImport: document.getElementById('adminImport'),
  adminCount: document.getElementById('adminCount'),
  adminProducts: document.getElementById('adminProducts'),
  adminEditing: document.getElementById('adminEditing'),
  adminForm: document.getElementById('adminForm'),
  adminId: document.getElementById('adminId'),
  adminName: document.getElementById('adminName'),
  adminPrice: document.getElementById('adminPrice'),
  adminCategory: document.getElementById('adminCategory'),
  adminImageFile: document.getElementById('adminImageFile'),
  adminImage: document.getElementById('adminImage'),
  adminImagePreview: document.getElementById('adminImagePreview'),
  adminSizes: document.getElementById('adminSizes'),
  adminColors: document.getElementById('adminColors'),
  adminVariantsRow: document.getElementById('adminVariantsRow'),
  adminDesc: document.getElementById('adminDesc'),
  adminFeatured: document.getElementById('adminFeatured'),
  adminNewFlag: document.getElementById('adminNewFlag'),
  adminDelete: document.getElementById('adminDelete'),
  toast: document.getElementById('toast'),
  contactWa: document.getElementById('contactWa'),
};

function isObjectCategory(category) {
  const c = String(category || '').trim().toLowerCase();
  return c === 'objet' || c === 'objets';
}

function updateAdminVariantsVisibility() {
  const isObj = isObjectCategory(els.adminCategory?.value);
  if (els.adminVariantsRow) els.adminVariantsRow.classList.toggle('hidden', isObj);
  if (isObj) {
    if (els.adminSizes) els.adminSizes.value = '';
    if (els.adminColors) els.adminColors.value = '';
  }
}

function moneyEUR(cents) {
  const v = (cents / 100).toFixed(2).replace('.', ',');
  return `${v} €`;
}

function moneyEURDot(cents) {
  return (cents / 100).toFixed(2);
}

function safeText(s) {
  return String(s ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
}

let toastTimer = null;
function toast(msg) {
  if (!els.toast) return;
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => els.toast.classList.remove('show'), 1200);
}

function waLink(message) {
  const digits = String(CFG.whatsappNumber || '').replace(/\D/g, '');
  const text = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${text}`;
}

function paypalMeLink(totalCents) {
  const base = String(CFG.paypalMe || '').trim();
  if (!base) return null;
  const cleaned = base.replace(/\/$/, '');
  return `${cleaned}/${moneyEURDot(totalCents)}`;
}

function customerKey() {
  return `${CFG.brand || 'shop'}:customer:v1`;
}

function loadCustomer() {
  try {
    const raw = localStorage.getItem(customerKey());
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (!v || typeof v !== 'object') return null;
    return {
      firstName: String(v.firstName || '').trim(),
      lastName: String(v.lastName || '').trim(),
      phone: String(v.phone || '').trim(),
      email: String(v.email || '').trim(),
    };
  } catch {
    return null;
  }
}

function saveCustomer(c) {
  localStorage.setItem(customerKey(), JSON.stringify(c));
}

let customer = loadCustomer();

function hasCustomerInfo() {
  return !!(customer?.firstName && customer?.lastName && customer?.phone && customer?.email);
}

function openOnboard() {
  if (!els.onboardModal) return;
  els.onboardModal.setAttribute('aria-hidden', 'false');
  els.custFirstName?.focus?.();
}

function closeOnboard() {
  els.onboardModal?.setAttribute('aria-hidden', 'true');
}

function productsKey() {
  return `${CFG.brand || 'shop'}:products:v1`;
}

function loadProducts() {
  try {
    const raw = localStorage.getItem(productsKey());
    if (!raw) {
      return Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
    }
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  }
}

function saveProducts(next) {
  localStorage.setItem(productsKey(), JSON.stringify(next));
}

function cartKey() {
  return `${CFG.brand || 'shop'}:cart:v1`;
}

function loadCart() {
  try {
    const raw = localStorage.getItem(cartKey());
    if (!raw) return [];
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(cartKey(), JSON.stringify(items));
}

function cartItemKey(it) {
  return `${it.productId}::${it.size}::${it.color}`;
}

let cart = loadCart();

let products = loadProducts();

function getProduct(id) {
  return products.find((p) => p.id === id) || null;
}

function cartCount() {
  return cart.reduce((sum, it) => sum + it.qty, 0);
}

function cartSubtotalCents() {
  return cart.reduce((sum, it) => {
    const p = getProduct(it.productId);
    if (!p) return sum;
    return sum + p.priceCents * it.qty;
  }, 0);
}

function shippingCents(subtotal) {
  if (subtotal <= 0) return 0;
  return Number(CFG.shippingFeeCents || 0);
}

function renderCart() {
  const count = cartCount();
  if (els.cartCount) els.cartCount.textContent = String(count);
  if (els.cartSubtitle) els.cartSubtitle.textContent = `${count} ${count > 1 ? 'articles' : 'article'}`;

  const sub = cartSubtotalCents();
  const ship = shippingCents(sub);
  const tot = sub + ship;

  if (els.subtotal) els.subtotal.textContent = moneyEUR(sub);
  if (els.shipping) els.shipping.textContent = moneyEUR(ship);
  if (els.total) els.total.textContent = moneyEUR(tot);

  if (!els.cartItems) return;
  if (cart.length === 0) {
    els.cartItems.innerHTML = `<div class="muted">Ton panier est vide.</div>`;
    return;
  }

  els.cartItems.innerHTML = cart
    .map((it) => {
      const p = getProduct(it.productId);
      if (!p) return '';
      const line = p.priceCents * it.qty;
      const isObj = isObjectCategory(p.category);
      const meta1 = isObj ? '' : `Taille: ${safeText(it.size)} • Couleur: ${safeText(it.color)}`;
      return `
        <div class="cart-item" data-key="${safeText(cartItemKey(it))}">
          <div class="cart-item-top">
            <div>
              <div class="cart-item-name">${safeText(p.name)}</div>
              ${meta1 ? `<div class="cart-item-meta">${meta1}</div>` : ''}
              <div class="cart-item-meta">${moneyEUR(p.priceCents)} • Ligne: ${moneyEUR(line)}</div>
            </div>
            <button class="icon-btn" type="button" data-remove="true" aria-label="Supprimer">🗑️</button>
          </div>
          <div class="pdp-row">
            <div class="qty" role="group" aria-label="Quantité">
              <button type="button" data-dec="true" aria-label="Diminuer">−</button>
              <span aria-label="Quantité">${it.qty}</span>
              <button type="button" data-inc="true" aria-label="Augmenter">+</button>
            </div>
            <div class="price">${moneyEUR(line)}</div>
          </div>
        </div>
      `;
    })
    .join('');
}

function openCart() {
  els.cart?.setAttribute('aria-hidden', 'false');
}

function closeCart() {
  els.cart?.setAttribute('aria-hidden', 'true');
}

function addToCart(productId, size, color, qty = 1) {
  const p = getProduct(productId);
  if (!p) return;

  const isObj = isObjectCategory(p.category);

  const s = isObj ? 'Unique' : (size || p.sizes?.[0] || 'Unique');
  const c = isObj ? 'Standard' : (color || p.colors?.[0] || 'Standard');

  const item = { productId, size: s, color: c, qty: Math.max(1, qty) };
  const key = cartItemKey(item);

  const idx = cart.findIndex((x) => cartItemKey(x) === key);
  if (idx >= 0) cart[idx].qty += item.qty;
  else cart.push(item);

  saveCart(cart);
  renderCart();
  toast('Ajouté au panier');
}

function setQty(itemKeyStr, nextQty) {
  const idx = cart.findIndex((x) => cartItemKey(x) === itemKeyStr);
  if (idx < 0) return;
  cart[idx].qty = Math.max(1, nextQty);
  saveCart(cart);
  renderCart();
}

function removeItem(itemKeyStr) {
  cart = cart.filter((x) => cartItemKey(x) !== itemKeyStr);
  saveCart(cart);
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart(cart);
  renderCart();
  toast('Panier vidé');
}

function productCard(p) {
  const img = p.images?.[0] || '';
  const badge = p.isNew ? '<span class="badge">Nouveau</span>' : `<span class="badge">${safeText(p.category)}</span>`;
  return `
    <div class="card product" data-open-pdp="${safeText(p.id)}">
      <div class="product-img">
        <img src="${safeText(img)}" alt="${safeText(p.name)}" loading="lazy" />
      </div>
      <div class="product-body">
        <div class="product-title">${safeText(p.name)}</div>
        <div class="product-meta">
          <div class="price">${moneyEUR(p.priceCents)}</div>
          ${badge}
        </div>
        <div class="product-actions">
          <button class="btn small primary" type="button" data-quick-add="${safeText(p.id)}">Ajouter</button>
          <button class="btn small" type="button" data-open="${safeText(p.id)}">Détails</button>
        </div>
      </div>
    </div>
  `;
}

function renderHome() {
  if (!els.homeGrid) return;
  if (products.length === 0) {
    els.homeGrid.innerHTML = `<div class="muted">Aucun produit pour le moment. Clique sur ⚙️ pour ajouter tes articles.</div>`;
    return;
  }
  const best = products.filter((p) => p.featured).slice(0, 6);
  els.homeGrid.innerHTML = best.map(productCard).join('');
}

function uniqueCategories() {
  const set = new Set(products.map((p) => p.category).filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function renderCategoryOptions() {
  if (!els.category) return;
  const cats = uniqueCategories();
  const current = els.category.value;
  const options = ['<option value="">Toutes catégories</option>']
    .concat(cats.map((c) => `<option value="${safeText(c)}">${safeText(c)}</option>`))
    .join('');
  els.category.innerHTML = options;
  if ([...els.category.options].some((o) => o.value === current)) els.category.value = current;
}

function filteredProducts() {
  const q = (els.q?.value || '').trim().toLowerCase();
  const cat = els.category?.value || '';
  const sort = els.sort?.value || 'featured';

  let list = products.slice();
  if (q) {
    list = list.filter((p) => `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q));
  }
  if (cat) list = list.filter((p) => p.category === cat);

  if (sort === 'price-asc') list.sort((a, b) => a.priceCents - b.priceCents);
  else if (sort === 'price-desc') list.sort((a, b) => b.priceCents - a.priceCents);
  else if (sort === 'new') list.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
  else list.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));

  return list;
}

function renderShop() {
  if (!els.shopGrid) return;
  if (products.length === 0) {
    els.shopGrid.innerHTML = `<div class="muted">Aucun produit. Ouvre ⚙️ Admin pour ajouter tes vêtements.</div>`;
    return;
  }
  els.shopGrid.innerHTML = filteredProducts().map(productCard).join('');
}

function renderNew() {
  if (!els.newGrid) return;
  if (products.length === 0) {
    els.newGrid.innerHTML = `<div class="muted">Aucun produit.</div>`;
    return;
  }
  const list = products.filter((p) => p.isNew);
  if (list.length === 0) {
    els.newGrid.innerHTML = `<div class="muted">Aucune nouveauté pour le moment.</div>`;
    return;
  }
  els.newGrid.innerHTML = list.map(productCard).join('');
}

function openModal() {
  els.modal?.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  els.modal?.setAttribute('aria-hidden', 'true');
}

function openAdminModal() {
  els.adminModal?.setAttribute('aria-hidden', 'false');
}

function closeAdminModal() {
  els.adminModal?.setAttribute('aria-hidden', 'true');
}

function adminSessionKey() {
  return `${CFG.brand || 'shop'}:admin:unlocked:v1`;
}

function isAdminUnlocked() {
  return sessionStorage.getItem(adminSessionKey()) === '1';
}

function unlockAdmin() {
  sessionStorage.setItem(adminSessionKey(), '1');
}

function parseCSV(v) {
  return String(v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function genIdFromName(name) {
  const base = String(name || 'produit')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 42);
  return `${base || 'produit'}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizePriceToCents(input) {
  const raw = String(input || '').trim().replace(',', '.');
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

function refreshAll() {
  renderCategoryOptions();
  renderHome();
  renderShop();
  renderNew();
  renderCart();
  renderAdmin();
}

function renderAdmin() {
  if (!els.adminProducts || !els.adminCount) return;
  els.adminCount.textContent = String(products.length);

  if (products.length === 0) {
    els.adminProducts.innerHTML = `<div class="muted">Aucun produit. Clique sur “Nouveau produit”.</div>`;
    return;
  }

  els.adminProducts.innerHTML = products
    .slice()
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .map((p) => {
      const meta = `${safeText(p.category || '')} • ${moneyEUR(p.priceCents || 0)}`;
      return `
        <div class="admin-product" data-admin-id="${safeText(p.id)}" role="button" tabindex="0">
          <div>
            <div class="name">${safeText(p.name)}</div>
            <div class="meta">${meta}</div>
          </div>
          <div class="badge">Éditer</div>
        </div>
      `;
    })
    .join('');
}

function setAdminEditingLabel(label) {
  if (els.adminEditing) els.adminEditing.textContent = label;
}

function fillAdminForm(p) {
  if (!els.adminForm) return;
  els.adminId.value = p?.id || '';
  els.adminName.value = p?.name || '';
  els.adminPrice.value = p ? String(((p.priceCents || 0) / 100).toFixed(2)) : '';
  els.adminCategory.value = p?.category || '';
  els.adminImage.value = (p?.images?.[0] || '') + '';
  if (els.adminImageFile) els.adminImageFile.value = '';
  if (els.adminImagePreview) {
    const src = (p?.images?.[0] || '') + '';
    if (src) {
      els.adminImagePreview.src = src;
      els.adminImagePreview.classList.add('show');
    } else {
      els.adminImagePreview.removeAttribute('src');
      els.adminImagePreview.classList.remove('show');
    }
  }
  els.adminSizes.value = (p?.sizes || []).join(', ');
  els.adminColors.value = (p?.colors || []).join(', ');
  els.adminDesc.value = p?.description || '';
  els.adminFeatured.checked = !!p?.featured;
  els.adminNewFlag.checked = !!p?.isNew;
  updateAdminVariantsVisibility();
  setAdminEditingLabel(p?.id ? 'Édition' : 'Nouveau');
}

function adminSelectProduct(productId) {
  const p = products.find((x) => x.id === productId);
  if (!p) return;
  fillAdminForm(p);
}

function adminNewProduct() {
  fillAdminForm(null);
  updateAdminVariantsVisibility();
  setAdminEditingLabel('Nouveau');
}

function adminSaveProductFromForm() {
  const name = String(els.adminName?.value || '').trim();
  const category = String(els.adminCategory?.value || '').trim();
  const image = String(els.adminImage?.value || '').trim();
  const priceCents = normalizePriceToCents(els.adminPrice?.value);
  if (!name || !category || !image || priceCents === null) {
    toast('Champs invalides');
    return;
  }

  const isObj = isObjectCategory(category);

  const idExisting = String(els.adminId?.value || '').trim();
  const id = idExisting || genIdFromName(name);

  const next = {
    id,
    name,
    priceCents,
    category,
    featured: !!els.adminFeatured?.checked,
    isNew: !!els.adminNewFlag?.checked,
    images: [image],
    sizes: isObj ? undefined : (parseCSV(els.adminSizes?.value) || ['Unique']),
    colors: isObj ? undefined : (parseCSV(els.adminColors?.value) || ['Standard']),
    description: String(els.adminDesc?.value || '').trim(),
  };

  const idx = products.findIndex((p) => p.id === id);
  if (idx >= 0) products[idx] = next;
  else products.push(next);

  saveProducts(products);
  fillAdminForm(next);
  refreshAll();
  toast('Enregistré');
}

function adminDeleteSelected() {
  const id = String(els.adminId?.value || '').trim();
  if (!id) return;
  products = products.filter((p) => p.id !== id);
  saveProducts(products);

  cart = cart.filter((it) => it.productId !== id);
  saveCart(cart);

  adminNewProduct();
  refreshAll();
  toast('Supprimé');
}

function adminExport() {
  const payload = {
    brand: CFG.brand,
    exportedAt: new Date().toISOString(),
    products,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(CFG.brand || 'shop').toLowerCase()}-products.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('Exporté');
}

function adminImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const list = Array.isArray(json?.products) ? json.products : Array.isArray(json) ? json : null;
      if (!list) {
        toast('Fichier invalide');
        return;
      }
      products = list;
      saveProducts(products);
      adminNewProduct();
      refreshAll();
      toast('Importé');
    } catch {
      toast('Import échoué');
    }
  });
  input.click();
}

function renderPdp(productId) {
  const p = getProduct(productId);
  if (!p || !els.productContent) return;

  const img = p.images?.[0] || '';
  const isObj = isObjectCategory(p.category);
  const sizeList = isObj ? [] : (Array.isArray(p.sizes) ? p.sizes : ['Unique']);
  const colorList = isObj ? [] : (Array.isArray(p.colors) ? p.colors : ['Standard']);
  const sizes = sizeList.map((s, i) => `<button class="chip" type="button" data-size="${safeText(s)}" aria-pressed="${i === 0 ? 'true' : 'false'}">${safeText(s)}</button>`).join('');
  const colors = colorList.map((c, i) => `<button class="chip" type="button" data-color="${safeText(c)}" aria-pressed="${i === 0 ? 'true' : 'false'}">${safeText(c)}</button>`).join('');
  const sizeBlock = isObj ? '' : `
        <div class="selector">
          <div class="muted">Taille</div>
          <div class="chips" data-sizes>${sizes}</div>
        </div>
  `;
  const colorBlock = isObj ? '' : `
        <div class="selector">
          <div class="muted">Couleur</div>
          <div class="chips" data-colors>${colors}</div>
        </div>
  `;

  els.productContent.innerHTML = `
    <div class="pdp" data-pdp="${safeText(p.id)}">
      <div class="pdp-img"><img src="${safeText(img)}" alt="${safeText(p.name)}" /></div>
      <div class="pdp-body">
        <div class="pdp-row">
          <h3>${safeText(p.name)}</h3>
          <div class="price">${moneyEUR(p.priceCents)}</div>
        </div>
        <div class="muted">${safeText(p.description || '')}</div>

        ${sizeBlock}
        ${colorBlock}

        <div class="pdp-row">
          <button class="btn primary" type="button" data-add="true">Ajouter au panier</button>
          <button class="btn" type="button" data-add-open="true">Ajouter & ouvrir panier</button>
        </div>

        <div class="small muted">Livraison: ${moneyEUR(shippingCents(1))} (affiché au panier)</div>
      </div>
    </div>
  `;

  openModal();
}

function activeChip(container, attr) {
  const btn = container.querySelector(`.chip[aria-pressed="true"]`);
  if (!btn) return null;
  return btn.getAttribute(attr);
}

function setActiveChip(container, target) {
  const chips = Array.from(container.querySelectorAll('.chip'));
  for (const c of chips) c.setAttribute('aria-pressed', c === target ? 'true' : 'false');
}

function showView(name) {
  const map = { home: els.home, shop: els.shop, new: els.new, contact: els.contact };
  for (const k of Object.keys(map)) {
    const v = map[k];
    if (!v) continue;
    v.hidden = k !== name;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function route() {
  const hash = (location.hash || '#/').toLowerCase();
  if (hash.startsWith('#/boutique')) showView('shop');
  else if (hash.startsWith('#/nouveautes')) showView('new');
  else if (hash.startsWith('#/contact')) showView('contact');
  else showView('home');
}

function checkoutMessage() {
  const sub = cartSubtotalCents();
  const ship = shippingCents(sub);
  const tot = sub + ship;

  const payLink = paypalMeLink(tot);

  const lines = cart
    .map((it) => {
      const p = getProduct(it.productId);
      if (!p) return '';
      const isObj = isObjectCategory(p.category);
      const line = p.priceCents * it.qty;
      return isObj
        ? `- ${p.name} | Qté: ${it.qty} | ${moneyEUR(line)}`
        : `- ${p.name} | Taille: ${it.size} | Couleur: ${it.color} | Qté: ${it.qty} | ${moneyEUR(line)}`;
    })
    .filter(Boolean);

  const custLine = hasCustomerInfo()
    ? `Client: ${customer.firstName} ${customer.lastName} • Tel: ${customer.phone} • Email: ${customer.email}`
    : 'Client: (à renseigner)';

  return [
    `Bonjour ${CFG.brand}, je veux commander :`,
    custLine,
    '',
    ...lines,
    '',
    `Sous-total: ${moneyEUR(sub)}`,
    `Livraison: ${moneyEUR(ship)}`,
    `Total: ${moneyEUR(tot)}`,
    payLink ? `Paiement PayPal (montant déjà prêt): ${payLink}` : 'Paiement PayPal: (lien non configuré)',
    '',
    'Merci !',
  ].join('\n');
}

function normalizeFrenchPhone(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;

  let s = raw.replace(/[\s.\-()]/g, '');

  if (s.startsWith('+33')) s = '0' + s.slice(3);
  if (s.startsWith('33')) s = '0' + s.slice(2);

  if (!/^0\d{9}$/.test(s)) return null;
  return s;
}

function bindEvents() {
  els.openAdmin?.addEventListener('click', () => {
    if (!isAdminUnlocked()) {
      const pin = window.prompt('PIN Admin:');
      if (String(pin || '').trim() !== String(CFG.adminPin || '7542')) {
        toast('PIN incorrect');
        return;
      }
      unlockAdmin();
    }
    openAdminModal();
    renderAdmin();
    if (!els.adminId?.value) adminNewProduct();
  });

  els.openCart?.addEventListener('click', openCart);
  els.closeCart?.addEventListener('click', closeCart);

  els.clearCart?.addEventListener('click', () => clearCart());

  els.checkoutBtn?.addEventListener('click', () => {
    if (cart.length === 0) {
      toast('Panier vide');
      return;
    }

    if (!hasCustomerInfo()) {
      toast('Entre ton nom/prénom/téléphone');
      openOnboard();
      return;
    }

    if (!String(CFG.paypalMe || '').trim()) {
      toast('Ajoute ton lien PayPal.me dans products.js');
    }

    sendOrderEmailBestEffort({
      brand: CFG.brand,
      customer,
      message: checkoutMessage(),
      cart,
      createdAt: new Date().toISOString(),
    }).then((ok) => {
      if (ok) toast('Email envoyé');
    });

    const url = waLink(checkoutMessage());
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  els.onboardForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const firstName = String(els.custFirstName?.value || '').trim();
    const lastName = String(els.custLastName?.value || '').trim();
    const rawPhone = String(els.custPhone?.value || '').trim();
    const normalizedPhone = normalizeFrenchPhone(rawPhone);
    const email = String(els.custEmail?.value || '').trim();
    if (!firstName || !lastName || !rawPhone || !email) {
      toast('Champs invalides');
      return;
    }
    if (!isValidEmail(email)) {
      toast('Email invalide');
      return;
    }
    if (!normalizedPhone) {
      toast('Téléphone invalide: 10 chiffres (ex: 06XXXXXXXX)');
      return;
    }
    customer = { firstName, lastName, phone: normalizedPhone, email };
    saveCustomer(customer);
    closeOnboard();
    toast('OK');
  });

  els.adminCategory?.addEventListener('input', () => updateAdminVariantsVisibility());

  els.cartItems?.addEventListener('click', (e) => {
    const row = e.target?.closest?.('.cart-item');
    if (!row) return;
    const key = row.getAttribute('data-key');
    if (!key) return;

    if (e.target?.closest?.('[data-inc]')) {
      const it = cart.find((x) => cartItemKey(x) === key);
      if (!it) return;
      setQty(key, it.qty + 1);
      return;
    }

    if (e.target?.closest?.('[data-dec]')) {
      const it = cart.find((x) => cartItemKey(x) === key);
      if (!it) return;
      setQty(key, it.qty - 1);
      return;
    }

    if (e.target?.closest?.('[data-remove]')) {
      removeItem(key);
      toast('Supprimé');
    }
  });

  els.q?.addEventListener('input', () => renderShop());
  els.category?.addEventListener('change', () => renderShop());
  els.sort?.addEventListener('change', () => renderShop());

  document.addEventListener('click', (e) => {
    const quick = e.target?.closest?.('[data-quick-add]');
    if (quick) {
      const id = quick.getAttribute('data-quick-add');
      addToCart(id);
      return;
    }

    const open = e.target?.closest?.('[data-open]') || e.target?.closest?.('[data-open-pdp]');
    if (open) {
      const id = open.getAttribute('data-open') || open.getAttribute('data-open-pdp');
      renderPdp(id);
      return;
    }
  });

  els.modal?.addEventListener('click', (e) => {
    if (e.target?.closest?.('[data-close]')) {
      closeModal();
      return;
    }

    const sizeBtn = e.target?.closest?.('[data-size]');
    if (sizeBtn) {
      const container = els.productContent?.querySelector('[data-sizes]');
      if (container) setActiveChip(container, sizeBtn);
      return;
    }

    const colorBtn = e.target?.closest?.('[data-color]');
    if (colorBtn) {
      const container = els.productContent?.querySelector('[data-colors]');
      if (container) setActiveChip(container, colorBtn);
      return;
    }

    const addBtn = e.target?.closest?.('[data-add]');
    const addOpenBtn = e.target?.closest?.('[data-add-open]');
    if (addBtn || addOpenBtn) {
      const pdp = els.productContent?.querySelector('[data-pdp]');
      const productId = pdp?.getAttribute('data-pdp');
      if (!productId) return;

      const sizes = els.productContent?.querySelector('[data-sizes]');
      const colors = els.productContent?.querySelector('[data-colors]');
      const size = sizes ? activeChip(sizes, 'data-size') : null;
      const color = colors ? activeChip(colors, 'data-color') : null;

      addToCart(productId, size, color, 1);
      if (addOpenBtn) openCart();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeAdminModal();
      if (hasCustomerInfo()) closeOnboard();
      closeCart();
    }
  });

  els.adminModal?.addEventListener('click', (e) => {
    if (e.target?.closest?.('[data-admin-close]')) {
      closeAdminModal();
      return;
    }

    const row = e.target?.closest?.('[data-admin-id]');
    if (row) {
      const id = row.getAttribute('data-admin-id');
      if (id) adminSelectProduct(id);
      return;
    }
  });

  els.adminNew?.addEventListener('click', () => adminNewProduct());
  els.adminDelete?.addEventListener('click', () => adminDeleteSelected());
  els.adminExport?.addEventListener('click', () => adminExport());
  els.adminImport?.addEventListener('click', () => adminImport());

  els.adminForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    adminSaveProductFromForm();
  });

  els.adminImageFile?.addEventListener('change', async () => {
    const file = els.adminImageFile.files?.[0];
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      toast('Fichier invalide');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      if (!dataUrl) return;
      if (els.adminImage) els.adminImage.value = dataUrl;
      if (els.adminImagePreview) {
        els.adminImagePreview.src = dataUrl;
        els.adminImagePreview.classList.add('show');
      }
      toast('Image chargée');
    };
    reader.onerror = () => toast('Erreur image');
    reader.readAsDataURL(file);
  });

  window.addEventListener('hashchange', () => route());

  if (els.contactWa) {
    els.contactWa.href = waLink(`Bonjour ${CFG.brand}, j'ai une question.`);
    els.contactWa.target = '_blank';
    els.contactWa.rel = 'noopener noreferrer';
  }
}

function init() {
  renderCategoryOptions();
  renderHome();
  renderShop();
  renderNew();
  renderCart();
  renderAdmin();
  adminNewProduct();
  bindEvents();
  route();

  if (!hasCustomerInfo()) {
    openOnboard();
  }
}

init();
