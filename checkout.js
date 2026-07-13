/* Complemento de entrega: R$ 3,00 ou retirada sem taxa. */
const TAXA_ENTREGA = 3;
const checkout = document.querySelector('#checkoutForm');
const formatMoney = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function subtotalAtual() {
  return cart.reduce((sum, item) => sum + itemPrice(item) * item.quantity, 0);
}
function entregaSelecionada() {
  return document.querySelector('input[name="deliveryType"]:checked').value === 'delivery';
}
function atualizarCheckout() {
  const entrega = entregaSelecionada();
  document.querySelector('#addressFields').style.display = entrega ? 'grid' : 'none';
  document.querySelector('#address').required = entrega;
  document.querySelector('#checkoutTotal').textContent = formatMoney(subtotalAtual() + (entrega ? TAXA_ENTREGA : 0));
}
document.querySelectorAll('input[name="deliveryType"]').forEach(input => input.addEventListener('change', atualizarCheckout));

/* Captura o envio antes da função original para acrescentar taxa/retirada. */
checkout.addEventListener('submit', event => {
  event.preventDefault();
  event.stopImmediatePropagation();
  const entrega = entregaSelecionada();
  const endereco = document.querySelector('#address').value.trim();
  const complemento = document.querySelector('#complement').value.trim();
  const subtotal = subtotalAtual();
  const total = subtotal + (entrega ? TAXA_ENTREGA : 0);
  const linhas = ['*NOVO PEDIDO - GELA POINT*', ''];
  cart.forEach((item, index) => {
    linhas.push('*' + (index + 1) + '. ' + item.product.name + '* x' + item.quantity + ' - ' + formatMoney(itemPrice(item) * item.quantity), 'Tamanho: ' + item.size.name);
    if (item.flavors.length) linhas.push('Sabores: ' + item.flavors.join(', '));
    if (item.optionals.length) linhas.push('Opcionais: ' + item.optionals.map(x => x.name).join(', '));
    if (item.extras.length) linhas.push('Adicionais: ' + item.extras.map(x => x.name).join(', '));
    linhas.push('');
  });
  linhas.push('Subtotal: ' + formatMoney(subtotal));
  if (entrega) linhas.push('Taxa de entrega: ' + formatMoney(TAXA_ENTREGA));
  linhas.push('*TOTAL: ' + formatMoney(total) + '*', '', entrega ? '*Entrega*' : '*Retirada no local*');
  if (entrega) {
    linhas.push('Endereço: ' + endereco);
    if (complemento) linhas.push('Complemento: ' + complemento);
  }
  window.open('https://wa.me/' + CONFIG.whatsappLoja + '?text=' + encodeURIComponent(linhas.join('\n')), '_blank', 'noopener');
}, true);

document.querySelector('#openCheckout').addEventListener('click', atualizarCheckout);
