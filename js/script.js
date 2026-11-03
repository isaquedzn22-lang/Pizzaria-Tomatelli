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

  const menuTabs = document.getElementById('menuTabs');
  const menuPanels = document.getElementById('menuPanels');
  const menuSearch = document.getElementById('menuSearch');
  const menuCategories = window.TOMATELLI_CARDAPIO?.categories;
  if (menuTabs && menuPanels && Array.isArray(menuCategories)) {
    const formatPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const tabs = [];
    const panels = [];
    menuPanels.replaceChildren();

    const filterMenuPanel = (panel, query) => {
      if (!panel) return;
      let visibleItems = 0;
      panel.querySelectorAll('.menu-group').forEach(group => {
        let groupItems = 0;
        group.querySelectorAll('.menu-item').forEach(item => {
          const matches = item.textContent.toLocaleLowerCase('pt-BR').includes(query);
          item.hidden = !matches;
          if (matches) groupItems++;
        });
        group.hidden = groupItems === 0;
        visibleItems += groupItems;
      });
      const noResults = panel.querySelector('.menu-no-results');
      if (noResults) noResults.hidden = !query || visibleItems > 0;
    };

    const activateMenuCategory = activeIndex => {
      tabs.forEach((tab, index) => {
        const active = index === activeIndex;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel, index) => {
        const active = index === activeIndex;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
      if (menuSearch) {
        menuSearch.value = '';
      }
      filterMenuPanel(panels[activeIndex], '');
    };

    menuCategories.forEach((category, index) => {
      const tabId = `menu-tab-${index}`;
      const panelId = `menu-panel-${index}`;
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'menu-tab';
      tab.id = tabId;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panelId);
      tab.setAttribute('aria-selected', 'false');
      tab.tabIndex = -1;
      tab.textContent = category.name;
      tab.addEventListener('click', () => activateMenuCategory(index));
      tab.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
          (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        tabs[nextIndex].focus();
        activateMenuCategory(nextIndex);
      });
      menuTabs.append(tab);
      tabs.push(tab);

      const panel = document.createElement('div');
      panel.className = 'menu-panel';
      panel.id = panelId;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabId);
      panel.tabIndex = 0;

      if (!category.groups?.length) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'menu-empty';
        emptyMessage.textContent = 'Sem itens disponíveis no delivery nesta categoria no momento.';
        panel.append(emptyMessage);
      }

      (category.groups || []).forEach(group => {
        const groupElement = document.createElement('section');
        groupElement.className = 'menu-group';
        if (group.name) {
          const groupTitle = document.createElement('h3');
          groupTitle.className = 'menu-group-title';
          groupTitle.textContent = group.name.trim();
          groupElement.append(groupTitle);
        }

        const list = document.createElement('ul');
        list.className = 'menu-list';
        group.items.forEach(item => {
          const row = document.createElement('li');
          row.className = 'menu-item';
          const headingRow = document.createElement('div');
          headingRow.className = 'menu-item__row';
          const title = document.createElement('h4');
          title.textContent = item.name;
          headingRow.append(title);
          if (item.isNew) {
            const badge = document.createElement('span');
            badge.className = 'menu-item__badge';
            badge.textContent = 'Novo';
            headingRow.append(badge);
          }
          const price = document.createElement('div');
          price.className = 'menu-item__price';
          const amount = document.createElement('b');
          amount.textContent = formatPrice.format(item.price);
          price.append(amount);
          headingRow.append(price);
          row.append(headingRow);
          if (item.details?.trim()) {
            const details = document.createElement('p');
            details.textContent = item.details.trim();
            row.append(details);
          }
          list.append(row);
        });
        groupElement.append(list);
        panel.append(groupElement);
      });
      if (category.groups?.length) {
        const noResults = document.createElement('p');
        noResults.className = 'menu-no-results';
        noResults.hidden = true;
        noResults.textContent = 'Nenhum item encontrado com essa busca.';
        panel.append(noResults);
      }

      menuPanels.append(panel);
      panels.push(panel);
    });
    menuSearch?.addEventListener('input', () => {
      const activePanel = panels.find(panel => panel.classList.contains('is-active'));
      filterMenuPanel(activePanel, menuSearch.value.trim().toLocaleLowerCase('pt-BR'));
    });
    if (tabs.length) activateMenuCategory(0);
  } else if (menuPanels) {
    menuPanels.textContent = 'Não foi possível carregar o cardápio agora. Acesse o delivery para ver os itens atualizados.';
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
    // O cardápio não depende da animação de entrada: mantém a seção acessível em celulares.
    document.querySelectorAll('.section:not(#cardapio), .destaque, .location-card').forEach(element => {
      element.classList.add('reveal');
      revealObserver.observe(element);
    });
  }

  const reviewsCarousel = document.querySelector('.reviews-carousel');
  const reviewsTrack = reviewsCarousel?.querySelector('.reviews-track');
  const reviewsSet = reviewsTrack?.querySelector('.reviews-set');
  if (reviewsCarousel && reviewsTrack && reviewsSet) {
    const duplicateSet = reviewsSet.cloneNode(true);
    duplicateSet.setAttribute('aria-hidden', 'true');
    duplicateSet.querySelectorAll('a').forEach(link => link.setAttribute('tabindex', '-1'));
    reviewsTrack.append(duplicateSet);

    let setWidth = 0;
    let offset = 0;
    let frame = 0;
    let previousTime = 0;
    let pointerId = null;
    let pointerStart = 0;
    let offsetStart = 0;
    let dragged = false;
    let suppressClick = false;

    const wrapOffset = value => setWidth ? ((value % setWidth) + setWidth) % setWidth : 0;
    const paintTrack = () => {
      reviewsTrack.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };
    const measureTrack = () => {
      setWidth = reviewsSet.getBoundingClientRect().width;
      offset = wrapOffset(offset);
      paintTrack();
    };
    const animateTrack = time => {
      if (document.hidden) return;
      if (previousTime && pointerId === null) {
        offset = wrapOffset(offset + (time - previousTime) * 0.03);
        paintTrack();
      }
      previousTime = time;
      frame = requestAnimationFrame(animateTrack);
    };

    reviewsCarousel.addEventListener('pointerdown', event => {
      if (event.button !== undefined && event.button !== 0) return;
      pointerId = event.pointerId;
      pointerStart = event.clientX;
      offsetStart = offset;
      dragged = false;
      previousTime = 0;
    });
    window.addEventListener('pointermove', event => {
      if (event.pointerId !== pointerId) return;
      const distance = event.clientX - pointerStart;
      if (Math.abs(distance) > 5) {
        dragged = true;
        reviewsCarousel.classList.add('is-dragging');
        event.preventDefault();
      }
      if (dragged) {
        offset = wrapOffset(offsetStart - distance);
        paintTrack();
      }
    }, { passive: false });
    const finishDrag = event => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      reviewsCarousel.classList.remove('is-dragging');
      previousTime = 0;
      if (dragged) {
        suppressClick = true;
        window.setTimeout(() => { suppressClick = false; }, 0);
      }
    };
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);
    reviewsCarousel.addEventListener('click', event => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
    reviewsCarousel.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      offset = wrapOffset(offset + (event.key === 'ArrowRight' ? 100 : -100));
      paintTrack();
      previousTime = 0;
    });

    window.addEventListener('resize', measureTrack, { passive: true });
    document.fonts?.ready.then(measureTrack);
    document.addEventListener('visibilitychange', () => {
      previousTime = 0;
      if (!document.hidden) frame = requestAnimationFrame(animateTrack);
    });
    measureTrack();
    frame = requestAnimationFrame(animateTrack);
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
});


