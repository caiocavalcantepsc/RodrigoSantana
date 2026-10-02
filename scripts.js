const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

const onScrollNav = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
};
window.addEventListener('scroll', onScrollNav, { passive: true });
onScrollNav();

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
    });
});

const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
    if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
    }
    });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

const counters = document.querySelectorAll('.stat__num[data-count]');
const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.querySelector('.plus');
    const suffixHTML = suffix ? suffix.outerHTML : '';
    let cur = 0;
    const step = Math.max(1, Math.round(target / 60));
    const tick = () => {
    cur += step;
    if (cur >= target) {
        el.innerHTML = target + suffixHTML;
    } else {
        el.innerHTML = cur + suffixHTML;
        requestAnimationFrame(tick);
    }
    };
    tick();
};
const ioCount = new IntersectionObserver((entries) => {
    entries.forEach(e => {
    if (e.isIntersecting) {
        animateCount(e.target);
        ioCount.unobserve(e.target);
    }
    });
}, { threshold: 0.5 });
counters.forEach(c => ioCount.observe(c));

const projetoCards = document.querySelectorAll('.proj');

projetoCards.forEach(card => {
    const fotosRaw = card.dataset.fotos || '';
    const fotos = fotosRaw.split(',').map(s => s.trim()).filter(Boolean);
    const cover = card.querySelector('.cover');
    if (!cover || fotos.length === 0) return;

    // cria as camadas de imagem
    fotos.forEach((src, i) => {
    const layer = document.createElement('div');
    layer.className = 'layer' + (i === 0 ? ' on' : '');
    layer.style.backgroundImage = `url('${src}')`;
    cover.appendChild(layer);
    });

    // slideshow automático
    const layers = cover.querySelectorAll('.layer');
    if (layers.length > 1) {
    let idx = 0;
    setInterval(() => {
        layers[idx].classList.remove('on');
        idx = (idx + 1) % layers.length;
        layers[idx].classList.add('on');
    }, 4200);
    }

    // clique abre lightbox
    card.addEventListener('click', () => openLightbox(card, fotos));
});

const filtros = document.querySelectorAll('.proj-filtro');
const vazio = document.getElementById('projVazio');

filtros.forEach(btn => {
    btn.addEventListener('click', () => {
    filtros.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const cat = btn.dataset.filtro;
    let visiveis = 0;
    projetoCards.forEach(card => {
        const match = cat === 'todos' || card.dataset.cat === cat;
        card.style.display = match ? '' : 'none';
        if (match) visiveis++;
    });
    vazio.hidden = visiveis !== 0;
    });
});

const lb = document.getElementById('lb');
const lbImg = document.getElementById('lbImg');
const lbName = document.getElementById('lbName');
const lbCat = document.getElementById('lbCat');
const lbCount = document.getElementById('lbCount');
const lbThumbs = document.getElementById('lbThumbs');
const lbClose = document.getElementById('lbClose');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');

let currentFotos = [];
let currentIdx = 0;

function renderLightbox() {
    lbImg.src = currentFotos[currentIdx];
    lbCount.textContent = `${currentIdx + 1} / ${currentFotos.length}`;
    lbThumbs.querySelectorAll('img').forEach((t, i) => {
    t.classList.toggle('on', i === currentIdx);
    });
}

function openLightbox(card, fotos) {
    currentFotos = fotos;
    currentIdx = 0;
    const name = card.querySelector('.proj__title')?.textContent || 'Projeto';
    const cat = card.querySelector('.proj__cat')?.textContent || '';
    lbName.textContent = name;
    lbCat.textContent = cat;

    lbThumbs.innerHTML = '';
    fotos.forEach((src, i) => {
    const t = document.createElement('img');
    t.src = src;
    t.alt = `${name} — foto ${i + 1}`;
    t.addEventListener('click', () => {
        currentIdx = i;
        renderLightbox();
    });
    lbThumbs.appendChild(t);
    });

    renderLightbox();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
}

lbClose.addEventListener('click', closeLightbox);
lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
});
lbPrev.addEventListener('click', () => {
    currentIdx = (currentIdx - 1 + currentFotos.length) % currentFotos.length;
    renderLightbox();
});
lbNext.addEventListener('click', () => {
    currentIdx = (currentIdx + 1) % currentFotos.length;
    renderLightbox();
});
document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lbPrev.click();
    if (e.key === 'ArrowRight') lbNext.click();
});

document.getElementById('ano').textContent = new Date().getFullYear();