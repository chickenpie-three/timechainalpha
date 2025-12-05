// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ==========================================================================
// UTILITIES (The "Engine Room")
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
                const chars = word.split('');
                chars.forEach(char => {
                    const span = document.createElement('span');
                    span.innerText = char;
                    span.style.display = 'inline-block';
                    span.style.position = 'relative'; 
                    wordSpan.appendChild(span);
                    this.chars.push(span);
                });
                this.element.appendChild(wordSpan);
                if (wordIndex < words.length - 1) {
                    const space = document.createTextNode(' ');
                    this.element.appendChild(space);
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
        element.innerText = originalText.split('')
            .map((letter, index) => {
                if (index < iterations) return originalText[index];
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');
        if (iterations >= originalText.length) clearInterval(interval);
        iterations += originalText.length / (duration * 30);
    }, 30);
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
    lenis.stop(); // Stop during preloader
    
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
}
initLenis();

// ==========================================================================
// CINEMATIC PRELOADER (The "Entrance")
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
    ScrollTrigger.refresh();
}

try {
    const masterTimeline = gsap.timeline({
        onComplete: revealSite
    });

    // 1. Terminal Sequence (0s - 1.5s)
    const terminalLines = document.querySelectorAll('.terminal-line');
    if (terminalLines.length > 0) {
        masterTimeline.to(terminalLines, { opacity: 1, stagger: 0.3, duration: 0.1 }, 0.2);
        masterTimeline.to('.terminal-line.success', { color: '#FFD700', duration: 0.2 }, 1.2);
    }

    // 2. Brand Reveal (1.5s - 2.5s)
    const brandReveals = document.querySelectorAll('.brand-reveal');
    if (brandReveals.length > 0) {
        masterTimeline.call(() => {
            brandReveals.forEach(el => {
                gsap.to(el, { opacity: 1, duration: 0.1 });
                shuffleText(el, el.getAttribute('data-text'), 1.0);
            });
        }, null, 1.5);
    }

    // 3. Loader Progress (0.5s - 3.0s)
    masterTimeline.to('.loader-bar', { width: '100%', duration: 2.5, ease: 'power2.inOut' }, 0.5);

    // 4. The Drop (3.0s - 4.0s) - ABSOLUTE TIMING ensures it runs
    masterTimeline.to('.preloader-terminal, .preloader-brand, .loader-progress', { 
        y: -50, opacity: 0, duration: 0.5 
    }, 3.0);
    
    masterTimeline.to('.preloader', { 
        yPercent: -100, duration: 1, ease: 'power4.inOut' 
    }, 3.2);

    // 5. Hero Entrance (Starts at 3.8s)
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
                y: 100, opacity: 0, rotateX: -90, stagger: 0.02, duration: 1, ease: 'back.out(1.7)', clearProps: 'all'
            }, 3.8);
        }
        
        masterTimeline.from('.hero-label .anim-text', { y: '100%', duration: 0.8, ease: 'power3.out' }, 4.0);
        masterTimeline.from('.hero-description .anim-text', { y: 50, opacity: 0, duration: 0.8, ease: 'power3.out' }, 4.2);
        masterTimeline.from('.hero-actions .anim-text', { y: 50, opacity: 0, duration: 0.8, ease: 'power3.out' }, 4.4);
        masterTimeline.from('.nav', { y: -100, opacity: 0, duration: 1, ease: 'power3.out' }, 4.0);
        masterTimeline.to('.scroll-down', { opacity: 1, duration: 1 }, 5.0);
    }

} catch (error) {
    console.error("Animation Init Error:", error);
    revealSite(); // Emergency unlock
}

// ==========================================================================
// INTERACTIVE CANVAS
// ==========================================================================
const canvas = document.getElementById('noise-canvas');
const ctx = canvas.getContext('2d');
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
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 2;
        this.alpha = Math.random() * 0.5;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = window.innerWidth < 768 ? 40 : 80;
    for (let i = 0; i < count; i++) particles.push(new Particle());
}

function animateCanvas() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
    ctx.strokeStyle = 'rgba(0, 77, 153, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            if (Math.sqrt(dx*dx + dy*dy) < 150) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateCanvas);
}

window.addEventListener('resize', () => { resize(); initParticles(); });
resize(); initParticles(); animateCanvas();

// ==========================================================================
// SCROLL INTERACTIONS
// ==========================================================================
function initScrollAnimations() {
    // Parallax
    const heroBg = document.querySelector('.hero-bg-image');
    const heroPattern = document.querySelector('.hero-pattern');
    if (heroBg) {
        gsap.to(heroBg, {
            yPercent: 30, scale: 1.1, ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });
    }
    if (heroPattern) {
        gsap.to(heroPattern, {
            yPercent: 20, ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });
    }

    // Reveal Text
    document.querySelectorAll('.reveal-text').forEach(el => {
        gsap.from(el, {
            y: 50, opacity: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
        });
    });

    // Card Stacking (Sticky)
    const cards = document.querySelectorAll('.card');
    if (cards.length > 0) {
        cards.forEach((card, index) => {
            if (index < cards.length - 1) {
                ScrollTrigger.create({
                    trigger: cards[index + 1],
                    start: 'top 80%',
                    end: 'top 20%',
                    scrub: true,
                    onEnter: () => gsap.to(card, { scale: 0.9, opacity: 0.5, duration: 0.5 }),
                    onLeaveBack: () => gsap.to(card, { scale: 1, opacity: 1, duration: 0.5 })
                });
            }
            ScrollTrigger.create({
                trigger: card, start: 'top 90%', once: true,
                animation: gsap.from(card, { y: 100, opacity: 0, duration: 1, ease: 'power3.out' })
            });
        });
    }

    // Stats
    const stats = document.querySelectorAll('.stat-num');
    stats.forEach(stat => {
        ScrollTrigger.create({
            trigger: stat, start: 'top 85%', once: true,
            onEnter: () => {
                const target = +stat.getAttribute('data-target');
                gsap.to(stat, { innerText: target, duration: 2, snap: { innerText: 1 }, ease: 'power2.out' });
            }
        });
    });

    // Horizontal Scroll
    if (window.innerWidth > 768) {
        const track = document.querySelector('.horizontal-track');
        if (track) {
            gsap.to(track, {
                x: () => -(track.scrollWidth - window.innerWidth + 100),
                ease: 'none',
                scrollTrigger: {
                    trigger: '#values', start: 'top top', end: () => `+=${track.scrollWidth}`, 
                    pin: true, scrub: 1, invalidateOnRefresh: true
                }
            });
        }
    }
}

// ==========================================================================
// MICRO-INTERACTIONS
// ==========================================================================
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');
const cursorCircle = document.querySelector('.cursor-circle');

if (window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener('mousemove', (e) => {
        gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.1 });
        gsap.to(cursorCircle, { x: e.clientX, y: e.clientY, duration: 0.3 });
    });
    document.querySelectorAll('a, button, [data-hover]').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovered'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovered'));
    });
}

document.querySelectorAll('.magnetic').forEach((magnet) => {
    magnet.addEventListener('mousemove', (e) => {
        const bound = magnet.getBoundingClientRect();
        const x = e.clientX - bound.left - bound.width / 2;
        const y = e.clientY - bound.top - bound.height / 2;
        gsap.to(magnet, { x: x * 0.4, y: y * 0.4, duration: 0.3, ease: 'power3.out' });
        gsap.to(magnet.querySelector('span'), { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: 'power3.out' });
    });
    magnet.addEventListener('mouseleave', () => {
        gsap.to(magnet, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
        gsap.to(magnet.querySelector('span'), { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
    });
});

const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
let isMenuOpen = false;

function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
        gsap.set(navMenu, { display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: '#050a14', flexDirection: 'column', justifyContent: 'center', zIndex: 99, opacity: 0 });
        gsap.to(navMenu, { opacity: 1, duration: 0.3 });
        gsap.fromTo('.nav-link', { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.2 });
        menuToggle.classList.add('active');
    } else {
        gsap.to(navMenu, { opacity: 0, duration: 0.3, onComplete: () => { navMenu.style.display = 'none'; if (window.innerWidth > 768) navMenu.style = ''; } });
        menuToggle.classList.remove('active');
    }
}
if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => { if (isMenuOpen) toggleMenu(); });
    });
}

window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && isMenuOpen) {
        isMenuOpen = false;
        navMenu.style = '';
        menuToggle.classList.remove('active');
    }
});
