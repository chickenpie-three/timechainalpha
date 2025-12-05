// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ==========================================================================
// UTILITIES (The "Engine Room")
// ==========================================================================

// Bespoke Text Splitter (replaces Club GreenSock SplitText)
class TextSplitter {
    constructor(element, type = 'chars') {
        this.element = element;
        this.chars = [];
        this.words = [];
        this.originalText = element.innerText;
        this.split(type);
    }

    split(type) {
        // Simple splitting logic for demo purposes
        // Preserves spaces and wraps characters
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
                    span.style.position = 'relative'; // Enable transforms
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

// Hacker Shuffle Effect
function shuffleText(element, finalText, duration = 1) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const originalText = finalText || element.innerText;
    let iterations = 0;
    
    const interval = setInterval(() => {
        element.innerText = originalText.split('')
            .map((letter, index) => {
                if (index < iterations) {
                    return originalText[index];
                }
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');
        
        if (iterations >= originalText.length) {
            clearInterval(interval);
        }
        
        iterations += originalText.length / (duration * 30); // 60fps approx
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

    // Stop Lenis during preloader
    lenis.stop();

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
}

// Initialize Lenis immediately
initLenis();

// ==========================================================================
// CINEMATIC PRELOADER (The "Entrance")
// ==========================================================================
const masterTimeline = gsap.timeline({
    onComplete: () => {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            preloader.style.display = 'none';
        }
        document.body.classList.remove('loading');
        // Enable Lenis scrolling after preloader
        if (lenis) {
            lenis.start();
        }
        // Refresh ScrollTrigger after preloader completes
        ScrollTrigger.refresh();
    }
});

// 1. Terminal Sequence
const terminalLines = document.querySelectorAll('.terminal-line');
masterTimeline
    .to(terminalLines, {
        opacity: 1,
        stagger: 0.5,
        duration: 0.1,
        onStart: function() {
            // Typing effect sound could go here
        }
    })
    .to('.terminal-line.success', {
        color: '#FFD700', // Gold color for success
        duration: 0.2
    });

// 2. Brand Reveal (Shuffle)
const brandReveals = document.querySelectorAll('.brand-reveal');
masterTimeline.call(() => {
    brandReveals.forEach(el => {
        gsap.to(el, { opacity: 1, duration: 0.1 });
        shuffleText(el, el.getAttribute('data-text'), 1.5);
    });
}, null, '+=0.2');

// 3. Loader Progress
masterTimeline
    .to('.loader-bar', {
        width: '100%',
        duration: 1.5,
        ease: 'power2.inOut'
    }, '+=0.5')
    
// 4. The Drop (Curtain Raise)
    .to('.preloader-terminal, .preloader-brand, .loader-progress', {
        y: -50,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1
    })
    .to('.preloader', {
        yPercent: -100,
        opacity: 0,
        duration: 1,
        ease: 'power4.inOut'
    });

// 5. Hero Entrance
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    // Split text manually
    const lines = document.querySelectorAll('.hero-title .anim-text');
    lines.forEach(line => {
        // Force reset transform before splitting to ensure visibility
        gsap.set(line, { transform: 'none', y: 0, opacity: 1 });
        new TextSplitter(line, 'chars');
    });

    const chars = document.querySelectorAll('.hero-title .anim-text span span'); // Nested spans from splitter
    
    masterTimeline.from(chars, {
        y: 100,
        opacity: 0,
        rotateX: -90,
        stagger: 0.02,
        duration: 1,
        ease: 'back.out(1.7)',
        clearProps: 'all'
    }, '-=0.5');
    
    // Other Hero Elements
    masterTimeline.from('.hero-label .anim-text', {
        y: '100%',
        duration: 0.8,
        ease: 'power3.out'
    }, '-=0.8');

    masterTimeline.from('.hero-description .anim-text', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, '-=0.6');

    masterTimeline.from('.hero-actions .anim-text', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, '-=0.6');
    
    masterTimeline.from('.nav', {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    }, '-=1');
    
    masterTimeline.to('.scroll-down', {
        opacity: 1,
        duration: 1
    }, '-=0.5');
}

// ==========================================================================
// INTERACTIVE CANVAS (The "Atmosphere")
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
    // Connections
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
// SCROLL INTERACTIONS (The "Journey")
// ==========================================================================

// Hero Background Parallax
const heroBg = document.querySelector('.hero-bg-image');
const heroPattern = document.querySelector('.hero-pattern');
if (heroBg) {
    gsap.to(heroBg, {
        yPercent: 30,
        scale: 1.1,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    });
}
if (heroPattern) {
    gsap.to(heroPattern, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    });
}

// Reveal Text on Scroll
document.querySelectorAll('.reveal-text').forEach(el => {
    gsap.from(el, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: el,
            start: 'top 85%',
        }
    });
});

// Card Stacking (Sticky Effect)
const cards = document.querySelectorAll('.card');
if (cards.length > 0) {
    cards.forEach((card, index) => {
        // Scale down previous cards when next card comes into view
        if (index < cards.length - 1) {
            ScrollTrigger.create({
                trigger: cards[index + 1],
                start: 'top 80%',
                end: 'top 20%',
                scrub: 1,
                onEnter: () => {
                    gsap.to(card, {
                        scale: 0.9 + (index * 0.02),
                        opacity: 0.5,
                        duration: 0.5,
                        ease: 'power2.out'
                    });
                },
                onLeaveBack: () => {
                    gsap.to(card, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.5,
                        ease: 'power2.out'
                    });
                }
            });
        }
        
        // Reveal animation for each card
        ScrollTrigger.create({
            trigger: card,
            start: 'top 90%',
            animation: gsap.from(card, {
                y: 100,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            }),
            once: true
        });
    });
}

// Stats Counter
const stats = document.querySelectorAll('.stat-num');
stats.forEach(stat => {
    ScrollTrigger.create({
        trigger: stat,
        start: 'top 85%',
        once: true,
        onEnter: () => {
            const target = +stat.getAttribute('data-target');
            gsap.to(stat, {
                innerText: target,
                duration: 2,
                snap: { innerText: 1 },
                ease: 'power2.out'
            });
        }
    });
});

// Horizontal Scroll
if (window.innerWidth > 768) {
    const track = document.querySelector('.horizontal-track');
    const wrapper = document.querySelector('.horizontal-scroll-wrapper');
    if (track && wrapper) {
        gsap.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth + 100),
            ease: 'none',
            scrollTrigger: {
                trigger: '#values',
                start: 'top top',
                end: () => `+=${track.scrollWidth}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true
            }
        });
    }
}

// ==========================================================================
// MICRO-INTERACTIONS
// ==========================================================================

// Custom Cursor
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

// Magnetic Buttons
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

// Mobile Menu
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
