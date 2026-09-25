// Minhas Finanças (AUVP) — LP interactions
document.addEventListener('DOMContentLoaded', () => {
  // ---------- Réplicas do app: montadas no tamanho real e reduzidas por zoom ----------
  // Cada `.app-fit` declara em data-w as larguras de projeto, da maior para a
  // menor. Vale a primeira que ainda caiba com zoom >= 0.5; a menor liga a
  // variante `.compact` (sem sidebar, grades em uma coluna), como o app faz
  // abaixo de lg. data-h, opcional, fixa a altura por largura (captura de
  // tela): recorta o que passar e o fundo do app preenche o que faltar; 0
  // deixa a altura livre naquela largura.
  function fitApp(fit) {
    const app = fit.firstElementChild;
    const avail = fit.clientWidth;
    if (!app || !avail) return;
    const widths = (fit.dataset.w || '1200').split(',').map(Number);
    const heights = (fit.dataset.h || '').split(',').filter(Boolean).map(Number);
    let index = widths.findIndex((w) => avail / w >= 0.5);
    if (index === -1) index = widths.length - 1;
    const width = widths[index];
    app.style.width = width + 'px';
    app.style.zoom = String(avail / width);
    app.classList.toggle('compact', widths.length > 1 && index === widths.length - 1);
    if (heights.length) {
      const height = heights[index] ?? heights[heights.length - 1];
      app.style.height = height ? height + 'px' : '';
    }
  }
  const fits = document.querySelectorAll('.app-fit');
  fits.forEach(fitApp);
  if ('ResizeObserver' in window) {
    const fitRO = new ResizeObserver((entries) => entries.forEach((entry) => fitApp(entry.target)));
    fits.forEach((fit) => fitRO.observe(fit));
  } else {
    window.addEventListener('resize', () => fits.forEach(fitApp));
  }

  // ---------- Animação de barras, donut e metas dentro de um painel ----------
  function animateVisuals(root) {
    if (!root) return;
    root.querySelectorAll('.bars .bar').forEach((bar) => {
      if (bar.dataset.animated) return;
      const finalHeight = bar.style.height;
      if (!finalHeight) return;
      bar.dataset.animated = 'true';
      bar.style.height = '0%';
      requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.height = finalHeight; }));
    });
    root.querySelectorAll('.donut, .usage-donut, .a-usage-donut').forEach((donut) => donut.classList.add('grown'));
    root.querySelectorAll('[data-goal]').forEach((fill) => {
      if (fill.dataset.animated) return;
      fill.dataset.animated = 'true';
      const target = fill.dataset.goal;
      requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = target + '%'; }));
    });
  }

  // ---------- Scroll reveal ----------
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          animateVisuals(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
    revealEls.forEach((el) => animateVisuals(el));
  }

  // ---------- Narrativa com scroll interativo ----------
  const narrativeItems = document.querySelectorAll('.narrative-item');
  const narrativePanels = document.querySelectorAll('.narrative-panel');
  if (narrativeItems.length && narrativePanels.length) {
    const setActive = (target) => {
      narrativeItems.forEach((it) => it.classList.toggle('active', it.dataset.target === target));
      narrativePanels.forEach((p) => {
        const isActive = p.dataset.panel === target;
        p.classList.toggle('active', isActive);
        if (isActive) animateVisuals(p);
      });
    };
    if ('IntersectionObserver' in window) {
      const narrativeIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.dataset.target);
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      narrativeItems.forEach((it) => narrativeIO.observe(it));

      // Em uma coluna cada imagem fica acima do seu texto (narrative.css):
      // anima cada painel quando ele entra na tela.
      const panelIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && window.matchMedia('(max-width: 900px)').matches) animateVisuals(entry.target);
        });
      }, { threshold: 0.25 });
      narrativePanels.forEach((p) => panelIO.observe(p));
    }
    animateVisuals(document.querySelector('.narrative-panel.active'));
  }

  // ---------- Tour de produto (tabs) ----------
  const tabs = document.querySelectorAll('.tour-tab');
  const panels = document.querySelectorAll('.tour-panel');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.querySelector(`.tour-panel[data-panel="${target}"]`);
      panel?.classList.add('active');
      animateVisuals(panel);
    });
  });
  animateVisuals(document.querySelector('.tour-panel.active'));

  // ---------- Contadores animados (prova social) ----------
  function animateCount(el) {
    const target = parseFloat(el.dataset.countTo);
    if (Number.isNaN(target)) return;
    const decimals = (el.dataset.countTo.split('.')[1] || '').length;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = target * eased;
      el.textContent = prefix + val.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const countEls = document.querySelectorAll('[data-count-to]');
  if (countEls.length) {
    if ('IntersectionObserver' in window) {
      const countIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      countEls.forEach((el) => countIO.observe(el));
    } else {
      countEls.forEach(animateCount);
    }
  }

  // ---------- Camadas do hero: tilt no dashboard e parallax nos cards ----------
  // Cada card flutuante é uma camada com profundidade própria (data-depth):
  // quanto maior, mais ele se desloca em relação ao dashboard.
  const heroVisual = document.querySelector('.hero-visual');
  const heroFrame = heroVisual?.querySelector('.frame');
  if (heroVisual && heroFrame && window.matchMedia('(hover: hover)').matches) {
    heroVisual.addEventListener('mousemove', (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateY = px * 10;
      const rotateX = -py * 10;
      heroFrame.style.transform = `rotate(0.4deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      heroVisual.querySelectorAll('.float-card').forEach((card) => {
        const depth = Number(card.dataset.depth) || 20;
        card.style.transform = `translate3d(${px * depth}px, ${py * depth}px, 0) rotate(${px * depth * 0.08}deg)`;
      });
    });
    heroVisual.addEventListener('mouseleave', () => {
      heroFrame.style.transform = 'rotate(0.4deg)';
      heroVisual.querySelectorAll('.float-card').forEach((card) => { card.style.transform = ''; });
    });
  }
  setTimeout(() => animateVisuals(heroVisual), 250);

  // ---------- Menu mobile ----------
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }));
  }

  // ---------- Sombra no header ao rolar ----------
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
});
