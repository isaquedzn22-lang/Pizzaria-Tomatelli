document.addEventListener('DOMContentLoaded', () => {
  const phone = '5513981310808';
  const defaultMessage = 'Olá! Vim pelo site e quero fazer um pedido na Tomatelli.';
  const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(defaultMessage)}`;

  ['waFooterBtn'].forEach(id => {
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

  const orderUrl = 'https://tomatellipizzaria.wabiz.delivery/';
  ['waHeaderBtn', 'waMobileBtn', 'waHeroBtn', 'waUnit1Btn', 'waUnit2Btn'].forEach(id => {
    const link = document.getElementById(id);
    if (link) link.href = orderUrl;
  });

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


