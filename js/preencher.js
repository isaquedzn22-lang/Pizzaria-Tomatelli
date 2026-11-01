/* Texto que se preenche — as palavras acendem conforme a rolagem passa por elas,
   com uma zona de transição suave (3 palavras de degradê).
   Adaptado do efeito "04 · Texto que se preenche" (Não Codei).
   Uso: coloque class="js-pintar" num elemento com parágrafos dentro. */
(function () {
  var blocos = [].slice.call(document.querySelectorAll('.js-pintar'));
  if (!blocos.length) return;
  /* sem animação para quem pediu menos movimento: o texto fica inteiro legível */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var limitar = function (v, min, max) { return Math.max(min, Math.min(max, v)); };
  var APAGADO = 0.18;     /* opacidade da palavra ainda não lida */
  var DEGRADE = 3;        /* quantas palavras formam a zona de transição */

  blocos.forEach(function (bloco) {
    /* quebra em palavras só os nós de texto: nada de innerHTML, então links e <strong> sobrevivem */
    var palavras = [];
    var walker = document.createTreeWalker(bloco, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; }
    });
    var nos = [], n;
    while ((n = walker.nextNode())) nos.push(n);
    nos.forEach(function (no) {
      var frag = document.createDocumentFragment();
      no.nodeValue.split(/(\s+)/).forEach(function (parte) {
        if (!parte) return;
        if (/^\s+$/.test(parte)) { frag.appendChild(document.createTextNode(' ')); return; }
        var sp = document.createElement('span');
        sp.className = 'js-pintar__w';
        sp.textContent = parte;
        frag.appendChild(sp);
        palavras.push(sp);
      });
      no.parentNode.replaceChild(frag, no);
    });
    if (!palavras.length) return;
    bloco.classList.add('is-pronto');

    /* progresso 0→1: começa quando o topo do bloco passa de 88% da altura da tela
       e termina quando a base chega a 62%. O texto fica 100% aceso enquanto ainda
       está visível — usar o progresso "atravessando a tela" só acenderia tudo na saída. */
    function progresso() {
      var r = bloco.getBoundingClientRect();
      var vh = window.innerHeight || 800;
      var inicio = vh * 0.88;
      var faixa = inicio - (vh * 0.62 - r.height);
      return limitar((inicio - r.top) / faixa, 0, 1);
    }

    var visivel = false, agendado = false;
    function pintar() {
      agendado = false;
      var cursor = progresso() * (palavras.length + DEGRADE * 2) - DEGRADE;   /* margem antes e depois */
      for (var i = 0; i < palavras.length; i++) {
        var d = limitar((cursor - i) / DEGRADE, 0, 1);
        palavras[i].style.opacity = (APAGADO + d * (1 - APAGADO)).toFixed(3);
      }
    }
    function pedir() { if (visivel && !agendado) { agendado = true; requestAnimationFrame(pintar); } }

    /* só escuta a rolagem enquanto o bloco está perto da tela */
    var obs = new IntersectionObserver(function (e) {
      visivel = e[0].isIntersecting;
      pedir();
    }, { rootMargin: '10% 0px 10% 0px' });
    obs.observe(bloco);
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    pintar();
  });
})();
