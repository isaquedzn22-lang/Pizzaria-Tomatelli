/* Cursor personalizado — ponto instantâneo + anel com atraso (lerp).
   Adaptado do efeito "09 · Cursor personalizado" (Não Codei).
   Só ativa em dispositivos com mouse; toque e teclado seguem intactos. */
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FATOR = reduzir ? 1 : 0.14;           /* o atraso do anel mora aqui */
  var ALVOS = 'a, button, .menu-tab, .btn, .hamburger, [role="tab"]';

  var lerp = function (a, b, t) { return a + (b - a) * t; };

  var raiz = document.createElement('div');
  raiz.className = 'cursor';
  raiz.setAttribute('aria-hidden', 'true');
  raiz.innerHTML = '<span class="cursor__ponto"><i></i></span><span class="cursor__anel"><i></i></span>';
  document.body.appendChild(raiz);

  var ponto = raiz.querySelector('.cursor__ponto');
  var anel = raiz.querySelector('.cursor__anel');

  var alvo = { x: 0, y: 0 };
  var atual = { x: 0, y: 0 };
  var dentro = false, id = null;

  function passo() {
    ponto.style.transform = 'translate3d(' + (alvo.x - 5) + 'px,' + (alvo.y - 5) + 'px,0)';
    atual.x = lerp(atual.x, alvo.x, FATOR);
    atual.y = lerp(atual.y, alvo.y, FATOR);
    anel.style.transform = 'translate3d(' + (atual.x - 19) + 'px,' + (atual.y - 19) + 'px,0)';
    /* o laço dorme quando o anel alcança o ponto — zero custo com o mouse parado */
    if (Math.abs(alvo.x - atual.x) < 0.1 && Math.abs(alvo.y - atual.y) < 0.1) { id = null; return; }
    id = requestAnimationFrame(passo);
  }
  function acordar() { if (id === null) id = requestAnimationFrame(passo); }

  document.addEventListener('mousemove', function (ev) {
    alvo.x = ev.clientX; alvo.y = ev.clientY;
    if (!dentro) {
      dentro = true;
      atual.x = alvo.x; atual.y = alvo.y;
      raiz.classList.add('is-ativo');
      document.documentElement.classList.add('has-cursor');
    }
    raiz.classList.toggle('is-sobre', !!(ev.target.closest && ev.target.closest(ALVOS)));
    acordar();
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', function () {
    dentro = false;
    raiz.classList.remove('is-ativo', 'is-sobre');
    document.documentElement.classList.remove('has-cursor');
  });

  document.addEventListener('mousedown', function () { raiz.classList.add('is-clique'); });
  document.addEventListener('mouseup', function () { raiz.classList.remove('is-clique'); });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && id !== null) { cancelAnimationFrame(id); id = null; }
  });
})();
