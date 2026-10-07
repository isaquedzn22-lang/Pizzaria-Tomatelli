document.addEventListener('DOMContentLoaded', () => {
  const phone = '5513981310808';
  const defaultMessage = 'Olá! Vim pelo site e quero fazer um pedido na Tomatelli.';
  const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(defaultMessage)}`;

  ['waLocalBtn', 'waFooterBtn', 'waUnit1Btn', 'waUnit2Btn'].forEach(id => {
    const link = document.getElementById(id);
    if (link) link.href = waLink;
  });

  const mapLinks = {
    mapsUnit1Btn: 'Tomatelli Pizzaria, Estrada Gentil Peres 338, Jardim Umuarama, Itanhaém SP',
    mapsUnit2Btn: 'Tomatelli Pizzaria, Avenida Harry Forssell 1001, Belas Artes, Itanhaém SP'
  };
  Object.entries(mapLinks).forEach(([id, address]) => {
    const link = document.getElementById(id);
    if (link) link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const header = document.getElementById('siteHeader');
  const themeColor = document.getElementById('themeColor');
  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 40);
    if (themeColor) themeColor.setAttribute('content', '#080808');
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const mobileNav = document.getElementById('mobileNav');
  const openNavBtn = document.getElementById('hamburgerBtn');
  const closeNavBtn = document.getElementById('hamburgerCloseBtn');
  const closeNav = () => {
    mobileNav?.classList.remove('is-open');
    openNavBtn?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-locked');
  };
  openNavBtn?.addEventListener('click', () => {
    mobileNav?.classList.add('is-open');
    openNavBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-locked');
  });
  closeNavBtn?.addEventListener('click', closeNav);
  mobileNav?.querySelectorAll('[data-close]').forEach(link => link.addEventListener('click', closeNav));

  const tabs = document.querySelectorAll('.menu-tab');
  const panels = document.querySelectorAll('.menu-panel');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(item => {
      item.classList.toggle('is-active', item === tab);
      item.setAttribute('aria-selected', String(item === tab));
    });
    panels.forEach(panel => {
      const active = panel.dataset.panel === tab.dataset.tab;
      panel.classList.toggle('is-active', active);
      panel.toggleAttribute('hidden', !active);
    });
  }));

  const cart = [];
  const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const parsePrice = value => Number(value.replace(/[^\d,]/g, '').replace(',', '.'));
  const cartDialog = document.getElementById('cartDialog');
  const cartItems = document.getElementById('cartItems');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartCount = document.getElementById('cartCount');
  const totalRow = document.getElementById('cartTotalRow');
  const cartTotal = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const floatingCta = document.getElementById('floatingCta');
  const checkoutForm = document.getElementById('checkoutForm');
  const serviceType = document.getElementById('serviceType');
  const addressField = document.getElementById('addressField');
  const addressInput = addressField?.querySelector('input');

  const createText = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  };

  document.querySelectorAll('.menu-item').forEach((product, index) => {
    const name = product.querySelector('h4')?.textContent.trim();
    const priceRow = product.querySelector('.menu-item__price');
    const smallPrice = priceRow?.querySelector('span');
    const largePrice = priceRow?.querySelector('b');
    if (!name || !priceRow || !largePrice) return;

    const choices = smallPrice
      ? [
          { size: 'Média (6 fatias)', price: parsePrice(smallPrice.textContent) },
          { size: 'Grande (10 fatias)', price: parsePrice(largePrice.textContent) }
        ]
      : [{ size: 'Unidade', price: parsePrice(largePrice.textContent) }];

    const controls = document.createElement('div');
    controls.className = 'menu-item__order';
    const select = document.createElement('select');
    select.setAttribute('aria-label', `Tamanho de ${name}`);
    choices.forEach((choice, choiceIndex) => {
      const option = document.createElement('option');
      option.value = String(choiceIndex);
      option.textContent = `${choice.size} — ${money(choice.price)}`;
      select.append(option);
    });
    const addButton = createText('button', 'menu-add', 'Adicionar');
    addButton.type = 'button';
    addButton.setAttribute('aria-label', `Adicionar ${name} ao pedido`);
    addButton.addEventListener('click', () => {
      const choice = choices[Number(select.value)];
      const existing = cart.find(item => item.name === name && item.size === choice.size);
      if (existing) existing.quantity += 1;
      else cart.push({ id: `${index}-${choice.size}`, name, size: choice.size, price: choice.price, quantity: 1 });
      renderCart();
      addButton.textContent = 'Adicionado';
      window.setTimeout(() => { addButton.textContent = 'Adicionar'; }, 1000);
    });
    controls.append(select, addButton);
    product.querySelector('.menu-item__row')?.after(controls);
  });

  function renderCart() {
    cartItems.replaceChildren();
    const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartCount.textContent = String(quantity);
    cartEmpty.hidden = quantity > 0;
    totalRow.hidden = quantity === 0;
    checkoutBtn.disabled = quantity === 0;
    cartTotal.textContent = money(total);
    floatingCta.classList.toggle('is-visible', quantity > 0);

    cart.forEach(item => {
      const row = document.createElement('li');
      row.className = 'cart-line';
      const description = document.createElement('div');
      description.append(
        createText('div', 'cart-line__name', item.name),
        createText('div', 'cart-line__details', `${item.size} · ${money(item.price)} cada`)
      );
      const controls = document.createElement('div');
      controls.className = 'cart-line__controls';
      const decrement = createText('button', 'cart-qty-btn', '−');
      decrement.type = 'button';
      decrement.setAttribute('aria-label', `Remover uma unidade de ${item.name}`);
      decrement.addEventListener('click', () => {
        item.quantity -= 1;
        if (item.quantity <= 0) cart.splice(cart.indexOf(item), 1);
        renderCart();
      });
      const count = createText('span', 'cart-qty', String(item.quantity));
      const increment = createText('button', 'cart-qty-btn', '+');
      increment.type = 'button';
      increment.setAttribute('aria-label', `Adicionar uma unidade de ${item.name}`);
      increment.addEventListener('click', () => { item.quantity += 1; renderCart(); });
      controls.append(decrement, count, increment);
      row.append(description, controls);
      cartItems.append(row);
    });
  }

  document.getElementById('openCartBtn')?.addEventListener('click', () => cartDialog.showModal());
  document.getElementById('closeCartBtn')?.addEventListener('click', () => cartDialog.close());
  cartDialog?.addEventListener('click', event => {
    if (event.target === cartDialog) cartDialog.close();
  });

  serviceType?.addEventListener('change', () => {
    const delivery = serviceType.value === 'Entrega';
    addressField.hidden = !delivery;
    addressInput.required = delivery;
  });

  checkoutForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!cart.length || !checkoutForm.reportValidity()) return;
    const data = new FormData(checkoutForm);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const lines = cart.map(item => `- ${item.quantity}x ${item.name} (${item.size}) — ${money(item.price * item.quantity)}`);
    const details = [
      `Nome: ${data.get('customer')}`,
      `Unidade: ${data.get('unit')}`,
      `Pedido: ${data.get('service')}`,
      data.get('service') === 'Entrega' ? `Endereço: ${data.get('address')}` : '',
      data.get('notes') ? `Observação: ${data.get('notes')}` : ''
    ].filter(Boolean);
    const message = `Olá! Gostaria de fazer este pedido:\n\n${lines.join('\n')}\n\nTotal estimado: ${money(total)}\n\n${details.join('\n')}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  });

  renderCart();

  const hero = document.querySelector('.hero');
  if ('IntersectionObserver' in window && floatingCta && hero) {
    const observer = new IntersectionObserver(([entry]) => {
      if (cart.length) floatingCta.classList.toggle('is-visible', !entry.isIntersecting);
    }, { threshold: 0 });
    observer.observe(hero);
  }

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.section, .destaque, .location-card').forEach(element => {
      element.classList.add('reveal');
      revealObserver.observe(element);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
});
