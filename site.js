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
