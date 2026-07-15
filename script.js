// Variáveis Globais de Controle do Carrinho
let cart = [];
let activeProduct = null;
let editingCartIndex = null;

// Atalho para selecionar elementos
const $ = selector => document.querySelector(selector);
const money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const byId = id => CONFIG.products.find(product => product.id === id);
const itemPrice = item => item.base + item.size.extra;

function productCard(product) {
  return `
    <article class="product cursor-pointer" data-product="${product.id}">
      <div class="product-info">
        <h3 class="font-bold text-gray-800">${product.name}</h3>
        <p class="text-sm text-gray-500 mt-1">${product.description || 'Açaí cremoso e refrescante.'}</p>
        <p class="font-bold text-indigo-600 mt-2">A partir de ${money(product.basePrice || 12.9)}</p>
      </div>
      <div class="product-image-container">
        <span class="image-placeholder">Foto do produto</span>
        <button class="add-button" data-product="${product.id}">+</button>
      </div>
    </article>
  `;
}

function renderMenu() {
  const acaiList = $('#acaiList');
  const iceCreamList = $('#iceCreamList');
  const promoList = $('#promoList');

  if (acaiList) acaiList.innerHTML = CONFIG.products.filter(x => x.category === 'acai').map(productCard).join('');
  if (iceCreamList) iceCreamList.innerHTML = CONFIG.products.filter(x => x.category === 'icecream').map(productCard).join('');
  if (promoList) promoList.innerHTML = CONFIG.products.filter(x => x.category === 'promo').map(productCard).join('');
}

function choices(list, group, type) {
  return list.map((item, index) => {
    const name = typeof item === 'string' ? item : item.name;
    return `<label class="choice"><input type="${type}" name="${group}" value="${index}">${name}</label>`;
  }).join('');
}

function openProduct(id, cartIndex = null) {
  editingCartIndex = cartIndex;
  activeProduct = byId(id);
  const product = activeProduct;
  const isIceCream = product.category === 'icecream';

  const buttonText = cartIndex !== null ? 'Salvar alterações' : 'Adicionar ao carrinho';
  
  $('#productContent').innerHTML = `
    <header class="mb-4">
      <div class="modal-title"><h3 class="text-xl font-bold">${product.name}</h3></div>
    </header>
    <section class="custom-section mb-4">
      <h3 class="font-semibold text-gray-700 mb-2">Tamanho</h3>
      <div class="flex flex-col gap-2">${choices(product.sizes, 'size', 'radio')}</div>
    </section>
    ${isIceCream ? `
    <section class="custom-section mb-4">
      <h3 class="font-semibold text-gray-700 mb-2">Sabor</h3>
      <div class="flex flex-col gap-2">${choices(product.flavors, 'flavor', 'radio')}</div>
    </section>` : ''}
    <section class="custom-section mb-4">
      <h3 class="font-semibold text-gray-700 mb-2">Opcionais</h3>
      <div class="flex flex-col gap-2">${choices(product.optionals || [], 'optional', 'checkbox')}</div>
    </section>
    <section class="custom-section mb-4">
      <h3 class="font-semibold text-gray-700 mb-2">Adicionais</h3>
      <div class="flex flex-col gap-2">${choices(product.additionals || [], 'additional', 'checkbox')}</div>
    </section>
    <div class="modal-total mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
      <span class="font-bold text-gray-700">Total do item</span>
      <span id="modalTotalAmount" class="font-extrabold text-lg text-indigo-600">${money(product.basePrice || 12.9)}</span>
    </div>
  `;

  $('#addToCart').textContent = buttonText;
  $('#productModal').showModal();

  if (cartIndex !== null) {
    // Se estiver editando, preenche as opções selecionadas anteriormente
    const item = cart[cartIndex];
    // Marca o tamanho
    const sizeInput = $(`input[name="size"][value="${product.sizes.indexOf(item.size)}"]`);
    if (sizeInput) sizeInput.checked = true;

    // Marca o sabor (se aplicável)
    if (item.flavor) {
      const flavorInput = $(`input[name="flavor"][value="${product.flavors.indexOf(item.flavor)}"]`);
      if (flavorInput) flavorInput.checked = true;
    }

    // Marca os opcionais
    (item.optionals || []).forEach(opt => {
      const optInput = $(`input[name="optional"][value="${product.optionals.indexOf(opt)}"]`);
      if (optInput) optInput.checked = true;
    });

    // Marca os adicionais
    (item.additionals || []).forEach(add => {
      const addInput = $(`input[name="additional"][value="${product.additionals.indexOf(add)}"]`);
      if (addInput) addInput.checked = true;
    });
  }
  
  $('#addToCart').onclick = addConfiguredItem;
}

function addConfiguredItem() {
  const sizeIndex = $('input[name="size"]:checked')?.value;
  if (sizeIndex === undefined) {
    alert('Por favor, selecione um tamanho!');
    return;
  }

  const selectedSize = activeProduct.sizes[sizeIndex];
  const selectedFlavor = activeProduct.flavors ? activeProduct.flavors[$('input[name="flavor"]:checked')?.value] : null;

  const selectedOptionals = Array.from(document.querySelectorAll('input[name="optional"]:checked'))
    .map(el => activeProduct.optionals[el.value]);

  const selectedAdditionals = Array.from(document.querySelectorAll('input[name="additional"]:checked'))
    .map(el => activeProduct.additionals[el.value]);

  const configuredItem = {
    product: activeProduct,
    size: selectedSize,
    flavor: selectedFlavor,
    optionals: selectedOptionals,
    additionals: selectedAdditionals,
    base: activeProduct.basePrice || 12.90,
    quantity: editingCartIndex !== null ? cart[editingCartIndex].quantity : 1
  };

  if (editingCartIndex !== null) {
    // Atualiza o item existente
    cart[editingCartIndex] = configuredItem;
    editingCartIndex = null;
  } else {
    // Adiciona um novo item
    cart.push(configuredItem);
  }

  $('#productModal').close();
  renderCart();
  openDrawer();
}

function cartDescription(item) {
  const parts = [item.size.name];
  if (item.flavor) parts.push(item.flavor);
  if (item.optionals && item.optionals.length) parts.push(...item.optionals);
  if (item.additionals && item.additionals.length) parts.push(...item.additionals.map(a => a.name));
  return parts.filter(Boolean).join(', ');
}

function renderCart() {
  const total = cart.reduce((sum, item) => sum + itemPrice(item) * item.quantity, 0);
  $('#cartCount').textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  $('#cartItems').innerHTML = cart.length ? cart.map((item, i) => `
    <div class="cart-item py-4 border-b border-gray-100 flex flex-col gap-2">
      <div class="flex justify-between items-start gap-2">
        <div class="flex-1 min-w-0">
          <p class="font-bold text-gray-800 truncate">${item.product.name}</p>
          <p class="text-xs text-gray-400 mt-0.5 break-words">${cartDescription(item)}</p>
        </div>
        <p class="font-bold text-gray-800 whitespace-nowrap">${money(itemPrice(item) * item.quantity)}</p>
      </div>
      
      <div class="flex justify-between items-center mt-1">
        <div class="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button class="px-2 py-0.5 text-gray-600 hover:bg-gray-200 rounded font-bold" data-action="decrease" data-index="${i}">-</button>
          <span class="text-sm font-semibold px-1 min-w-[16px] text-center">${item.quantity}</span>
          <button class="px-2 py-0.5 text-gray-600 hover:bg-gray-200 rounded font-bold" data-action="increase" data-index="${i}">+</button>
        </div>

        <div class="flex items-center gap-3">
          <button class="text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1" data-action="edit" data-index="${i}">
            ✏️ Editar
          </button>
          <button class="text-sm text-red-500 hover:text-red-700 font-medium" data-action="remove" data-index="${i}">
            Remover
          </button>
        </div>
      </div>
    </div>
  `).join('') : '<p class="text-center py-8 text-gray-400 text-sm">Sua sacola está vazia</p>';

  const totalEl = $('#cartTotal');
  if (totalEl) totalEl.textContent = money(total);
}
function openDrawer() { $('#cartDrawer').classList.add('open'); }
function closeDrawer() { $('#cartDrawer').classList.remove('open'); }

document.addEventListener('click', event => {
  const button = event.target.closest('[data-product]'); 
  if (button) {
    openProduct(button.dataset.product);
    return;
  }

  const action = event.target.dataset.action;
  const index = Number(event.target.dataset.index);

  if (isNaN(index)) return;

  if (action === 'increase') {
    cart[index].quantity += 1;
    renderCart();
  }

  if (action === 'decrease') {
    if (cart[index].quantity > 1) {
      cart[index].quantity -= 1;
    } else {
      cart.splice(index, 1);
    }
    renderCart();
  }

  if (action === 'edit') {
    const itemToEdit = cart[index];
    openProduct(itemToEdit.product.id, index);
    closeDrawer(); 
  }

  if (action === 'remove') {
    cart.splice(index, 1);
    renderCart();
  }
});

$('#openCart').onclick = openDrawer;
$('.close-drawer').onclick = closeDrawer;
document.querySelectorAll('.modal-close').forEach(button => button.onclick = () => button.closest('dialog').close());
$('#openCheckout').onclick = () => $('#checkoutModal').showModal();

$('#checkoutForm').addEventListener('submit', event => {
  event.preventDefault();
  const address = $('#address').value.trim();
  const complement = $('#complement').value.trim();
  const lines = ['*NOVO PEDIDO – GELA POINT*', ''];
  
  cart.forEach((item, i) => {
    lines.push(`*${i + 1}. ${item.product.name}* x${item.quantity}`);
    lines.push(`Detalhes: ${cartDescription(item)}`);
    lines.push(`Preço: ${money(itemPrice(item) * item.quantity)}`);
    lines.push('');
  });

  const total = cart.reduce((sum, item) => sum + itemPrice(item) * item.quantity, 0);
  lines.push(`*TOTAL: ${money(total)}*`, '', '*Entrega*', `Endereço: ${address} ${complement}`);
  
  window.open('https://wa.me/' + CONFIG.whatsappLoja + '?text=' + encodeURIComponent(lines.join('\n')));
});

renderMenu();
renderCart();