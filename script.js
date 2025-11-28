// URL de la Web App de Apps Script (la que termina en /exec)
const API_URL = 'https://script.google.com/macros/s/AKfycbyTIj2CEsXF-NnEtrWMJ4G3lrdxRNHzYHRT3Z4ZuOlF2VN-EotLVXA06oZpt5xDtAhY/exec';

let allItems = [];

document.addEventListener('DOMContentLoaded', () => {
  const loadingEl = document.getElementById('loading');
  const emptyEl = document.getElementById('empty');
  const listEl = document.getElementById('priceList');
  const searchInput = document.getElementById('searchInput');

  // 1) Dispara la carga mediante JSONP
  loadPricesJSONP();

  // 2) Buscador en vivo
  searchInput.addEventListener('input', () => {
    const term = searchInput.value.trim().toLowerCase();
    if (!allItems.length) return;

    const filtered = allItems.filter(item =>
      item.tipo.toLowerCase().includes(term)
    );
    renderList(filtered, listEl, emptyEl);
  });
});

// --- JSONP ---

function loadPricesJSONP() {
  const loadingEl = document.getElementById('loading');
  const script = document.createElement('script');
  // handlePriceData es el nombre del callback global
  script.src = `${API_URL}?callback=handlePriceData`;
  script.onerror = () => {
    loadingEl.textContent = 'Error cargando los precios.';
  };
  document.body.appendChild(script);
}

// Esta función la llama directamente Apps Script: handlePriceData({ ... })
function handlePriceData(data) {
  const loadingEl = document.getElementById('loading');
  const emptyEl = document.getElementById('empty');
  const listEl = document.getElementById('priceList');

  // 🔴 ANTES: loadingEl.hidden = true;
  if (loadingEl) loadingEl.remove();   // 👈 lo sacamos del DOM

  if (!data || !Array.isArray(data.items) || !data.items.length) {
    emptyEl.hidden = false;
    return;
  }

  allItems = data.items;
  listEl.hidden = false;
  renderList(allItems, listEl, emptyEl);
}
// --- Renderizado de la lista ---

function renderList(items, listEl, emptyEl) {
  listEl.innerHTML = '';

  if (!items.length) {
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;

  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'price-card';

    const left = document.createElement('div');
    left.className = 'price-card-left';

    const title = document.createElement('h2');
    title.className = 'price-type';
    title.textContent = item.tipo;

    const tagline = document.createElement('p');
    tagline.className = 'price-tagline';
    tagline.textContent =
      'Precio orientativo, puede variar según la prenda.';

    left.appendChild(title);
    left.appendChild(tagline);

    if (/DESDE/i.test(item.tipo)) {
      const badge = document.createElement('div');
      badge.className = 'badge';
      badge.innerHTML = `
        <span class="badge-dot"></span>
        <span>Desde este valor</span>
      `;
      left.appendChild(badge);
    }

    const right = document.createElement('div');
    right.className = 'price-card-right';

    const amount = document.createElement('span');
    amount.className = 'price-amount';
    amount.textContent = formatPrice(item.precio);

    const caption = document.createElement('span');
    caption.className = 'price-caption';
    caption.textContent = 'Por arreglo';

    right.appendChild(amount);
    right.appendChild(caption);

    li.appendChild(left);
    li.appendChild(right);

    listEl.appendChild(li);
  });
}

// Formato ARS
function formatPrice(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}
