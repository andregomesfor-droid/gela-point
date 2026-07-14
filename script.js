/*
  ===== CARDÁPIO EDITÁVEL =====
  Edite somente este arquivo para alterar produtos, imagens, preços, sabores,
  opcionais e adicionais. Para foto real, substitua o emoji por uma URL em "image".
*/
const CONFIG = {
  whatsappLoja: '5585988792889', // DDI + DDD + número, sem símbolos
  sizes: [
    { name: 'Pequeno', label: '300 ml', extra: 0 },
    { name: 'Médio', label: '500 ml', extra: 4 },
    { name: 'Grande', label: '700 ml', extra: 9 }
  ],
  flavors: ['Chocolate', 'Morango', 'Baunilha', 'Flocos', 'Limão', 'Coco'], // sabores de sorvete
  optionals: [
    { name: 'Leite em pó', price: 2.5 }, { name: 'Leite condensado', price: 2.5 },
    { name: 'Calda de chocolate', price: 2 }, { name: 'Calda de morango', price: 2 },
    { name: 'Calda de caramelo', price: 2 }
  ],
  extras: [
    { name: 'Granola', price: 2 }, { name: 'Paçoca', price: 2 }, { name: 'Banana', price: 2 },
    { name: 'Morango', price: 3 }, { name: 'Kiwi', price: 3.5 }, { name: 'Uva', price: 3 },
    { name: 'Manga', price: 3 }, { name: 'Coco ralado', price: 2 }, { name: 'Castanha', price: 3 },
    { name: 'Confetes', price: 2.5 }, { name: 'Ovomaltine', price: 3.5 }, { name: 'Nutella', price: 4 },
    { name: 'Amendoim', price: 2 }
  ],
  products: [
    { id:'acai-tradicional', category:'acai', name:'Açaí Tradicional', description:'Açaí cremoso e refrescante.', price:12.9, image:'🍧', promo:true },
    { id:'acai-banana', category:'acai', name:'Açaí com Banana', description:'Açaí batido com banana de verdade.', price:14.9, image:'🍌' },
    { id:'acai-nutella', category:'acai', name:'Açaí com Nutella', description:'Cremosidade com muita Nutella.', price:17.9, image:'🍫', promo:true },
    { id:'sorvete-copo', category:'sorvete', name:'Sorvete no Copo', description:'Até 2 sabores para você escolher.', price:10.9, image:'🍨' },
    { id:'sorvete-cascao', category:'sorvete', name:'Sorvete Casquinha', description:'Crocante e com sabor à escolha.', price:8.9, image:'🍦' },
    { id:'sorvete-sundae', category:'sorvete', name:'Sundae Especial', description:'Sorvete, calda e muito sabor.', price:13.9, image:'🍒', promo:true }
  ]
};
const cart = [];
let activeProduct = null;
const $ = selector => document.querySelector(selector);
const money = value => value.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
const byId = id => CONFIG.products.find(product => product.id === id);
const itemPrice = item => item.base + item.size.extra + item.optionals.reduce((sum,x)=>sum+x.price,0) + item.extras.reduce((sum,x)=>sum+x.price,0);

function productCard(product) {
  return '<article class="product"><div class="product-image">'+product.image+'<small>Foto do produto</small></div><div class="product-info"><h4>'+product.name+'</h4><p>'+product.description+'</p><div class="product-bottom"><strong>A partir de '+money(product.price)+'</strong><button class="add-product" data-product="'+product.id+'" aria-label="Personalizar '+product.name+'">+</button></div></div></article>';
}
function renderMenu() {
  $('#acaiList').innerHTML = CONFIG.products.filter(x=>x.category==='acai').map(productCard).join('');
  $('#iceCreamList').innerHTML = CONFIG.products.filter(x=>x.category==='sorvete').map(productCard).join('');
  $('#promoList').innerHTML = CONFIG.products.filter(x=>x.promo).slice(0,2).map((p,i)=>'<article class="promo"><span class="tag">OFERTA ESPECIAL</span><h3>'+p.name+'</h3><p>'+p.description+'</p><strong>A partir de '+money(p.price)+'</strong><span class="promo-emoji">'+(i?'🍦':'🍧')+'</span></article>').join('');
}
function choices(list, group, type) {
  return list.map((item,index)=>{
    const name = typeof item === 'string' ? item : item.name, price = typeof item === 'string' ? 0 : item.price;
    return '<label class="choice"><input type="'+type+'" name="'+group+'" value="'+index+'" '+(type==='radio'&&index===0?'checked':'')+'>'+name+(price?'<strong>+'+money(price)+'</strong>':'')+'</label>';
  }).join('');
}
function openProduct(id) {
  activeProduct = byId(id); const product = activeProduct; const isIceCream = product.category === 'sorvete';
  $('#productContent').innerHTML = '<header><div class="modal-icon">'+product.image+'</div><div><h2>'+product.name+'</h2><p>'+product.description+'</p></div></header>'
   +'<section class="custom-section"><h3>Tamanho</h3><p>Escolha o tamanho ideal.</p><div class="choices" id="sizeChoices">'+choices(CONFIG.sizes,'size','radio')+'</div></section>'
   +(isIceCream?'<section class="custom-section"><h3>Sabores</h3><p>Escolha até 2 sabores.</p><div class="choices" id="flavorChoices">'+choices(CONFIG.flavors,'flavor','checkbox')+'</div></section>':'')
   +'<section class="custom-section"><h3>Opcionais</h3><p>Deixe ainda mais gostoso.</p><div class="choices" id="optionalChoices">'+choices(CONFIG.optionals,'optional','checkbox')+'</div></section>'
   +'<section class="custom-section"><h3>Adicionais</h3><p>Selecione os seus favoritos.</p><div class="choices" id="extraChoices">'+choices(CONFIG.extras,'extra','checkbox')+'</div></section>'
   +'<div class="modal-total"><span>Total do item</span><strong id="modalTotal">'+money(product.price)+'</strong></div><button class="button primary modal-add" id="addToCart">Adicionar à sacola <span>+</span></button>';
  $('#productModal').showModal();
  $('#productContent').querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>{ if(input.name==='flavor' && document.querySelectorAll('input[name="flavor"]:checked').length>2) input.checked=false; updateModalTotal(); }));
  $('#addToCart').onclick = addConfiguredItem;
}
function configuredItem() {
  const selected = group => [...document.querySelectorAll('input[name="'+group+'"]:checked')].map(input=>Number(input.value));
  return { product:activeProduct, base:activeProduct.price, size:CONFIG.sizes[selected('size')[0]||0], flavors:selected('flavor').map(i=>CONFIG.flavors[i]), optionals:selected('optional').map(i=>CONFIG.optionals[i]), extras:selected('extra').map(i=>CONFIG.extras[i]), quantity:1 };
}
function updateModalTotal(){ if(activeProduct) $('#modalTotal').textContent=money(itemPrice(configuredItem())); }
function addConfiguredItem(){ cart.push(configuredItem()); renderCart(); $('#productModal').close(); openDrawer(); }
function cartDescription(item){ return [item.size.name+(item.flavors.length?' • '+item.flavors.join(', '):''), item.optionals.map(x=>x.name).join(', '), item.extras.map(x=>x.name).join(', ')].filter(Boolean).join('<br>'); }
function renderCart() {
 const total = cart.reduce((sum,item)=>sum+itemPrice(item)*item.quantity,0);
 $('#cartCount').textContent=cart.reduce((sum,item)=>sum+item.quantity,0); $('#cartTotal').textContent=money(total); $('#openCheckout').disabled=!cart.length;
 $('#cartItems').innerHTML = cart.length ? cart.map((item,i)=>'<article class="cart-item"><div class="cart-item-top"><h4>'+item.product.name+'</h4><strong>'+money(itemPrice(item)*item.quantity)+'</strong></div><p>'+cartDescription(item)+'</p><div class="quantity"><button data-action="minus" data-index="'+i+'">−</button><span>'+item.quantity+'</span><button data-action="plus" data-index="'+i+'">+</button><button class="remove" data-action="remove" data-index="'+i+'">Remover</button></div></article>').join('') : '<div class="empty"><span>◒</span><p>Sua sacola está vazia.</p><small>Escolha um produto para começar!</small></div>';
}
function openDrawer(){ $('#cartDrawer').classList.add('open'); $('#overlay').classList.add('show'); }
function closeDrawer(){ $('#cartDrawer').classList.remove('open'); $('#overlay').classList.remove('show'); }
document.addEventListener('click', event=>{
 const button=event.target.closest('[data-product]'); if(button) openProduct(button.dataset.product);
 const action=event.target.dataset.action, index=Number(event.target.dataset.index); if(action){ if(action==='plus')cart[index].quantity++; if(action==='minus'&&cart[index].quantity>1)cart[index].quantity--; if(action==='remove')cart.splice(index,1); renderCart(); }
});
$('#openCart').onclick=openDrawer; $('.close-drawer').onclick=closeDrawer; $('#overlay').onclick=closeDrawer;
document.querySelectorAll('.modal-close').forEach(button=>button.onclick=()=>button.closest('dialog').close());
$('#openCheckout').onclick=()=>$('#checkoutModal').showModal();
$('#checkoutForm').addEventListener('submit', event=>{
 event.preventDefault(); const address=$('#address').value.trim(), complement=$('#complement').value.trim(), total=cart.reduce((sum,item)=>sum+itemPrice(item)*item.quantity,0);
 const lines=['*NOVO PEDIDO — GELA POINT*',''];
 cart.forEach((item,i)=>{lines.push('*'+(i+1)+'. '+item.product.name+'* x'+item.quantity+' — '+money(itemPrice(item)*item.quantity),'Tamanho: '+item.size.name);if(item.flavors.length)lines.push('Sabores: '+item.flavors.join(', '));if(item.optionals.length)lines.push('Opcionais: '+item.optionals.map(x=>x.name).join(', '));if(item.extras.length)lines.push('Adicionais: '+item.extras.map(x=>x.name).join(', '));lines.push('')});
 lines.push('*TOTAL: '+money(total)+'*','','*Entrega*','Endereço: '+address);if(complement)lines.push('Complemento: '+complement);
 window.open('https://wa.me/'+CONFIG.whatsappLoja+'?text='+encodeURIComponent(lines.join('\n')),'_blank','noopener');
});
renderMenu(); renderCart();
