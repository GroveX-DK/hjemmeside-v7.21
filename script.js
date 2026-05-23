/* grovex-shared.js */
(function () {
  const finePointer = window.matchMedia('(pointer: fine)');

  // ── CURSOR (kun fin pointer — undgår unødig logik på touch) ──
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');
  let mx=0,my=0,rx=0,ry=0;
  if (finePointer.matches && cursor && ring) {
    document.addEventListener('mousemove', e => {
      mx=e.clientX; my=e.clientY;
      cursor.style.left=mx+'px'; cursor.style.top=my+'px';
    });
    (function animRing(){
      rx+=(mx-rx)*.12; ry+=(my-ry)*.12;
      ring.style.left=rx+'px'; ring.style.top=ry+'px';
      requestAnimationFrame(animRing);
    })();
    document.querySelectorAll('a,button').forEach(el=>{
      el.addEventListener('mouseenter',()=>{ cursor.style.width='18px';cursor.style.height='18px';ring.style.width='60px';ring.style.height='60px'; });
      el.addEventListener('mouseleave',()=>{ cursor.style.width='10px';cursor.style.height='10px';ring.style.width='40px';ring.style.height='40px'; });
    });
  }

  // ── HEADER SCROLL ──
  const header = document.getElementById('header');
  if (header) window.addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>10));

  // ── MOBILE DRAWER ──
  const hamburger  = document.getElementById('hamburger');
  const mobDrawer  = document.getElementById('mobDrawer');
  const mobOverlay = document.getElementById('mobOverlay');
  if (hamburger && mobDrawer && mobOverlay) {
    hamburger.addEventListener('click',()=>{ mobDrawer.classList.toggle('open'); mobOverlay.classList.toggle('open'); });
    mobOverlay.addEventListener('click',()=>{ mobDrawer.classList.remove('open'); mobOverlay.classList.remove('open'); });
  }

  // ── SCROLL REVEAL ──
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: .1 });
  document.querySelectorAll('.reveal').forEach(r=>revObs.observe(r));

  // ── COUNT UP ──
  function countUp(el){
    const target=parseInt(el.dataset.target); const dur=1600; const fps=60; const total=dur/(1000/fps);
    let frame=0; const ease=t=>t<.5?2*t*t:-1+(4-2*t)*t;
    const c=setInterval(()=>{ frame++; el.textContent=Math.round(target*ease(frame/total)); if(frame>=total){el.textContent=target;clearInterval(c);} },1000/fps);
  }
  const cntObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ countUp(e.target); cntObs.unobserve(e.target); } });
  },{ threshold:.5 });
  document.querySelectorAll('.countup').forEach(el=>cntObs.observe(el));

  // ── HERO CARD 3D TILT (kun mus) ──
  const heroCard = document.getElementById('heroCard');
  if (finePointer.matches && heroCard) {
    const wrap = heroCard.parentElement;
    wrap.addEventListener('mousemove',e=>{
      const rect=heroCard.getBoundingClientRect();
      const rx2=((e.clientY-rect.top-rect.height/2)/rect.height)*-10;
      const ry2=((e.clientX-rect.left-rect.width/2)/rect.width)*8;
      heroCard.style.animation='none'; heroCard.style.transform=`rotateX(${rx2}deg) rotateY(${ry2}deg)`;
    });
    wrap.addEventListener('mouseleave',()=>{ heroCard.style.animation=''; heroCard.style.transform=''; });
  }

  // ── SERVICE CARD 3D TILT (kun mus) ──
  if (finePointer.matches) {
    document.querySelectorAll('.svc-card').forEach(card=>{
      card.addEventListener('mousemove',e=>{
        const rect=card.getBoundingClientRect();
        const rx2=((e.clientY-rect.top-rect.height/2)/rect.height)*-6;
        const ry2=((e.clientX-rect.left-rect.width/2)/rect.width)*6;
        card.style.transform=`translateY(-8px) rotateX(${rx2}deg) rotateY(${ry2}deg)`;
      });
      card.addEventListener('mouseleave',()=>{ card.style.transform=''; });
    });
  }

  // ── CONTACT FORM ──
  // ── Supabase config ──────────────────────────────────────────────
const SUPABASE_URL = 'https://sfizsksfaefpjojttewj.supabase.co';       // ← din projekt-URL
const SUPABASE_KEY = 'sb_publishable_pAq9oX16HJU3Hp6HR0bNJw_9wHtFtuV';                     // ← din anon/public API-nøgle
const TABLE_NAME   = 'MODE_BOOKINGER';                   // ← navn på din tabel

// ── Formular submit ──────────────────────────────────────────────
const cform = document.getElementById('contactForm');
if (cform) {
  cform.addEventListener('submit', async e => {
    e.preventDefault();
    const btn    = cform.querySelector('.cform-btn');
    const status = document.getElementById('formStatus');
    btn.disabled = true; btn.textContent = 'Sender...';

    const fd = new FormData(cform);
    const payload = {
      NAVN:    fd.get('name'),
      VIRKSOMHED: fd.get('company'),
      TELEFON:   fd.get('phone'),
      EMAIL:   fd.get('email'),
      DATO:    fd.get('date'),
      TIDSPUNKT:    fd.get('time'),
    };

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'apikey':         SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer':         'return=minimal',   // returnér ikke rækken, blot 201
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        status.textContent = 'Tak! Vi kontakter dig snarest.';
        status.style.color = '#34d399';
        cform.reset();
      } else {
        const err = await res.json();
        console.error('Supabase fejl:', err);
        status.textContent = 'Noget gik galt – prøv igen.';
        status.style.color = '#f87171';
      }
    } catch {
      status.textContent = 'Kunne ikke sende. Prøv igen.';
      status.style.color = '#f87171';
    } finally {
      btn.disabled = false; btn.textContent = 'Send besked →';
    }
  });
  }
})();
