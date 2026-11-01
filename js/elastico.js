/* Botão elástico — mola de verdade (rigidez + amortecimento), não curva pronta.
   O botão oscila e assenta sozinho. Adaptado do efeito "14 · Botão elástico" (Não Codei).
   Uso: class="js-elastico" no botão. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var botoes = [].slice.call(document.querySelectorAll('.js-elastico'));
  if (!botoes.length) return;

  var RIGIDEZ = 0.22;      /* rigidez da mola */
  var AMORT = 0.72;        /* amortecimento */
  var PASSO = 1000 / 60;   /* a física roda em passos fixos de 60 Hz: em tela de 120/144 Hz
                              a mola oscila na mesma velocidade, em vez de ficar 2x mais rápida */
  var HOVER = 1.14, PRESS_MOUSE = 0.9, PRESS_TOQUE = 0.92, FOCO = 1.08;
  var REPOUSO = 0.0004;

  var estados = botoes.map(function (el) {
    el.classList.add('is-elastico');
    return { el: el, escala: 1, vel: 0, alvo: 1, ativo: false, sujo: false };
  });

  var id = null, ultimo = 0, resto = 0;

  function escrever(s) {
    /* em repouso sem escala, remove o transform: o botão volta ao render normal (texto nítido) */
    s.el.style.transform = (s.escala === 1 && s.alvo === 1) ? '' : 'scale(' + s.escala.toFixed(4) + ')';
  }

  function quadro(agora) {
    resto += Math.min(agora - ultimo, 100);   /* teto: aba em segundo plano não gera salto */
    ultimo = agora;
    var algumAtivo = false;
    while (resto >= PASSO) {
      resto -= PASSO;
      for (var i = 0; i < estados.length; i++) {
        var s = estados[i];
        if (!s.ativo) continue;
        s.sujo = true;
        s.vel = (s.vel + (s.alvo - s.escala) * RIGIDEZ) * AMORT;
        s.escala += s.vel;
        if (Math.abs(s.vel) < REPOUSO && Math.abs(s.alvo - s.escala) < REPOUSO) {
          s.escala = s.alvo; s.vel = 0; s.ativo = false;
        }
      }
    }
    for (var j = 0; j < estados.length; j++) {
      if (estados[j].sujo) { escrever(estados[j]); estados[j].sujo = false; }   /* só escreve quem se moveu */
      if (estados[j].ativo) algumAtivo = true;
    }
    /* o laço dorme quando todas as molas assentam */
    id = algumAtivo ? requestAnimationFrame(quadro) : null;
  }

  function mirar(s, alvo) {
    s.alvo = alvo;
    s.ativo = true;
    if (id === null) { ultimo = performance.now(); resto = 0; id = requestAnimationFrame(quadro); }
  }

  estados.forEach(function (s) {
    var el = s.el;
    var mouse = function (e) { return e.pointerType === 'mouse'; };
    var sobre = function () { return el.matches(':hover'); };

    el.addEventListener('pointerenter', function (e) { if (mouse(e)) mirar(s, HOVER); });
    el.addEventListener('pointerleave', function () { mirar(s, 1); });
    el.addEventListener('pointerdown', function (e) { mirar(s, mouse(e) ? PRESS_MOUSE : PRESS_TOQUE); });
    el.addEventListener('pointerup', function (e) { mirar(s, mouse(e) && sobre() ? HOVER : 1); });
    el.addEventListener('pointercancel', function () { mirar(s, 1); });
    /* teclado: o foco visível também ganha a resposta elástica */
    el.addEventListener('focus', function () { if (el.matches(':focus-visible')) mirar(s, FOCO); });
    el.addEventListener('blur', function () { mirar(s, sobre() ? HOVER : 1); });
  });
})();
