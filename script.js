// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ==========================================================================
// UTILITIES
// ==========================================================================
class TextSplitter {
    constructor(element, type = 'chars') {
        this.element = element;
        this.chars = [];
        this.originalText = element.innerText;
        this.split(type);
    }
    split(type) {
        const text = this.originalText;
        this.element.innerHTML = '';
        if (type === 'chars') {
            const words = text.split(' ');
            words.forEach((word, wordIndex) => {
                const wordSpan = document.createElement('span');
                wordSpan.style.display = 'inline-block';
                wordSpan.style.whiteSpace = 'nowrap';
                word.split('').forEach(char => {
                    const span = document.createElement('span');
                    span.innerText = char;
                    span.style.display = 'inline-block';
                    span.style.position = 'relative';
                    wordSpan.appendChild(span);
                    this.chars.push(span);
                });
                this.element.appendChild(wordSpan);
                if (wordIndex < words.length - 1) {
                    this.element.appendChild(document.createTextNode(' '));
                }
            });
        }
    }
}

function shuffleText(element, finalText, duration = 1) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const originalText = finalText || element.innerText;
    let iterations = 0;
    const interval = setInterval(() => {
        element.innerText = originalText.split('').map((letter, index) => {
            if (index < iterations) return originalText[index];
            return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        if (iterations >= originalText.length) clearInterval(interval);
        iterations += originalText.length / (duration * 30);
    }, 30);
}

// ==========================================================================
// TICKER — duplicate content for seamless loop
// ==========================================================================
const tickerContent = document.getElementById('ticker-content');
if (tickerContent) {
    const clone = tickerContent.cloneNode(true);
    clone.removeAttribute('id');
    clone.setAttribute('aria-hidden', 'true');
    tickerContent.parentNode.appendChild(clone);
}

// ==========================================================================
// LENIS SMOOTH SCROLL
// ==========================================================================
let lenis;
function initLenis() {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        smoothTouch: false,
    });
    lenis.stop();
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
}
initLenis();

// ==========================================================================
// NAV — hide on scroll down, reveal on scroll up
// ==========================================================================
let lastScrollY = 0;
let navHideTimer;
const nav = document.querySelector('.nav');

if (lenis) {
    lenis.on('scroll', ({ scroll }) => {
        const current = scroll;
        if (current > lastScrollY && current > 120) {
            nav.classList.add('hidden');
        } else {
            nav.classList.remove('hidden');
        }
        lastScrollY = current;
    });
}

// ==========================================================================
// PRELOADER
// ==========================================================================
let animationInitialized = false;

function revealSite() {
    const preloader = document.querySelector('.preloader');
    if (preloader) preloader.style.display = 'none';
    document.body.classList.remove('loading');
    if (lenis) lenis.start();
    if (!animationInitialized) {
        initScrollAnimations();
        animationInitialized = true;
    }
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
}

try {
    const masterTimeline = gsap.timeline({ onComplete: revealSite });

    // Terminal lines
    const terminalLines = document.querySelectorAll('.terminal-line');
    if (terminalLines.length > 0) {
        masterTimeline.to(terminalLines, { opacity: 1, stagger: 0.3, duration: 0.1 }, 0.2);
        masterTimeline.to('.terminal-line.success', { color: '#FFD700', duration: 0.2 }, 1.2);
    }

    // Brand shuffle
    const brandReveals = document.querySelectorAll('.brand-reveal');
    if (brandReveals.length > 0) {
        masterTimeline.call(() => {
            brandReveals.forEach(el => {
                gsap.to(el, { opacity: 1, duration: 0.1 });
                shuffleText(el, el.getAttribute('data-text'), 1.0);
            });
        }, null, 1.5);
    }

    // Progress bar
    masterTimeline.to('.loader-bar', { width: '100%', duration: 2.5, ease: 'power2.inOut' }, 0.5);

    // Drop
    masterTimeline.to('.preloader-terminal, .preloader-brand, .loader-progress', {
        y: -40, opacity: 0, duration: 0.5
    }, 3.0);
    masterTimeline.to('.preloader', { yPercent: -100, duration: 1, ease: 'power4.inOut' }, 3.2);

    // Hero entrance
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const lines = document.querySelectorAll('.hero-title .anim-text');
        lines.forEach(line => {
            gsap.set(line, { transform: 'none', y: 0, opacity: 1 });
            new TextSplitter(line, 'chars');
        });
        const chars = document.querySelectorAll('.hero-title .anim-text span span');
        if (chars.length > 0) {
            masterTimeline.from(chars, {
                y: 120, opacity: 0, rotateX: -90,
                stagger: 0.018, duration: 1.1,
                ease: 'back.out(1.7)', clearProps: 'all'
            }, 3.8);
        }
        masterTimeline.from('.hero-label .anim-text',       { y: '100%', duration: 0.8, ease: 'power3.out' }, 4.0);
        masterTimeline.from('.hero-description .anim-text', { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' }, 4.2);
        masterTimeline.from('.hero-actions .anim-text',     { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' }, 4.4);
        masterTimeline.from('.nav',                         { y: -80, opacity: 0, duration: 1, ease: 'power3.out' }, 4.0);
        masterTimeline.from('.hero-ticker',                 { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, 4.6);
        masterTimeline.to('.scroll-down',                   { opacity: 1, duration: 1 }, 5.0);
    }

} catch (error) {
    console.error('Animation Init Error:', error);
    revealSite();
}

// ==========================================================================
// CANVAS — particle field
// ==========================================================================
const canvas = document.getElementById('noise-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let width, height, particles = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.size = Math.random() * 1.5;
        this.alpha = Math.random() * 0.35 + 0.05;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
        ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = window.innerWidth < 768 ? 30 : 60;
    for (let i = 0; i < count; i++) particles.push(new Particle());
}

function animateCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
    ctx.strokeStyle = 'rgba(0,77,153,0.08)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            if (Math.sqrt(dx * dx + dy * dy) < 140) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateCanvas);
}

if (canvas) {
    window.addEventListener('resize', () => { resize(); initParticles(); });
    resize(); initParticles(); animateCanvas();
}

// ==========================================================================
// SCROLL ANIMATIONS
// ==========================================================================
function initScrollAnimations() {

    // Reveal text elements
    document.querySelectorAll('.reveal-text').forEach(el => {
        gsap.from(el, {
            y: 40, opacity: 0, duration: 1.1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
    });

    // Section headings
    document.querySelectorAll('.section-heading').forEach(el => {
        gsap.from(el, {
            y: 50, opacity: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
    });

    // Section labels
    document.querySelectorAll('.section-label').forEach(el => {
        gsap.from(el, {
            x: -20, opacity: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
    });

    // Pull quote
    document.querySelectorAll('.pull-quote').forEach(el => {
        gsap.from(el, {
            x: 30, opacity: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
    });

    // Expertise split panel entrance
    const expertiseSplit = document.querySelector('.expertise-split');
    if (expertiseSplit) {
        gsap.from(expertiseSplit, {
            y: 60, opacity: 0, duration: 1.1, ease: 'power3.out',
            scrollTrigger: { trigger: expertiseSplit, start: 'top 85%', once: true }
        });
    }

    // Stats counter
    document.querySelectorAll('.stat-num').forEach(stat => {
        ScrollTrigger.create({
            trigger: stat, start: 'top 85%', once: true,
            onEnter: () => {
                const target = +stat.getAttribute('data-target');
                gsap.to(stat, { innerText: target, duration: 2.2, snap: { innerText: 1 }, ease: 'power2.out' });
            }
        });
    });

    // Values horizontal scroll
    if (window.innerWidth > 900) {
        const track = document.querySelector('.horizontal-track');
        if (track) {
            gsap.to(track, {
                x: () => -(track.scrollWidth - window.innerWidth + 100),
                ease: 'none',
                scrollTrigger: {
                    trigger: '#values',
                    start: 'top top',
                    end: () => `+=${track.scrollWidth}`,
                    pin: true, scrub: 1, invalidateOnRefresh: true
                }
            });
        }
    }

    // CTA entrance
    const ctaTitle = document.querySelector('.cta-title');
    if (ctaTitle) {
        gsap.from(ctaTitle, {
            y: 60, opacity: 0, duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: '.cta', start: 'top 70%', once: true }
        });
    }
    const ctaBtn = document.querySelector('.btn-cta');
    if (ctaBtn) {
        gsap.from(ctaBtn, {
            y: 30, opacity: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: '.cta', start: 'top 65%', once: true, delay: 0.3 }
        });
    }
}

// ==========================================================================
// CURSOR
// ==========================================================================
const cursorDot    = document.querySelector('.cursor-dot');
const cursorCircle = document.querySelector('.cursor-circle');

if (window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
        gsap.to(cursorDot,    { x: e.clientX, y: e.clientY, duration: 0.1 });
        gsap.to(cursorCircle, { x: e.clientX, y: e.clientY, duration: 0.3 });
    });
    document.querySelectorAll('a, button, [data-hover]').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovered'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovered'));
    });
}

// ==========================================================================
// MAGNETIC BUTTONS
// ==========================================================================
document.querySelectorAll('.magnetic').forEach((magnet) => {
    magnet.addEventListener('mousemove', (e) => {
        const bound = magnet.getBoundingClientRect();
        const x = e.clientX - bound.left - bound.width / 2;
        const y = e.clientY - bound.top - bound.height / 2;
        gsap.to(magnet, { x: x * 0.35, y: y * 0.35, duration: 0.3, ease: 'power3.out' });
    });
    magnet.addEventListener('mouseleave', () => {
        gsap.to(magnet, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
    });
});

// ==========================================================================
// EXPERTISE SPLIT PANEL
// ==========================================================================
(function initExpertiseSplit() {
    const items    = document.querySelectorAll('.ei-item');
    const panels   = document.querySelectorAll('.ep-panel');
    const indicator = document.querySelector('.ei-indicator');

    if (!items.length || !panels.length) return;

    function positionIndicator(item) {
        if (!indicator) return;
        indicator.style.top    = item.offsetTop + 'px';
        indicator.style.height = item.offsetHeight + 'px';
    }

    function switchTo(index) {
        const current = document.querySelector('.ep-panel.active');
        const next    = panels[index];
        if (!next || next === current) return;

        // Update index buttons
        items.forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
            btn.setAttribute('aria-selected', i === index);
        });

        // Slide indicator
        positionIndicator(items[index]);

        // Transition panels with GSAP
        if (current) {
            gsap.to(current, {
                opacity: 0, y: -12, duration: 0.22, ease: 'power2.in',
                onComplete: () => {
                    current.classList.remove('active');
                    current.style.transform = '';
                    current.style.opacity   = '';
                }
            });
        }
        next.classList.add('active');
        gsap.fromTo(next,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', delay: 0.1 }
        );
    }

    items.forEach((btn, i) => {
        btn.addEventListener('click', () => switchTo(i));
        btn.addEventListener('mouseenter', () => switchTo(i));
    });

    // Set initial indicator position after layout
    requestAnimationFrame(() => positionIndicator(items[0]));
    window.addEventListener('resize', () => {
        const active = document.querySelector('.ei-item.active');
        if (active) positionIndicator(active);
    });
})();

// ==========================================================================
// MOBILE MENU
// ==========================================================================
const menuToggle = document.querySelector('.menu-toggle');
const navMenu    = document.querySelector('.nav-menu');
let isMenuOpen   = false;

function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    menuToggle.setAttribute('aria-expanded', isMenuOpen);
    if (isMenuOpen) {
        gsap.set(navMenu, {
            display: 'flex', position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100vh',
            backgroundColor: '#050a14', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            zIndex: 999, opacity: 0, gap: '2rem'
        });
        gsap.to(navMenu, { opacity: 1, duration: 0.3 });
        gsap.fromTo('.nav-link', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, delay: 0.15 });
        menuToggle.classList.add('active');
        if (lenis) lenis.stop();
    } else {
        gsap.to(navMenu, {
            opacity: 0, duration: 0.25,
            onComplete: () => {
                navMenu.style.display = 'none';
                if (window.innerWidth > 900) navMenu.style.cssText = '';
            }
        });
        menuToggle.classList.remove('active');
        if (lenis) lenis.start();
    }
}

if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => { if (isMenuOpen) toggleMenu(); });
    });
}

window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && isMenuOpen) {
        isMenuOpen = false;
        menuToggle.setAttribute('aria-expanded', 'false');
        navMenu.style.cssText = '';
        menuToggle.classList.remove('active');
        if (lenis) lenis.start();
    }
});

// ==========================================================================
// WCAG 2.2.2 PAUSE/STOP/HIDE — pause-toggle for auto-scrolling animations
// ==========================================================================
function bindPauseControl(toggleId, targetSelectors) {
    const btn = document.getElementById(toggleId);
    if (!btn) return;
    const targets = targetSelectors
        .map(sel => document.querySelector(sel))
        .filter(Boolean);
    btn.addEventListener('click', () => {
        const wasPaused = btn.getAttribute('aria-pressed') === 'true';
        const nowPaused = !wasPaused;
        btn.setAttribute('aria-pressed', nowPaused ? 'true' : 'false');
        const labelPrefix = btn.getAttribute('data-label-prefix') || 'Pause';
        btn.setAttribute('aria-label', nowPaused ? `Play ${labelPrefix.toLowerCase()}` : `${labelPrefix} ${labelPrefix.toLowerCase()}`);
        const icon = btn.querySelector('[aria-hidden="true"]');
        if (icon) icon.textContent = nowPaused ? '▶' : '❚❚';
        targets.forEach(el => {
            el.style.animationPlayState = nowPaused ? 'paused' : 'running';
        });
    });
}

bindPauseControl('ticker-toggle', ['.ticker-content']);
bindPauseControl('marquee-toggle', ['.marquee-track']);

// Set initial aria-label from data attribute (more readable than the JS branch above)
['ticker-toggle', 'marquee-toggle'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
        const prefix = id === 'ticker-toggle' ? 'Pause live ticker' : 'Pause marquee';
        btn.setAttribute('aria-label', prefix);
        btn.setAttribute('data-label-prefix', prefix);
    }
});
