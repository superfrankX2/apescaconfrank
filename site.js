/* ============================================================
   A PESCA CON FRANK — shared behaviour
   ============================================================ */

/* Nav background on scroll */
(function(){
  var header = document.getElementById('nav');
  if(!header) return;
  function onScroll(){
    if(header.classList.contains('solid')) return;
    if(window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
})();

/* Mobile nav burger */
(function(){
  document.querySelectorAll('.nav-burger').forEach(function(btn){
    btn.addEventListener('click', function(){
      var header = btn.closest('.nav');
      var links = header.querySelector('.nav-links');
      links.classList.toggle('open');
      header.classList.toggle('menu-open');
    });
  });
  document.querySelectorAll('.nav-links a').forEach(function(a){
    a.addEventListener('click', function(){
      var header = a.closest('.nav');
      header.querySelector('.nav-links').classList.remove('open');
      header.classList.remove('menu-open');
    });
  });
})();

/* Reveal on scroll */
(function(){
  var els = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){
    els.forEach(function(el){ el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:.15, rootMargin:'0px 0px -40px 0px'});
  els.forEach(function(el){ io.observe(el); });
})();

/* Image fallback */
(function(){
  document.querySelectorAll('img').forEach(function(img){
    img.addEventListener('error', function(){
      img.style.background = '#141816';
    }, {once:true});
  });
})();

/* Contact form -> WhatsApp */
function sendWa(e){
  e.preventDefault();
  var form = e.target;
  var nome = form.nome ? form.nome.value : '';
  var tel = form.tel ? form.tel.value : '';
  var tecnica = form.tecnica ? form.tecnica.value : '';
  var quando = form.quando ? form.quando.value : '';
  var msg = form.msg ? form.msg.value : '';

  var lines = ['Ciao Frank, sono ' + nome + '.'];
  if(tecnica) lines.push('Sono interessato a: ' + tecnica + '.');
  if(quando) lines.push('Periodo/data preferita: ' + quando + '.');
  if(tel) lines.push('Il mio numero: ' + tel + '.');
  if(msg) lines.push(msg);

  var text = encodeURIComponent(lines.join('%0A').split('%0A').join('\n'));
  window.open('https://wa.me/393882496553?text=' + text, '_blank', 'noopener');
  return false;
}

/* Scroll progress line (the "lenza") */
(function(){
  var line = document.createElement('div');
  line.className = 'scroll-line';
  line.setAttribute('aria-hidden','true');
  document.body.appendChild(line);
  function upd(){
    var h = document.documentElement.scrollHeight - window.innerHeight;
    line.style.width = (h > 0 ? Math.min(100, window.scrollY / h * 100) : 0) + '%';
  }
  upd();
  window.addEventListener('scroll', upd, {passive:true});
  window.addEventListener('resize', upd);
})();

/* Mobile sticky contact bar: WhatsApp (same message as the page's floating button) + call */
(function(){
  var fab = document.querySelector('.fab');
  if(!fab) return;
  var ico = fab.querySelector('svg') ? fab.querySelector('svg').outerHTML : '';
  var bar = document.createElement('div');
  bar.className = 'mbar';
  bar.innerHTML =
    '<a class="mb-wa" href="' + fab.getAttribute('href') + '" target="_blank" rel="noopener">' + ico + 'Scrivimi su WhatsApp</a>' +
    '<a class="mb-tel" href="tel:+393882496553" aria-label="Chiamami"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z"/></svg></a>';
  document.body.appendChild(bar);
  document.body.classList.add('has-mbar');
  var contact = document.getElementById('contatti');
  function upd(){
    var show = window.scrollY > 320;
    if(show && contact){
      var r = contact.getBoundingClientRect();
      if(r.top < window.innerHeight * .6 && r.bottom > 0) show = false; /* hide over the contact form */
    }
    bar.classList.toggle('show', show);
  }
  upd();
  window.addEventListener('scroll', upd, {passive:true});
})();
